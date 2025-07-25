from flask_mail import Message, Mail
from flask import Blueprint, request, jsonify, session, send_file, url_for
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, date
from sqlalchemy import text, func, or_, and_
import pandas as pd
import io
import os
import secrets
from sqlalchemy.dialects.postgresql import ARRAY  # Pastikan ini di-import
from error import error_d
import random
from shapely.geometry import shape, Point
import geopandas as gpd
# from seed import generate_fake_data

from models import db, User, PasswordResetToken, Lansia, KesehatanLansia, KesejahteraanSosial, KeluargaPendamping, ADailyLiving

bcrypt = Bcrypt()
mail = Mail()
api = Blueprint('api', __name__)

def send_reset_email(user_email, url):
    """Send password reset email with a bright theme"""
    try:
        msg = Message(
            subject='🔐 Password Reset Request - CipamokolanDataKu',
            recipients=[user_email],
            html=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #e0f7fa 0%, #fffde7 100%); padding: 20px; border-radius: 15px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00796b; font-size: 2rem;">🏠 CipamokolanDataKu</h1>
                    <h2 style="color: #388e3c;">Reset Your Password</h2>
                </div>
                
                <div style="background: #ffffff; padding: 25px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                    <p style="color: #37474f; font-size: 1.1rem; line-height: 1.6;">
                        Hello! 👋
                    </p>
                    <p style="color: #37474f; line-height: 1.6;">
                        We received a request to reset your password for your CipamokolanDataKu account.
                        If you made this request, click the button below to reset your password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{url}" style="
                            background: linear-gradient(45deg, #4db6ac, #81c784);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: 600;
                            font-size: 1.1rem;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        ">🔓 Reset Password</a>
                    </div>
                    
                    <p style="color: #616161; line-height: 1.6; font-size: 0.9rem;">
                        ⏰ <strong>This link will expire in 1 hour</strong> for security reasons.
                    </p>
                    
                    <p style="color: #616161; line-height: 1.6; font-size: 0.9rem;">
                        If you didn't request this password reset, you can safely ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; color: #90a4ae; font-size: 0.8rem;">
                    <p>This is an automated message from CipamokolanDataKu</p>
                    <p>Please do not reply to this email</p>
                </div>
            </div>
            '''
        )
        

        mail.send(message=msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def dataQuery():
    if 'role' not in session:
        raise PermissionError("Role not found in session")

    role = session['role']
    query = Lansia.query

    if role in ['kelurahan', 'admin', 'superadmin']:
        return query

    try:
        return query.filter_by(rw=role)
    except ValueError:
        raise ValueError("Invalid role for rw filtering")
    
def load_rw_polygons(geojson_path):
    gdf = gpd.read_file(geojson_path)
    polygons = {}
    for _, row in gdf.iterrows():
        rw = str(row.get("rw") or row.get("properties", {}).get("rw") or row.get("name"))
        if rw:
            polygons[rw] = row.geometry
    return polygons
    
def generate_random_point_in_polygon(polygon):
    minx, miny, maxx, maxy = polygon.bounds
    for _ in range(1000):  # max 1000 attempts
        p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
        if polygon.contains(p):
            return p
    return None

# Helper function to check if user is logged in
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# @api.before_request
# def before_request():
#     query = Lansia.query.first()
#     print(query.kelompokUsia)

# @api.route('/bulkdata', methods=['GET'])
# def bulkdata():
#     generate_fake_data(1000)
#     return jsonify({'message': 'Bulk data seeded successfully'}), 200

# Authentication routes
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        session.permanent = True
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@api.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'})

@api.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            })
    
    return jsonify({'authenticated': False}), 401

@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email not found'}), 404
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)
    
    # Use frontend URL
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/forgot-password?token={token}"
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.session.add(reset_token)
    db.session.commit()
    
    if not send_reset_email(user_email=email, url=reset_link):
        return jsonify({
            'message': 'Gagal Terkirim'
        }), 400
    
    return jsonify({
        'message': 'Password reset token generated',
        'token': token  # Remove this in production
    })
    
@api.route('/reset-password', methods=['PUT'])
def reset_password():
    data = request.get_json()
    
    token = data.get('token')
    password = data.get('password')
    
    usedToken = PasswordResetToken.query.filter(PasswordResetToken.token == token).first()
    usedToken.used = True
    
    user = User.query.get(usedToken.user_id)
    print(user.password_hash)
    user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    print(user.password_hash)
    
    db.session.commit()
    print(user.password_hash)

    return jsonify({
        'message': 'Password berhasil diubah',
        'token': token,
        'password': password
    })



# Data routes
@api.route('/lansia', methods=['GET'])
@login_required
def get_lansia():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    gender_filter = request.args.get('gender', '', type=str)
    age_group_filter = request.args.get('age_group', '', type=str)
    rw_filter = request.args.get('rw', '', type=str)
    sort_by = request.args.get('sort_by', 'nama_lengkap', type=str)
    sort_order = request.args.get('sort_order', 'asc', type=str)
    dateReference = request.args.get('date', '')
    session['dateReference'] = datetime.strptime(dateReference, '%Y-%m-%d').date()
    
    query = Lansia.query.first()
    # Build query
    query = dataQuery()
    
    # Apply search filter
    if search:
        search_filter = or_(
            Lansia.nama_lengkap.ilike(f'%{search}%'),
            Lansia.nik.ilike(f'%{search}%'),
            Lansia.alamat_lengkap.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)
    
    # Apply other filters
    if gender_filter:
        query = query.filter(Lansia.jenis_kelamin == gender_filter)
    
    if age_group_filter:
        query = query.filter(Lansia.kelompokUsia == age_group_filter)

    if rw_filter:
        query = query.filter(Lansia.rw == rw_filter)
    
    
    
    # Apply sorting
    valid_sort_columns = ['nama_lengkap', 'nik', 'usia', 'jenis_kelamin', 'rt', 'rw']
    if sort_by in valid_sort_columns:
        column = getattr(Lansia, sort_by)
        if sort_order.lower() == 'desc':
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    
    # Paginate results
    lansia_list = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'data': [{
            'id': l.id,
            'nama_lengkap': l.nama_lengkap,
            'nik': l.nik,
            'jenis_kelamin': l.jenis_kelamin,
            'usia': l.usia(session.get('dateReference')),
            'rt': l.rt,
            'rw': l.rw,
            'kelompok_usia': l.kelompokUsiaReference(session.get('dateReference')),
            'nilai_adl': l.daily_living.calculateCategory(),
            'status_perkawinan': l.status_perkawinan,
            'koordinat':l.koordinat,
        } for l in lansia_list.items],
        'total': lansia_list.total,
        'pages': lansia_list.pages,
        'current_page': page,
        'per_page': per_page
    })

@api.route('/lansia', methods=['POST'])
@login_required
def create_lansia():
    data = request.get_json()
    try:
        # Check if NIK already exists
        existing = Lansia.query.filter_by(nik=str(data['nik'])).first()
        if existing:
            return jsonify({'message': f'Error: NIK {data['nik']}  sudah terdaftar'}), 400
        
        # Create main lansia record
        lansia_data = {
            'nama_lengkap': data.get('nama_lengkap'),
            'nik': data.get('nik'),
            'jenis_kelamin': data.get('jenis_kelamin'),
            'tanggal_lahir': datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date() if data.get('tanggal_lahir') else None,
            'alamat_lengkap': data.get('alamat_lengkap'),
            'rt': data.get('rt'),
            'rw': data.get('rw'),
            'status_perkawinan': data.get('status_perkawinan'),
            'agama': data.get('agama'),
            'pendidikan_terakhir': data.get('pendidikan_terakhir'),
            'pekerjaan_terakhir': data.get('pekerjaan_terakhir'),
            'sumber_penghasilan': data.get('sumber_penghasilan')
        }
        
        lansia = Lansia(**lansia_data)
        db.session.add(lansia)
        db.session.flush()  # Get the ID without committing
        
        # Create health record if data exists
        if any(data.get(key) for key in ['kondisi_kesehatan_umum', 'riwayat_penyakit_kronis', 'status_gizi']):
            kesehatan = KesehatanLansia(
                lansia_id=lansia.id,
                kondisi_kesehatan_umum=data.get('kondisi_kesehatan_umum'),
                riwayat_penyakit_kronis=data.get('riwayat_penyakit_kronis', []),
                penggunaan_obat_rutin=data.get('penggunaan_obat_rutin'),
                alat_bantu=data.get('alat_bantu', []),
                aktivitas_fisik=data.get('aktivitas_fisik'),
                status_gizi=data.get('status_gizi'),
                riwayat_imunisasi=data.get('riwayat_imunisasi', [])
            )
            db.session.add(kesehatan)
        
        # Create social welfare record if data exists
        if any(data.get(key) for key in ['dukungan_keluarga', 'kondisi_rumah', 'kebutuhan_mendesak']):
            kesejahteraan = KesejahteraanSosial(
                lansia_id=lansia.id,
                dukungan_keluarga=data.get('dukungan_keluarga'),
                kondisi_rumah=data.get('kondisi_rumah'),
                kebutuhan_mendesak=data.get('kebutuhan_mendesak', []),
                hobi_minat=data.get('hobi_minat'),
                kondisi_psikologis=data.get('kondisi_psikologis')
            )
            db.session.add(kesejahteraan)
        
        # Create family record if data exists
        if data.get('nama_pendamping'):
            keluarga = KeluargaPendamping(
                lansia_id=lansia.id,
                nama_pendamping=data.get('nama_pendamping'),
                hubungan_dengan_lansia=data.get('hubungan_dengan_lansia'),
                tanggal_lahir_pendamping=datetime.strptime(data['tanggal_lahir_pendamping'], '%Y-%m-%d').date() if data.get('tanggal_lahir_pendamping') else None,
                pendidikan_pendamping=data.get('pendidikan_pendamping'),
                ketersediaan_waktu=data.get('ketersediaan_waktu'),
                partisipasi_program_bkl=data.get('partisipasi_program_bkl'),
                riwayat_partisipasi_bkl=data.get('riwayat_partisipasi_bkl'),
                keterlibatan_data=data.get('keterlibatan_data'),
            )
            db.session.add(keluarga)
            
        adl = ADailyLiving(
            lansia_id=lansia.id,
            bab = data.get('bab'),
            membersihkan_diri = data.get('membersihkan_diri'),
            toilet = data.get('toilet'),
            makan = data.get('makan'),
            pindah_tempat = data.get('pindah_tempat'),
            mobilitas = data.get('mobilitas'),
            berpakaian = data.get('berpakaian'),
            naik_turun_tangga = data.get('naik_turun_tangga'),
            mandi = data.get('mandi'),
            total = data.get('total'),
        )
        
        adl.calculate_total()
        
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil ditambahkan', 'id': lansia.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400

@api.route('/lansia/<int:lansia_id>', methods=['GET'])
@login_required
def get_lansia_detail(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    
    # Get related data using relationships
    kesehatan = lansia.kesehatan
    kesejahteraan = lansia.kesejahteraan
    keluarga = lansia.keluarga
    daily_living = lansia.daily_living
    
    
    return jsonify({
        'id': lansia.id,
        'nama_lengkap': lansia.nama_lengkap,
        'nik': lansia.nik,
        'jenis_kelamin': lansia.jenis_kelamin,
        'tanggal_lahir': lansia.tanggal_lahir.isoformat() if lansia.tanggal_lahir else None,
        'usia': lansia.usia(session.get('dateReference')),
        'kelompok_usia': lansia.kelompokUsiaReference(session.get('dateReference')),
        'alamat_lengkap': lansia.alamat_lengkap,
        'koordinat':lansia.koordinat,
        'rt': lansia.rt,
        'rw': lansia.rw,
        'status_perkawinan': lansia.status_perkawinan,
        'agama': lansia.agama,
        'pendidikan_terakhir': lansia.pendidikan_terakhir,
        'pekerjaan_terakhir': lansia.pekerjaan_terakhir,
        'sumber_penghasilan': lansia.sumber_penghasilan,
        'kesehatan': {
            'kondisi_kesehatan_umum': kesehatan.kondisi_kesehatan_umum if kesehatan else None,
            'riwayat_penyakit_kronis': kesehatan.riwayat_penyakit_kronis if kesehatan else [],
            'penggunaan_obat_rutin': kesehatan.penggunaan_obat_rutin if kesehatan else None,
            'alat_bantu': kesehatan.alat_bantu if kesehatan and kesehatan.alat_bantu else [],
            'aktivitas_fisik': kesehatan.aktivitas_fisik if kesehatan else None,
            'status_gizi': kesehatan.status_gizi if kesehatan else None,
            'riwayat_imunisasi': kesehatan.riwayat_imunisasi if kesehatan else None,
        } if kesehatan else None,
        'kesejahteraan': {
            'dukungan_keluarga': kesejahteraan.dukungan_keluarga if kesejahteraan else None,
            'kondisi_rumah': kesejahteraan.kondisi_rumah if kesejahteraan else None,
            'kebutuhan_mendesak': kesejahteraan.kebutuhan_mendesak if kesejahteraan else [],
            'hobi_minat': kesejahteraan.hobi_minat if kesejahteraan else None,
            'kondisi_psikologis': kesejahteraan.kondisi_psikologis if kesejahteraan else None,
        } if kesejahteraan else None,
        'keluarga': {
            'nama_pendamping': keluarga.nama_pendamping if keluarga else None,
            'hubungan_dengan_lansia': keluarga.hubungan_dengan_lansia if keluarga else None,
            'tanggal_lahir_pendamping': keluarga.tanggal_lahir_pendamping.isoformat() if keluarga.tanggal_lahir_pendamping else None,
            'usia': keluarga.usia(session.get('dateReference')),
            'pendidikan_pendamping': keluarga.pendidikan_pendamping if keluarga else None,
            'ketersediaan_waktu': keluarga.ketersediaan_waktu if keluarga else None,
            'partisipasi_program_bkl': keluarga.partisipasi_program_bkl if keluarga else None,
            'riwayat_partisipasi_bkl': keluarga.riwayat_partisipasi_bkl if keluarga else None,
            'keterlibatan_data': keluarga.keterlibatan_data if keluarga else None,
        } if keluarga else None,
        'daily_living': {
            'bab': daily_living.bab if daily_living else None,
            'bak': daily_living.bak if daily_living else None,
            'membersihkan_diri': daily_living.membersihkan_diri if daily_living else None,
            'toilet': daily_living.toilet if daily_living else None,
            'makan': daily_living.makan if daily_living else None,
            'pindah_tempat': daily_living.pindah_tempat if daily_living else None,
            'mobilitas': daily_living.mobilitas if daily_living else None,
            'berpakaian': daily_living.berpakaian if daily_living else None,
            'naik_turun_tangga': daily_living.naik_turun_tangga if daily_living else None,
            'total': daily_living.total if daily_living else None,
        } if daily_living else None,
    })

@api.route('/lansia/<int:lansia_id>', methods=['PUT'])
@login_required
def update_lansia(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    data = request.get_json()
    
    # for key, value in data.items():
        # print(key, value)
    
    if any(value == None for value in data.values()):
        return jsonify({'message': f'Error: Terdapat data yang kosong'}), 400
    
    try:
        # data['tanggal_lahir'] = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
        # data['tanggal_lahir'] = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
            
        # Update main lansia record
        lansia.nama_lengkap = data.get('nama_lengkap')
        lansia.nik = data.get('nik')
        lansia.jenis_kelamin = data.get('jenis_kelamin')
        lansia.tanggal_lahir = data.get('tanggal_lahir')
        lansia.alamat_lengkap = data.get('alamat_lengkap')
        lansia.koordinat = data.get('koordinat')
        lansia.rt = data.get('rt')
        lansia.rw = data.get('rw')
        lansia.status_perkawinan = data.get('status_perkawinan')
        lansia.agama = data.get('agama')
        lansia.pendidikan_terakhir = data.get('pendidikan_terakhir')
        lansia.pekerjaan_terakhir = data.get('pekerjaan_terakhir')
        lansia.sumber_penghasilan = data.get('sumber_penghasilan')
        
        
        # Update health record
        nestedData = data.get('kesehatan')
        kesehatan = lansia.kesehatan
        if not kesehatan:
            kesehatan = KesehatanLansia(lansia_id=lansia.id)
            db.session.add(kesehatan)
        
        kesehatan.kondisi_kesehatan_umum = nestedData.get('kondisi_kesehatan_umum')
        kesehatan.riwayat_penyakit_kronis = nestedData.get('riwayat_penyakit_kronis', [])
        kesehatan.penggunaan_obat_rutin = nestedData.get('penggunaan_obat_rutin')
        kesehatan.alat_bantu = nestedData.get('alat_bantu', [])
        kesehatan.aktivitas_fisik = nestedData.get('aktivitas_fisik')
        kesehatan.status_gizi = nestedData.get('status_gizi')
        kesehatan.riwayat_imunisasi = nestedData.get('riwayat_imunisasi', [])
        
        # Update social welfare record
        nestedData = data.get('kesejahteraan')
        kesejahteraan = lansia.kesejahteraan
        if not kesejahteraan:
            kesejahteraan = KesejahteraanSosial(lansia_id=lansia.id)
            db.session.add(kesejahteraan)
        
        kesejahteraan.dukungan_keluarga = nestedData.get('dukungan_keluarga')
        kesejahteraan.kondisi_rumah = nestedData.get('kondisi_rumah')
        kesejahteraan.kebutuhan_mendesak = nestedData.get('kebutuhan_mendesak', [])
        kesejahteraan.hobi_minat = nestedData.get('hobi_minat')
        kesejahteraan.kondisi_psikologis = nestedData.get('kondisi_psikologis')
        
        # Update family record
        nestedData = data.get('keluarga')
        keluarga = lansia.keluarga
        if not keluarga:
            keluarga = KeluargaPendamping(lansia_id=lansia.id)
            db.session.add(keluarga)
        
        keluarga.nama_pendamping = nestedData.get('nama_pendamping')
        keluarga.hubungan_dengan_lansia = nestedData.get('hubungan_dengan_lansia')
        keluarga.tanggal_lahir_pendamping = nestedData.get('tanggal_lahir_pendamping') if nestedData.get('tanggal_lahir_pendamping') else None
        keluarga.pendidikan_pendamping = nestedData.get('pendidikan_pendamping')
        keluarga.ketersediaan_waktu = nestedData.get('ketersediaan_waktu')
        keluarga.partisipasi_program_bkl = nestedData.get('partisipasi_program_bkl')
        keluarga.riwayat_partisipasi_bkl = nestedData.get('riwayat_partisipasi_bkl')
        keluarga.keterlibatan_data = nestedData.get('keterlibatan_data')
        
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil diperbarui', 'id': lansia.id})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400

@api.route('/lansia/<int:lansia_id>', methods=['DELETE'])
@login_required
def delete_lansia(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    
    try:
        db.session.delete(lansia)
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil dihapus'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400


# Dashboard routes
@api.route('/dashboard/demographics', methods=['GET'])
@login_required
def get_demographics():
    query = dataQuery()  # Pastikan query ini mengembalikan Lansia.query.filter_by(...) sesuai role

    # Total lansia (terfilter sesuai role)
    total_lansia = query.count()

    # Statistik jenis kelamin
    gender_stats = query.with_entities(
        Lansia.jenis_kelamin,
        func.count(Lansia.id)
    ).group_by(Lansia.jenis_kelamin).all()

    # Statistik kelompok usia
    age_group_stats = query.with_entities(
        Lansia.kelompokUsia,
        func.count(Lansia.id)
    ).group_by(Lansia.kelompokUsia).all()

    # Statistik lokasi RT/RW
    location_stats = query.with_entities(
        Lansia.rt,
        Lansia.rw,
        func.count(Lansia.id)
    ).group_by(Lansia.rt, Lansia.rw).all()  # ← perbaikan: jangan group_by(rw, rw)

        
    return jsonify({
        'total_lansia': total_lansia,
        'by_gender': [{'gender': g[0], 'count': g[1]} for g in gender_stats],
        'by_age_group': [{'group': a[0], 'count': a[1]} for a in age_group_stats],
        'by_location': [{'rt': l[0], 'rw': l[1], 'count': l[2]} for l in location_stats]
    })

@api.route('/dashboard/health', methods=['GET'])
@login_required
def get_health_stats():
    # Ambil query Lansia yang sudah terfilter berdasarkan role
    lansia_query = dataQuery()

    # Ambil id lansia yang sesuai
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Query kondisi kesehatan umum
    health_condition_stats = db.session.query(
        KesehatanLansia.kondisi_kesehatan_umum,
        func.count(KesehatanLansia.id)
    ).filter(KesehatanLansia.lansia_id.in_(filtered_ids))\
    .group_by(KesehatanLansia.kondisi_kesehatan_umum).all()

    # Query penyakit kronis (dari array)
    chronic_diseases = db.session.execute(
        text("""
            SELECT unnest(riwayat_penyakit_kronis) AS disease, COUNT(*) as count
            FROM kesehatan_lansia
            WHERE lansia_id = ANY(:ids) AND riwayat_penyakit_kronis IS NOT NULL
            GROUP BY disease
            ORDER BY count DESC
        """),
        {'ids': filtered_ids}
    ).fetchall()

    # Query status gizi
    nutrition_stats = db.session.query(
        KesehatanLansia.status_gizi,
        func.count(KesehatanLansia.id)
    ).filter(KesehatanLansia.lansia_id.in_(filtered_ids))\
    .group_by(KesehatanLansia.status_gizi).all()

    
    return jsonify({
        'health_conditions': [{'condition': h[0], 'count': h[1]} for h in health_condition_stats if h[0]],
        'chronic_diseases': [{'disease': d[0], 'count': d[1]} for d in chronic_diseases],
        'nutrition_status': [{'status': n[0], 'count': n[1]} for n in nutrition_stats if n[0]]
    })

@api.route('/dashboard/social-welfare', methods=['GET'])
@login_required
def get_social_welfare_stats():
    # Ambil lansia yang sudah difilter berdasarkan session role
    lansia_query = dataQuery()

    # Ambil ID lansia yang berhak dilihat
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Statistik kondisi rumah (terfilter)
    housing_stats = db.session.query(
        KesejahteraanSosial.kondisi_rumah,
        func.count(KesejahteraanSosial.id)
    ).filter(KesejahteraanSosial.lansia_id.in_(filtered_ids))\
    .group_by(KesejahteraanSosial.kondisi_rumah).all()

    # Statistik kebutuhan mendesak (array field)
    urgent_needs = db.session.execute(
        text("""
            SELECT unnest(kebutuhan_mendesak) AS need, COUNT(*) as count
            FROM kesejahteraan_sosial
            WHERE lansia_id = ANY(:ids)
            AND kebutuhan_mendesak IS NOT NULL
            GROUP BY need
            ORDER BY count DESC
        """),
        {'ids': filtered_ids}
    ).fetchall()
    
    return jsonify({
        'housing_conditions': [{'condition': h[0], 'count': h[1]} for h in housing_stats if h[0]],
        'urgent_needs': [{'need': u[0], 'count': u[1]} for u in urgent_needs]
    })

@api.route('/dashboard/needs-potential', methods=['GET'])
@login_required
def get_needs_potential():
    # Ambil query Lansia yang terfilter berdasarkan session['role']
    lansia_query = dataQuery()

    # Ambil daftar ID lansia yang sesuai
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Query partisipasi program BKL yang hanya mencakup lansia yang diizinkan
    participation_stats = db.session.query(
        KeluargaPendamping.partisipasi_program_bkl,
        func.count(KeluargaPendamping.id)
    ).filter(KeluargaPendamping.lansia_id.in_(filtered_ids))\
    .group_by(KeluargaPendamping.partisipasi_program_bkl).all()

    
    return jsonify({
        'participation': [{'group': p[0], 'count': p[1]} for p in participation_stats if p[0]]
    })

@api.route('/dashboard/urgent-need-details/<need_type>', methods=['GET'])
@login_required
def get_urgent_need_details(need_type):
    print(f"Fetching urgent need details for: {need_type}")
    try:
        # Query to get lansia with specific urgent need using PostgreSQL array contains operator
        query = (
                dataQuery()
                .join(KesejahteraanSosial)
                .filter(KesejahteraanSosial.kebutuhan_mendesak.contains([need_type]))
                .with_entities(
                    Lansia.id,
                    Lansia.nama_lengkap,
                    Lansia.nik,
                    Lansia.alamat_lengkap,
                    Lansia.rt,
                    Lansia.rw,
                    KesejahteraanSosial.kebutuhan_mendesak
                )
                .all()
            )
        
        result = []
        for row in query:
            result.append({
                'id': row.id,
                'nama_lengkap': row.nama_lengkap,
                'nik': row.nik,
                'alamat_lengkap': row.alamat_lengkap,
                'rt': row.rt,
                'rw': row.rw,
                'kebutuhan': row.kebutuhan_mendesak or []
            })
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_urgent_need_details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/export-template', methods=['GET'])
@login_required
def export_template():
    file_path = os.path.join('static', 'file', 'LansiaTemplate.xlsm')  # sesuaikan dengan path file 
    return send_file(
        file_path,
        as_attachment=True,
    ), 200

# Add upload Excel endpoint
@api.route('/upload-excel', methods=['POST'])
@login_required
def upload_excel():
    print("Upload Excel endpoint called")  # Debug log
    
    if 'file' not in request.files:
        print("No file in request")  # Debug log
        return jsonify({'message': 'No file uploaded'}), 400
    
    file = request.files['file']
    print(f"File received: {file.filename}")  # Debug log
    
    
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if not file.filename.lower().endswith(('.xlsx', '.xls', 'xlsm')):
        return jsonify({'message': 'Invalid file format. Please upload Excel file (.xlsx or .xls)'}), 400
    
    try:
        # Read Excel file directly from memory
        header = ['nama_lengkap', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'alamat_lengkap', 'koordinat', 'rt', 'rw', 'status_perkawinan', 'agama', 'pendidikan_terakhir', 'pekerjaan_terakhir', 'sumber_penghasilan',
                  'pass1', 'kondisi_kesehatan_umum', 'riwayat_penyakit_kronis', 'penggunaan_obat_rutin', 'alat_bantu', 'aktivitas_fisik', 'status_gizi', 'riwayat_imunisasi',
                  'pass2', 'dukungan_keluarga', 'kondisi_rumah', 'kebutuhan_mendesak', 'hobi_minat', 'kondisi_psikologis',
                  'pass3', 'nama_pendamping', 'hubungan_dengan_lansia', 'tanggal_lahir_pendamping', 'pendidikan_pendamping', 'ketersediaan_waktu', 'partisipasi_program_bkl', 'riwayat_partisipasi_bkl', 'keterlibatan_data',
                  'pass4', 'bab', 'bak', 'membersihkan_diri', 'toilet', 'makan', 'pindah_tempat', 'mobilitas', 'berpakaian', 'naik_turun_tangga', 'mandi',
                ]
        
        print("Reading Excel file...")  # Debug log
        df = pd.read_excel(file.stream)
        df = df.T
        df.columns = header
        df.drop(['pass1', 'pass2', 'pass3', 'pass4'], axis=1, inplace=True)
        df = df.iloc[1:]
        df.index = range(2, len(df) + 2)
        
        print(f"Excel file read successfully. Shape: {df.shape}")  # Debug log
        success_count = 0
        error_count = 0
        errors = []
        
        # missing_columns = [col for col in required_columns if col not in df.columns]
        
        for index, row in df.iterrows():
            try:
                # Validate required columns
                
                data = row.to_dict()
                
                for d, val in data.items():
                    if pd.isna(val):
                        error_count += 1
                        error_msg = f'Data {error_d[d]} Kolom {index}: Data Kosong'
                        errors.append(error_msg)
                        print(f"Error processing row {index} kolom {d}: Data Kosong")  # Debug log
                
                # Optional: parse tanggal_lahir
                if 'tanggal_lahir' in data and isinstance(data['tanggal_lahir'], str):
                    data['tanggal_lahir'] = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
                    
                if 'tanggal_lahir_pendamping' in data and isinstance(data['tanggal_lahir_pendamping'], str):
                    data['tanggal_lahir_pendamping'] = datetime.strptime(data['tanggal_lahir_pendamping'], '%Y-%m-%d').date()
                
                # Check if NIK already exists
                existing = Lansia.query.filter_by(nik=str(row['nik'])).first()
                if existing:
                    error_count += 1
                    errors.append(f'Kolom {index}: NIK {row["nik"]} sudah terdaftar')
                    continue
                
                lansia = Lansia()
                for column in Lansia.__table__.columns:
                    col_name = column.name
                    if col_name != 'id' and col_name in data:
                        value = data[col_name]
                        setattr(lansia, col_name, value)
                
                db.session.add(lansia)
                db.session.flush()  # Get lansia.id
                
                # 2️⃣ Create KesehatanLansia object
                kesehatan = KesehatanLansia()
                for column in KesehatanLansia.__table__.columns:
                    col_name = column.name
                    if col_name in ['riwayat_penyakit_kronis', 'alat_bantu', 'riwayat_imunisasi']:
                        setattr(kesehatan, col_name, data[col_name].split(sep=','))
                        continue             
                    
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(kesehatan, col_name, data[col_name])

                kesehatan.lansia_id = lansia.id
                db.session.add(kesehatan)
                
                # 3
                kesejahteraan = KesejahteraanSosial()
                for column in KesejahteraanSosial.__table__.columns:
                    col_name = column.name
                    if col_name == 'kebutuhan_mendesak':
                        setattr(kesejahteraan, col_name, data[col_name].split(sep=','))
                        continue
                    
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(kesejahteraan, col_name, data[col_name])

                kesejahteraan.lansia_id = lansia.id
                db.session.add(kesejahteraan)
                
                # 4
                pendamping = KeluargaPendamping()
                for column in KeluargaPendamping.__table__.columns:
                    col_name = column.name
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(pendamping, col_name, data[col_name])

                pendamping.lansia_id = lansia.id
                db.session.add(pendamping)
                
                # 5
                adl = ADailyLiving()
                for column in ADailyLiving.__table__.columns:
                    col_name = column.name
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(adl, col_name, data[col_name])

                adl.lansia_id = lansia.id
                db.session.add(adl)
                success_count += 1

            except Exception as e:
                error_count += 1
                error_msg = f'Data {error_d[d]} kolom {index} : {str(e)}'
                errors.append(error_msg)
                print(f"Error processing row {index + 2}: {str(e)}")  # Debug log
                continue
        
        response_message = f'Successfully imported {success_count} records'
        if error_count > 0:
            response_message += f', {error_count} errors occurred'
            success_count = 0
        else:
            db.session.commit()
        
        return jsonify({
            'message': response_message,
            'count': success_count,
            'errors': errors[:10]  # Return first 10 errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")  # Debug log
        return jsonify({'message': f'Error processing file: {str(e)}'}), 400

    
    

# Get filter options for frontend
@api.route('/filter-options', methods=['GET'])
@login_required
def get_filter_options():
    # Get unique values for filters
    query = dataQuery()  # terfilter sesuai session['role']

    # Jenis kelamin unik dari lansia yang berhak diakses
    genders = query.with_entities(Lansia.jenis_kelamin).distinct().all()

    # Kelompok usia tetap manual (bukan query)
    age_groups = ["Lansia Muda", "Lansia Madya", "Lansia Tua", "Belum Lansia"]

    # RW unik dari lansia yang berhak diakses
    rws = query.with_entities(Lansia.rw).distinct().order_by(Lansia.rw).all()

    
    return jsonify({
        'genders': [g[0] for g in genders if g[0]],
        'age_groups': [a for a in age_groups if a[0]],
        'rws': [r[0] for r in rws if r[0]]
    })
    
# Get filter options for frontend
@api.route('/lansia-locations', methods=['GET'])
def get_lansia_locations():
    data = Lansia.query.all()
    result = []
    RW_POLYGONS = load_rw_polygons("../public/data/rw_cipamokolan.geojson")
    
    for person in data:
        rw = str(person.rw).upper()
        koordinat = getattr(person, "koordinat", "-")
        lat, lon = None, None
        if koordinat != '-':
            lat, lon = koordinat.split(sep=',')

        if lat == None or lon == None:
            polygon = RW_POLYGONS.get(f'RW{rw}')
            if polygon:
                point = generate_random_point_in_polygon(polygon)
                if point:
                    lat, lon = point.y, point.x  # lat, lon
                else:
                    continue  # skip if failed to generate
            else:
                polygon = RW_POLYGONS.get('CIPAMOKOLAN')
                point = generate_random_point_in_polygon(polygon)
                if point:
                    lat, lon = point.y, point.x  # lat, lon
                else:
                    continue  # skip if failed to generate

        result.append({
            "latitude": float(lat),
            "longitude": float(lon)
        })

    return jsonify(result)


#BULk delete lansia
@api.route('/lansia/bulk-delete', methods=['POST'])
@login_required
def bulk_delete_lansia():
    data = request.get_json()
    ids = data.get('ids', [])
    
    if not ids:
        return jsonify({'message': 'No IDs provided'}), 400
    
    try:
        # Delete all lansia with the provided IDs
        deleted_count = Lansia.query.filter(Lansia.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify({
            'message': f'{deleted_count} data lansia berhasil dihapus',
            'deleted_count': deleted_count
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400