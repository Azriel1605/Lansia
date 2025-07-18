from faker import Faker
from flask_sqlalchemy import SQLAlchemy
import random
from datetime import datetime
from models import Lansia, KesehatanLansia, KesejahteraanSosial, KeluargaPendamping, ADailyLiving

db = SQLAlchemy()

fake = Faker('id_ID') # Menggunakan locale Indonesia untuk data yang lebih relevan

def generate_fake_data(num_records=1000):
    print(f"Generating {num_records} fake Lansia data...")

    for i in range(num_records):
        # Generate Lansia data
        jenis_kelamin = random.choice(['Laki-laki', 'Perempuan'])
        # Usia lansia umumnya 60 tahun ke atas.
        # Rentang tanggal lahir yang masuk akal (misal, 60-100 tahun yang lalu)
        birth_year = random.randint(datetime.now().year - 100, datetime.now().year - 60)
        tanggal_lahir = fake.date_of_birth(minimum_age=60, maximum_age=100) # Pastikan rentang usia sesuai
        
        # Generate NIK unik (16 digit)
        nik_prefix = str(random.randint(1000000000000000, 9999999999999999))
        nik = nik_prefix[:16] # Pastikan 16 digit

        lansia = Lansia(
            nama_lengkap=fake.name_male() if jenis_kelamin == 'Laki-laki' else fake.name_female(),
            nik=nik,
            jenis_kelamin=jenis_kelamin,
            tanggal_lahir=tanggal_lahir,
            alamat_lengkap=fake.address(),
            koordinat=f"{fake.latitude()}, {fake.longitude()}",
            rt=str(random.randint(1, 20)),
            rw=str(random.randint(1, 15)),
            status_perkawinan=random.choice(['Menikah', 'Janda/Duda', 'Belum Menikah']),
            agama=random.choice(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
            pendidikan_terakhir=random.choice(['Tidak Sekolah', 'SD', 'SMP', 'SMA', 'Diploma', 'Sarjana']),
            pekerjaan_terakhir=fake.job(),
            sumber_penghasilan=random.choice(['Pensiunan', 'Wiraswasta', 'Bantuan Pemerintah', 'Anak/Keluarga'])
        )
        db.session.add(lansia)
        db.session.flush() # Digunakan untuk mendapatkan lansia.id sebelum commit

        # Generate KesehatanLansia data
        kesehatan = KesehatanLansia(
            lansia_id=lansia.id,
            kondisi_kesehatan_umum=random.choice(['Baik', 'Cukup Baik', 'Kurang Baik']),
            riwayat_penyakit_kronis=random.sample(['Diabetes', 'Hipertensi', 'Jantung', 'Stroke', 'Asma', 'Rematik'], k=random.randint(0, 3)),
            penggunaan_obat_rutin=fake.sentence() if random.random() > 0.5 else None,
            alat_bantu=random.choice(['Tidak ada', 'Tongkat', 'Kursi Roda', 'Alat Dengar', 'Kacamata']) if random.random() > 0.3 else 'Tidak ada',
            aktivitas_fisik=random.choice(['Aktif', 'Cukup Aktif', 'Kurang Aktif', 'Tidak Aktif']),
            status_gizi=random.choice(['Baik', 'Kurang Gizi', 'Gizi Berlebih']),
            riwayat_imunisasi=fake.sentence() if random.random() > 0.5 else None
        )
        db.session.add(kesehatan)

        # Generate KesejahteraanSosial data
        kesejahteraan = KesejahteraanSosial(
            lansia_id=lansia.id,
            dukungan_keluarga=random.choice(['Sangat Baik', 'Baik', 'Cukup', 'Kurang']),
            kondisi_rumah=random.choice(['Layak Huni', 'Cukup Layak', 'Kurang Layak']),
            kebutuhan_mendesak=random.sample(['Pangan', 'Pakaian', 'Obat-obatan', 'Perawatan Medis', 'Tempat Tinggal'], k=random.randint(0, 3)),
            hobi_minat=fake.sentence() if random.random() > 0.5 else None,
            kondisi_psikologis=random.choice(['Stabil', 'Cemas', 'Depresi', 'Sedih', 'Bahagia'])
        )
        db.session.add(kesejahteraan)

        # Generate KeluargaPendamping data
        pendamping_usia = random.randint(18, 60)
        pendamping = KeluargaPendamping(
            lansia_id=lansia.id,
            nama_pendamping=fake.name(),
            hubungan_dengan_lansia=random.choice(['Anak', 'Cucu', 'Pasangan', 'Saudara', 'Tetangga', 'Lainnya']),
            tanggal_lahir_pendamping=fake.date_of_birth(minimum_age=18, maximum_age=60),
            usia_pendamping=pendamping_usia,
            pendidikan_pendamping=random.choice(['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana']),
            ketersediaan_waktu=random.choice(['Setiap Hari', 'Beberapa Kali Seminggu', 'Jarang']),
            partisipasi_program_bkl=random.choice(['Ya', 'Tidak']),
            riwayat_partisipasi_bkl=fake.sentence() if random.random() > 0.5 else None,
            keterlibatan_data=fake.sentence() if random.random() > 0.5 else None
        )
        db.session.add(pendamping)

        # Generate ADailyLiving data (Barthel Index-like)
        bab = random.randint(0, 10) # Asumsi skor 0-10
        bak = random.randint(0, 10)
        membersihkan_diri = random.randint(0, 10)
        toilet = random.randint(0, 10)
        makan = random.randint(0, 10)
        pindah_tempat = random.randint(0, 10)
        mobilitas = random.randint(0, 10)
        berpakaian = random.randint(0, 10)
        naik_turun_tangga = random.randint(0, 10)
        total_adl = sum([bab, bak, membersihkan_diri, toilet, makan, pindah_tempat, mobilitas, berpakaian, naik_turun_tangga])

        daily_living = ADailyLiving(
            lansia_id=lansia.id,
            bab=bab,
            bak=bak,
            membersihkan_diri=membersihkan_diri,
            toilet=toilet,
            makan=makan,
            pindah_tempat=pindah_tempat,
            mobilitas=mobilitas,
            berpakaian=berpakaian,
            naik_turun_tangga=naik_turun_tangga,
            total=total_adl
        )
        db.session.add(daily_living)

        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} records...")
    
    db.session.commit()
    print(f"Successfully generated {num_records} fake Lansia data and related records.")