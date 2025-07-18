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
    // Personal Data (Lansia table)
    nama_lengkap: "",
    nik: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    alamat_lengkap: "",
    koordinat: "",
    rt: "",
    rw: "",
    status_perkawinan: "",
    agama: "",
    pendidikan_terakhir: "",
    pekerjaan_terakhir: "",
    sumber_penghasilan: "",

    // Health Data (KesehatanLansia table)
    kondisi_kesehatan_umum: "",
    riwayat_penyakit_kronis: [] as string[],
    penggunaan_obat_rutin: "",
    alat_bantu: "",
    aktivitas_fisik: "",
    status_gizi: "",
    riwayat_imunisasi: "",

    // Social Welfare Data (KesejahteraanSosial table)
    dukungan_keluarga: "",
    kondisi_rumah: "",
    kebutuhan_mendesak: [] as string[],
    hobi_minat: "",
    kondisi_psikologis: "",

    // Family Data (KeluargaPendamping table)
    nama_pendamping: "",
    hubungan_dengan_lansia: "",
    tanggal_lahir_pendamping: "",
    pendidikan_pendamping: "",
    ketersediaan_waktu: "",
    partisipasi_program_bkl: "",
    riwayat_partisipasi_bkl: "",
    keterlibatan_data: "",

    // Daily Living Activities (ADailyLiving table)
    bab: 0,
    bak: 0,
    membersihkan_diri: 0,
    toilet: 0,
    makan: 0,
    pindah_tempat: 0,
    mobilitas: 0,
    berpakaian: 0,
    naik_turun_tangga: 0,
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
        resetForm()
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
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      } else {
        setError(data.message || "Terjadi kesalahan saat mengupload file")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nama_lengkap: "",
      nik: "",
      jenis_kelamin: "",
      tanggal_lahir: "",
      alamat_lengkap: "",
      koordinat: "",
      rt: "",
      rw: "",
      status_perkawinan: "",
      agama: "",
      pendidikan_terakhir: "",
      pekerjaan_terakhir: "",
      sumber_penghasilan: "",
      kondisi_kesehatan_umum: "",
      riwayat_penyakit_kronis: [],
      penggunaan_obat_rutin: "",
      alat_bantu: "",
      aktivitas_fisik: "",
      status_gizi: "",
      riwayat_imunisasi: "",
      dukungan_keluarga: "",
      kondisi_rumah: "",
      kebutuhan_mendesak: [],
      hobi_minat: "",
      kondisi_psikologis: "",
      nama_pendamping: "",
      hubungan_dengan_lansia: "",
      tanggal_lahir_pendamping: "",
      pendidikan_pendamping: "",
      ketersediaan_waktu: "",
      partisipasi_program_bkl: "",
      riwayat_partisipasi_bkl: "",
      keterlibatan_data: "",
      bab: 0,
      bak: 0,
      membersihkan_diri: 0,
      toilet: 0,
      makan: 0,
      pindah_tempat: 0,
      mobilitas: 0,
      berpakaian: 0,
      naik_turun_tangga: 0,
    })
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="koordinat">Koordinat (Latitude, Longitude)</Label>
                    <Input
                      id="koordinat"
                      value={formData.koordinat}
                      onChange={(e) => handleInputChange("koordinat", e.target.value)}
                      placeholder="Contoh: -6.2088, 106.8456"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rt">RT</Label>
                      <Input id="rt" value={formData.rt} onChange={(e) => handleInputChange("rt", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="rw">RW</Label>
                      <Input id="rw" value={formData.rw} onChange={(e) => handleInputChange("rw", e.target.value)} />
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
                    <Label htmlFor="alat_bantu">Alat Bantu yang Digunakan</Label>
                    <Input
                      id="alat_bantu"
                      value={formData.alat_bantu}
                      onChange={(e) => handleInputChange("alat_bantu", e.target.value)}
                      placeholder="Contoh: Tongkat, Kacamata"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Living Activities (ADL) */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Kehidupan Sehari-hari (ADL)</CardTitle>
                  <CardDescription>
                    Penilaian kemampuan melakukan aktivitas sehari-hari (0=Tidak Mampu, 1=Bantuan, 2=Mandiri)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: "bab", label: "BAB (Buang Air Besar)" },
                      { key: "bak", label: "BAK (Buang Air Kecil)" },
                      { key: "membersihkan_diri", label: "Membersihkan Diri" },
                      { key: "toilet", label: "Menggunakan Toilet" },
                      { key: "makan", label: "Makan" },
                      { key: "pindah_tempat", label: "Pindah Tempat" },
                      { key: "mobilitas", label: "Mobilitas" },
                      { key: "berpakaian", label: "Berpakaian" },
                      { key: "naik_turun_tangga", label: "Naik Turun Tangga" },
                    ].map((item) => (
                      <div key={item.key}>
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <Select
                          value={formData[item.key as keyof typeof formData]?.toString() || "0"}
                          onValueChange={(value) => handleInputChange(item.key, Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - Tidak Mampu</SelectItem>
                            <SelectItem value="1">1 - Butuh Bantuan</SelectItem>
                            <SelectItem value="2">2 - Mandiri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <Label className="font-semibold">Total Skor ADL:</Label>
                    <p className="text-lg font-bold text-blue-600">
                      {Object.keys(formData)
                        .filter((key) =>
                          [
                            "bab",
                            "bak",
                            "membersihkan_diri",
                            "toilet",
                            "makan",
                            "pindah_tempat",
                            "mobilitas",
                            "berpakaian",
                            "naik_turun_tangga",
                          ].includes(key),
                        )
                        .reduce((total, key) => total + ((formData[key as keyof typeof formData] as number) || 0), 0)}
                      / 18
                    </p>
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
                      <Label htmlFor="tanggal_lahir_pendamping">Tanggal Lahir Pendamping</Label>
                      <Input
                        id="tanggal_lahir_pendamping"
                        type="date"
                        value={formData.tanggal_lahir_pendamping}
                        onChange={(e) => handleInputChange("tanggal_lahir_pendamping", e.target.value)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partisipasi_program_bkl">Partisipasi Program BKL</Label>
                      <Input
                        id="partisipasi_program_bkl"
                        value={formData.partisipasi_program_bkl}
                        onChange={(e) => handleInputChange("partisipasi_program_bkl", e.target.value)}
                        placeholder="Contoh: Posyandu Lansia"
                      />
                    </div>
                    <div>
                      <Label htmlFor="keterlibatan_data">Keterlibatan Data</Label>
                      <Input
                        id="keterlibatan_data"
                        value={formData.keterlibatan_data}
                        onChange={(e) => handleInputChange("keterlibatan_data", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="riwayat_partisipasi_bkl">Riwayat Partisipasi BKL</Label>
                    <Textarea
                      id="riwayat_partisipasi_bkl"
                      value={formData.riwayat_partisipasi_bkl}
                      onChange={(e) => handleInputChange("riwayat_partisipasi_bkl", e.target.value)}
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
