"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, UserPlus, Upload, Download } from "lucide-react"
import { dataAPI } from "@/lib/api"
import RouteGuard from "@/components/route-guard"

function InputDataContent() {
  const [formData, setFormData] = useState({
    // Personal Data
    nama_lengkap: "",
    nik: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat_lengkap: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    status_perkawinan: "",
    agama: "",
    pendidikan_terakhir: "",
    pekerjaan_terakhir: "",
    pekerjaan_saat_ini: "",
    sumber_penghasilan: "",

    // Health Data
    kondisi_kesehatan_umum: "",
    riwayat_penyakit_kronis: [] as string[],
    penggunaan_obat_rutin: "",
    alat_bantu: [] as string[],
    aktivitas_fisik: "",
    status_gizi: "",
    riwayat_imunisasi: "",

    // Social Welfare Data
    dukungan_keluarga: "",
    tinggal_dengan: "",
    kondisi_rumah: "",
    aksesibilitas_rumah: "",
    sanitasi_rumah: "",
    kebutuhan_mendesak: [] as string[],
    hobi_minat: "",
    kondisi_psikologis: "",

    // Family Data
    nama_pendamping: "",
    hubungan_dengan_lansia: "",
    usia_pendamping: "",
    pendidikan_pendamping: "",
    ketersediaan_waktu: "",

    // BKL Participation
    riwayat_partisipasi: "",
    jenis_kegiatan: [] as string[],
    frekuensi_kegiatan: "",
    keterlibatan_kelompok: "",
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await dataAPI.createLansia(formData)
      const data = await response.json()

      if (response.ok) {
        setMessage("Data lansia berhasil ditambahkan!")
        // Reset form
        setFormData({
          nama_lengkap: "",
          nik: "",
          jenis_kelamin: "",
          tempat_lahir: "",
          tanggal_lahir: "",
          alamat_lengkap: "",
          rt: "",
          rw: "",
          kelurahan: "",
          kecamatan: "",
          status_perkawinan: "",
          agama: "",
          pendidikan_terakhir: "",
          pekerjaan_terakhir: "",
          pekerjaan_saat_ini: "",
          sumber_penghasilan: "",
          kondisi_kesehatan_umum: "",
          riwayat_penyakit_kronis: [],
          penggunaan_obat_rutin: "",
          alat_bantu: [],
          aktivitas_fisik: "",
          status_gizi: "",
          riwayat_imunisasi: "",
          dukungan_keluarga: "",
          tinggal_dengan: "",
          kondisi_rumah: "",
          aksesibilitas_rumah: "",
          sanitasi_rumah: "",
          kebutuhan_mendesak: [],
          hobi_minat: "",
          kondisi_psikologis: "",
          nama_pendamping: "",
          hubungan_dengan_lansia: "",
          usia_pendamping: "",
          pendidikan_pendamping: "",
          ketersediaan_waktu: "",
          riwayat_partisipasi: "",
          jenis_kegiatan: [],
          frekuensi_kegiatan: "",
          keterlibatan_kelompok: "",
        })
      } else {
        setError(data.message || "Terjadi kesalahan saat menyimpan data")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await dataAPI.exportTemplate()

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "template_input_lansia.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading template:", error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setError("Pilih file Excel terlebih dahulu")
      return
    }

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", uploadFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-excel`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Berhasil mengupload ${data.count} data lansia`)
        setUploadFile(null)
      } else {
        setError(data.message || "Terjadi kesalahan saat mengupload file")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Input Data Lansia</h1>
          <p className="mt-2 text-gray-600">Tambahkan data lansia baru ke dalam sistem</p>
        </div>

        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Input Manual
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center">
              <FileUp className="h-4 w-4 mr-2" />
              Upload Excel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Pribadi</CardTitle>
                  <CardDescription>Informasi dasar identitas lansia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                      <Input
                        id="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={(e) => handleInputChange("nama_lengkap", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nik">NIK *</Label>
                      <Input
                        id="nik"
                        value={formData.nik}
                        onChange={(e) => handleInputChange("nik", e.target.value)}
                        maxLength={16}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                      <Select
                        value={formData.jenis_kelamin}
                        onValueChange={(value) => handleInputChange("jenis_kelamin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                      <Input
                        id="tempat_lahir"
                        value={formData.tempat_lahir}
                        onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggal_lahir"
                        type="date"
                        value={formData.tanggal_lahir}
                        onChange={(e) => handleInputChange("tanggal_lahir", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alamat_lengkap">Alamat Lengkap</Label>
                    <Textarea
                      id="alamat_lengkap"
                      value={formData.alamat_lengkap}
                      onChange={(e) => handleInputChange("alamat_lengkap", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="rt">RT</Label>
                      <Input id="rt" value={formData.rt} onChange={(e) => handleInputChange("rt", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="rw">RW</Label>
                      <Input id="rw" value={formData.rw} onChange={(e) => handleInputChange("rw", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="kelurahan">Kelurahan</Label>
                      <Input
                        id="kelurahan"
                        value={formData.kelurahan}
                        onChange={(e) => handleInputChange("kelurahan", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kecamatan">Kecamatan</Label>
                      <Input
                        id="kecamatan"
                        value={formData.kecamatan}
                        onChange={(e) => handleInputChange("kecamatan", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                      <Select
                        value={formData.status_perkawinan}
                        onValueChange={(value) => handleInputChange("status_perkawinan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Menikah">Menikah</SelectItem>
                          <SelectItem value="Janda">Janda</SelectItem>
                          <SelectItem value="Duda">Duda</SelectItem>
                          <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="agama">Agama</Label>
                      <Select value={formData.agama} onValueChange={(value) => handleInputChange("agama", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Islam">Islam</SelectItem>
                          <SelectItem value="Kristen">Kristen</SelectItem>
                          <SelectItem value="Katolik">Katolik</SelectItem>
                          <SelectItem value="Hindu">Hindu</SelectItem>
                          <SelectItem value="Buddha">Buddha</SelectItem>
                          <SelectItem value="Konghucu">Konghucu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</Label>
                      <Select
                        value={formData.pendidikan_terakhir}
                        onValueChange={(value) => handleInputChange("pendidikan_terakhir", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak Sekolah">Tidak Sekolah</SelectItem>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="D3">D3</SelectItem>
                          <SelectItem value="S1">S1</SelectItem>
                          <SelectItem value="S2">S2</SelectItem>
                          <SelectItem value="S3">S3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pekerjaan_terakhir">Pekerjaan Terakhir</Label>
                      <Input
                        id="pekerjaan_terakhir"
                        value={formData.pekerjaan_terakhir}
                        onChange={(e) => handleInputChange("pekerjaan_terakhir", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sumber_penghasilan">Sumber Penghasilan</Label>
                      <Input
                        id="sumber_penghasilan"
                        value={formData.sumber_penghasilan}
                        onChange={(e) => handleInputChange("sumber_penghasilan", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Kesehatan</CardTitle>
                  <CardDescription>Informasi kondisi kesehatan lansia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="kondisi_kesehatan_umum">Kondisi Kesehatan Umum</Label>
                    <Select
                      value={formData.kondisi_kesehatan_umum}
                      onValueChange={(value) => handleInputChange("kondisi_kesehatan_umum", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kondisi kesehatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sehat bugar">Sehat bugar</SelectItem>
                        <SelectItem value="Mandiri">Mandiri</SelectItem>
                        <SelectItem value="Membutuhkan bantuan sebagian">Membutuhkan bantuan sebagian</SelectItem>
                        <SelectItem value="Ketergantungan total">Ketergantungan total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Riwayat Penyakit Kronis</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {[
                        "Hipertensi",
                        "Diabetes",
                        "Jantung",
                        "Stroke",
                        "Demensia",
                        "Asam Urat",
                        "Kolesterol",
                        "Osteoporosis",
                      ].map((disease) => (
                        <div key={disease} className="flex items-center space-x-2">
                          <Checkbox
                            id={disease}
                            checked={formData.riwayat_penyakit_kronis.includes(disease)}
                            onCheckedChange={(checked) =>
                              handleArrayChange("riwayat_penyakit_kronis", disease, checked as boolean)
                            }
                          />
                          <Label htmlFor={disease} className="text-sm">
                            {disease}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="penggunaan_obat_rutin">Penggunaan Obat Rutin</Label>
                      <Textarea
                        id="penggunaan_obat_rutin"
                        value={formData.penggunaan_obat_rutin}
                        onChange={(e) => handleInputChange("penggunaan_obat_rutin", e.target.value)}
                        placeholder="Contoh: Amlodipine 5mg 1x sehari"
                      />
                    </div>
                    <div>
                      <Label htmlFor="riwayat_imunisasi">Riwayat Imunisasi</Label>
                      <Textarea
                        id="riwayat_imunisasi"
                        value={formData.riwayat_imunisasi}
                        onChange={(e) => handleInputChange("riwayat_imunisasi", e.target.value)}
                        placeholder="Contoh: Flu 2023, Pneumonia 2022"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status_gizi">Status Gizi</Label>
                      <Select
                        value={formData.status_gizi}
                        onValueChange={(value) => handleInputChange("status_gizi", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status gizi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Kurus">Kurus</SelectItem>
                          <SelectItem value="Gemuk">Gemuk</SelectItem>
                          <SelectItem value="Obesitas">Obesitas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aktivitas_fisik">Aktivitas Fisik</Label>
                      <Input
                        id="aktivitas_fisik"
                        value={formData.aktivitas_fisik}
                        onChange={(e) => handleInputChange("aktivitas_fisik", e.target.value)}
                        placeholder="Contoh: Jalan pagi 3x seminggu"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Alat Bantu yang Digunakan</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {["Tongkat", "Kursi Roda", "Kacamata", "Alat Bantu Dengar"].map((tool) => (
                        <div key={tool} className="flex items-center space-x-2">
                          <Checkbox
                            id={tool}
                            checked={formData.alat_bantu.includes(tool)}
                            onCheckedChange={(checked) => handleArrayChange("alat_bantu", tool, checked as boolean)}
                          />
                          <Label htmlFor={tool} className="text-sm">
                            {tool}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Welfare Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Kesejahteraan Sosial</CardTitle>
                  <CardDescription>Informasi kondisi sosial dan ekonomi lansia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tinggal_dengan">Tinggal Dengan</Label>
                      <Select
                        value={formData.tinggal_dengan}
                        onValueChange={(value) => handleInputChange("tinggal_dengan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status tinggal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sendiri">Sendiri</SelectItem>
                          <SelectItem value="Pasangan">Pasangan</SelectItem>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Cucu">Cucu</SelectItem>
                          <SelectItem value="Keluarga Lain">Keluarga Lain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dukungan_keluarga">Dukungan Keluarga</Label>
                      <Select
                        value={formData.dukungan_keluarga}
                        onValueChange={(value) => handleInputChange("dukungan_keluarga", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat dukungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sangat baik">Sangat baik</SelectItem>
                          <SelectItem value="Baik">Baik</SelectItem>
                          <SelectItem value="Cukup">Cukup</SelectItem>
                          <SelectItem value="Kurang">Kurang</SelectItem>
                          <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="kondisi_rumah">Kondisi Rumah</Label>
                      <Select
                        value={formData.kondisi_rumah}
                        onValueChange={(value) => handleInputChange("kondisi_rumah", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi rumah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Layak huni">Layak huni</SelectItem>
                          <SelectItem value="Perlu perbaikan">Perlu perbaikan</SelectItem>
                          <SelectItem value="Tidak layak huni">Tidak layak huni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aksesibilitas_rumah">Aksesibilitas Rumah</Label>
                      <Select
                        value={formData.aksesibilitas_rumah}
                        onValueChange={(value) => handleInputChange("aksesibilitas_rumah", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih aksesibilitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sangat aksesibel">Sangat aksesibel</SelectItem>
                          <SelectItem value="Cukup aksesibel">Cukup aksesibel</SelectItem>
                          <SelectItem value="Kurang aksesibel">Kurang aksesibel</SelectItem>
                          <SelectItem value="Tidak aksesibel">Tidak aksesibel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sanitasi_rumah">Sanitasi Rumah</Label>
                      <Select
                        value={formData.sanitasi_rumah}
                        onValueChange={(value) => handleInputChange("sanitasi_rumah", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi sanitasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sangat baik">Sangat baik</SelectItem>
                          <SelectItem value="Baik">Baik</SelectItem>
                          <SelectItem value="Cukup">Cukup</SelectItem>
                          <SelectItem value="Kurang">Kurang</SelectItem>
                          <SelectItem value="Buruk">Buruk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Kebutuhan Mendesak</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {[
                        "Bantuan obat",
                        "Bantuan makanan",
                        "Perbaikan rumah",
                        "Alat bantu",
                        "Perawatan medis",
                        "Bantuan keuangan",
                      ].map((need) => (
                        <div key={need} className="flex items-center space-x-2">
                          <Checkbox
                            id={need}
                            checked={formData.kebutuhan_mendesak.includes(need)}
                            onCheckedChange={(checked) =>
                              handleArrayChange("kebutuhan_mendesak", need, checked as boolean)
                            }
                          />
                          <Label htmlFor={need} className="text-sm">
                            {need}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hobi_minat">Hobi & Minat</Label>
                      <Textarea
                        id="hobi_minat"
                        value={formData.hobi_minat}
                        onChange={(e) => handleInputChange("hobi_minat", e.target.value)}
                        placeholder="Contoh: Berkebun, memasak, menonton TV"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kondisi_psikologis">Kondisi Psikologis</Label>
                      <Select
                        value={formData.kondisi_psikologis}
                        onValueChange={(value) => handleInputChange("kondisi_psikologis", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kondisi psikologis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sangat baik">Sangat baik</SelectItem>
                          <SelectItem value="Baik">Baik</SelectItem>
                          <SelectItem value="Stabil">Stabil</SelectItem>
                          <SelectItem value="Cemas">Cemas</SelectItem>
                          <SelectItem value="Depresi">Depresi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Keluarga/Pendamping</CardTitle>
                  <CardDescription>Informasi keluarga atau pendamping lansia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama_pendamping">Nama Pendamping</Label>
                      <Input
                        id="nama_pendamping"
                        value={formData.nama_pendamping}
                        onChange={(e) => handleInputChange("nama_pendamping", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hubungan_dengan_lansia">Hubungan dengan Lansia</Label>
                      <Select
                        value={formData.hubungan_dengan_lansia}
                        onValueChange={(value) => handleInputChange("hubungan_dengan_lansia", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Cucu">Cucu</SelectItem>
                          <SelectItem value="Menantu">Menantu</SelectItem>
                          <SelectItem value="Pasangan">Pasangan</SelectItem>
                          <SelectItem value="Saudara">Saudara</SelectItem>
                          <SelectItem value="Tetangga">Tetangga</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="usia_pendamping">Usia Pendamping</Label>
                      <Input
                        id="usia_pendamping"
                        type="number"
                        value={formData.usia_pendamping}
                        onChange={(e) => handleInputChange("usia_pendamping", e.target.value)}
                        min="0"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pendidikan_pendamping">Pendidikan Pendamping</Label>
                      <Select
                        value={formData.pendidikan_pendamping}
                        onValueChange={(value) => handleInputChange("pendidikan_pendamping", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak Sekolah">Tidak Sekolah</SelectItem>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="D3">D3</SelectItem>
                          <SelectItem value="S1">S1</SelectItem>
                          <SelectItem value="S2">S2</SelectItem>
                          <SelectItem value="S3">S3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ketersediaan_waktu">Ketersediaan Waktu</Label>
                      <Select
                        value={formData.ketersediaan_waktu}
                        onValueChange={(value) => handleInputChange("ketersediaan_waktu", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih ketersediaan waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sepanjang hari">Sepanjang hari</SelectItem>
                          <SelectItem value="Pagi hari">Pagi hari</SelectItem>
                          <SelectItem value="Siang hari">Siang hari</SelectItem>
                          <SelectItem value="Sore hari">Sore hari</SelectItem>
                          <SelectItem value="Malam hari">Malam hari</SelectItem>
                          <SelectItem value="Akhir pekan">Akhir pekan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BKL Participation */}
              <Card>
                <CardHeader>
                  <CardTitle>Partisipasi BKL (Bina Keluarga Lansia)</CardTitle>
                  <CardDescription>Informasi keterlibatan dalam program BKL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keterlibatan_kelompok">Keterlibatan Kelompok</Label>
                      <Select
                        value={formData.keterlibatan_kelompok}
                        onValueChange={(value) => handleInputChange("keterlibatan_kelompok", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih keterlibatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Posyandu Lansia">Posyandu Lansia</SelectItem>
                          <SelectItem value="Kelompok Lansia RW">Kelompok Lansia RW</SelectItem>
                          <SelectItem value="Arisan Lansia">Arisan Lansia</SelectItem>
                          <SelectItem value="Pengajian Lansia">Pengajian Lansia</SelectItem>
                          <SelectItem value="Tidak terlibat">Tidak terlibat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="frekuensi_kegiatan">Frekuensi Kegiatan</Label>
                      <Select
                        value={formData.frekuensi_kegiatan}
                        onValueChange={(value) => handleInputChange("frekuensi_kegiatan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih frekuensi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Harian">Harian</SelectItem>
                          <SelectItem value="Mingguan">Mingguan</SelectItem>
                          <SelectItem value="Bulanan">Bulanan</SelectItem>
                          <SelectItem value="Kadang-kadang">Kadang-kadang</SelectItem>
                          <SelectItem value="Tidak pernah">Tidak pernah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Jenis Kegiatan yang Diikuti</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {["Senam lansia", "Pemeriksaan kesehatan", "Arisan", "Pengajian", "Keterampilan", "Rekreasi"].map(
                        (activity) => (
                          <div key={activity} className="flex items-center space-x-2">
                            <Checkbox
                              id={activity}
                              checked={formData.jenis_kegiatan.includes(activity)}
                              onCheckedChange={(checked) =>
                                handleArrayChange("jenis_kegiatan", activity, checked as boolean)
                              }
                            />
                            <Label htmlFor={activity} className="text-sm">
                              {activity}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="riwayat_partisipasi">Riwayat Partisipasi</Label>
                    <Textarea
                      id="riwayat_partisipasi"
                      value={formData.riwayat_partisipasi}
                      onChange={(e) => handleInputChange("riwayat_partisipasi", e.target.value)}
                      placeholder="Contoh: Aktif sejak 2020, pernah menjadi ketua kelompok"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="excel">
            <Card>
              <CardHeader>
                <CardTitle>Upload File Excel</CardTitle>
                <CardDescription>Upload data lansia dalam format Excel untuk input massal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Langkah 1: Download Template</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download template Excel terlebih dahulu untuk memastikan format data sesuai
                    </p>
                    <Button onClick={handleDownloadTemplate} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template Excel
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Langkah 2: Upload File</h3>
                    <p className="text-sm text-gray-600 mb-4">Pilih file Excel yang sudah diisi dengan data lansia</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Pilih file Excel atau drag & drop di sini
                            </span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".xlsx,.xls"
                              className="sr-only"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">Format: .xlsx, .xls (Max: 10MB)</p>
                        </div>
                      </div>
                    </div>

                    {uploadFile && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">{uploadFile.name}</p>
                            <p className="text-xs text-blue-700">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            onClick={() => setUploadFile(null)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-700 hover:text-blue-900"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleUploadSubmit} disabled={!uploadFile || isLoading}>
                      {isLoading ? "Mengupload..." : "Upload Data"}
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Catatan Penting:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>Pastikan format file sesuai dengan template yang disediakan</li>
                    <li>NIK harus unik dan tidak boleh duplikat</li>
                    <li>Tanggal lahir harus dalam format YYYY-MM-DD</li>
                    <li>Kolom yang wajib diisi: Nama Lengkap, NIK, Jenis Kelamin</li>
                    <li>File maksimal berukuran 10MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function InputDataPage() {
  return (
    <RouteGuard requireAuth={true}>
      <InputDataContent />
    </RouteGuard>
  )
}
