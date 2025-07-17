from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from sqlalchemy import String, func, extract, cast, Integer
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='kader')
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

class UpdateAge(db.Model):
    __tablename__ = 'update_age'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)

class Lansia(db.Model):
    __tablename__ = 'lansia'
    id = db.Column(db.Integer, primary_key=True)
    nama_lengkap = db.Column(db.String(255), nullable=False)
    nik = db.Column(db.String(16), unique=True, nullable=False)
    jenis_kelamin = db.Column(db.String(10), nullable=False)
    tanggal_lahir = db.Column(db.Date)
    usia = db.Column(db.Integer)
    kelompok_usia = db.Column(db.String(50))
    alamat_lengkap = db.Column(db.Text)
    rt = db.Column(db.String(10))
    rw = db.Column(db.String(10))
    status_perkawinan = db.Column(db.String(50))
    agama = db.Column(db.String(50))
    pendidikan_terakhir = db.Column(db.String(100))
    pekerjaan_terakhir = db.Column(db.String(100))
    sumber_penghasilan = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)

    # Relationships
    kesehatan = db.relationship('KesehatanLansia', backref='lansia', uselist=False, cascade='all, delete-orphan')
    kesejahteraan = db.relationship('KesejahteraanSosial', backref='lansia', uselist=False, cascade='all, delete-orphan')
    keluarga = db.relationship('KeluargaPendamping', backref='lansia', uselist=False, cascade='all, delete-orphan')
    daily_living = db.relationship('ADailyLiving', backref='lansia', uselist=False, cascade='all, delete-orphan')
    
    @hybrid_property
    def usia(self, reference=datetime.today()):
        return reference.year - self.tanggal_lahir.year - (
            (reference.month, reference.day) < (self.tanggal_lahir.month, self.tanggal_lahir.day)
        )

    @usia.expression
    def usia(cls, reference=func.now()):
        return extract('year', func.age(reference, cls.tanggal_lahir))

class KesehatanLansia(db.Model):
    __tablename__ = 'kesehatan_lansia'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id'), nullable=False)
    kondisi_kesehatan_umum = db.Column(db.String(100))
    riwayat_penyakit_kronis = db.Column(ARRAY(String))
    penggunaan_obat_rutin = db.Column(db.Text)
    alat_bantu = db.Column(db.String)
    aktivitas_fisik = db.Column(db.String(100))
    status_gizi = db.Column(db.String(50))
    riwayat_imunisasi = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now)

class KesejahteraanSosial(db.Model):
    __tablename__ = 'kesejahteraan_sosial'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id'), nullable=False)
    dukungan_keluarga = db.Column(db.String(100))
    kondisi_rumah = db.Column(db.String(100))
    kebutuhan_mendesak = db.Column(ARRAY(String))
    hobi_minat = db.Column(db.Text)
    kondisi_psikologis = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.now)

class KeluargaPendamping(db.Model):
    __tablename__ = 'keluarga_pendamping'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id'), nullable=False)
    nama_pendamping = db.Column(db.String(255))
    hubungan_dengan_lansia = db.Column(db.String(100))
    tanggal_lahir_pendamping = db.Column(db.Date)
    usia_pendamping = db.Column(db.Integer)
    pendidikan_pendamping = db.Column(db.String(100))
    ketersediaan_waktu = db.Column(db.String(100))
    partisipasi_program_bkl = db.Column(db.String(100))
    riwayat_partisipasi_bkl = db.Column(db.Text)
    keterlibatan_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now)

class ADailyLiving(db.Model):
    __tablename__ = 'daily_living'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id'), nullable=False)
    bab = db.Column(db.Integer)
    bak = db.Column(db.Integer)
    membersihkan_diri = db.Column(db.Integer)
    toilet = db.Column(db.Integer)
    makan = db.Column(db.Integer)
    pindah_tempat = db.Column(db.Integer)
    mobilitas = db.Column(db.Integer)
    berpakaian = db.Column(db.Integer)
    naik_turun_tangga = db.Column(db.Integer)
    total = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.now)
