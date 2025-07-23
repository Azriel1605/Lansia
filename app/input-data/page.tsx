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
import {genderOptions, perkawinanOptions, agamaOptions, pendidikanOptions,
        pekerjaanOptions, penghasilanOptions, kesehatanOptions, penyakitOptions,
        obatOptions, alatBantuOptions, aktivitasOptions, giziOptions, imunisasiOptions,
        dukunganOptions, rumahOptions, kebutuhanMendesakOptions, hobiOptions,
        psikologisOptions, dataBKLOptions, riwayatBKLOptions, keterlibatanDanaOptions,
        adlOptions, adlGetOptions, hubunganOptions, ketersediaanWaktuOptions} from "@/lib/options"
        
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
    window.scrollTo({ top:0, behavior: 'smooth'})
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
        a.download = "Template Input Lansia.xlsm"
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
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls") && !file.name.toLowerCase().endsWith(".xlsm")) {
        setError("Format file tidak valid. Harap upload file Excel (.xlsx atau .xls)")
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB")
        return
      }

      setError("") // Clear any previous errors
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

      console.log("Uploading file:", uploadFile.name) // Debug log

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-excel`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      console.log("Response status:", response.status) // Debug log

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload error:", errorText) // Debug log
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Upload response:", data) // Debug log

      if (data.count !== undefined) {
        setMessage(`Berhasil mengupload ${data.count} data lansia`)
        setUploadFile(null)
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }

        // Show errors if any
        if (data.errors && data.errors.length > 0) {
          console.warn("Upload errors:", data.errors)
          setError(`Upload Gagal, Silahkan Perbaiki Data berikut: ${data.errors.slice(0, 3).join(", ")}`)
        }
      } else {
        setError(data.message || "Terjadi kesalahan saat mengupload file")
      }
    } catch (err) {
      console.error("Upload error:", err) // Debug log
      setError(`Network error: ${err instanceof Error ? err.message : "Please try again."}`)
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
                        minLength={16}
                        maxLength={16}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                      <Select
                        value={formData.jenis_kelamin}
                        onValueChange={(value) => handleInputChange("jenis_kelamin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                      <Input
                        required
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
                          {perkawinanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
                          {agamaOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
                          {pendidikanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div>
                      <Label htmlFor="pekerjaan_terakhir">Pekerjaan Terakhir</Label>
                      <Select
                        value={formData.pekerjaan_terakhir}
                        onValueChange={(value) => handleInputChange("pekerjaan_terakhir", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Pekerjaan" />
                        </SelectTrigger>
                        <SelectContent>
                          {pekerjaanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sumber_penghasilan">Sumber Penghasilan</Label>
                      <Select
                        value={formData.sumber_penghasilan}
                        onValueChange={(value) => handleInputChange("sumber_penghasilan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Penghasilan" />
                        </SelectTrigger>
                        <SelectContent>
                          {penghasilanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="kondisi_kesehatan_umum">Kondisi Kesehatan Umum</Label>
                      <Select
                          value={formData.kondisi_kesehatan_umum}
                          onValueChange={(value) => handleInputChange("kondisi_kesehatan_umum", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kondisi Kesehatan" />
                          </SelectTrigger>
                          <SelectContent>
                            {kesehatanOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                      <Label htmlFor="penggunaan_obat_rutin">Penggunaan Obat Rutin</Label>
                      <Select
                        value={formData.penggunaan_obat_rutin}
                        onValueChange={(value) => handleInputChange("penggunaan_obat_rutin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Penggunaan Obat Rutin" />
                        </SelectTrigger>
                        <SelectContent>
                          {obatOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          {giziOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aktivitas_fisik">Aktivitas Fisik</Label>
                      <Select
                        value={formData.aktivitas_fisik}
                        onValueChange={(value) => handleInputChange("aktivitas_fisik", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Aktivitas Fisik" />
                        </SelectTrigger>
                        <SelectContent>
                          {aktivitasOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Riwayat Penyakit Kronis</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {penyakitOptions.map((disease) => (
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

                  <div>
                    <Label>Riwayat Imunisasi</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {imunisasiOptions.map((imunisasi) => (
                      <div key={imunisasi} className="flex items-center space-x-2">
                          <Checkbox
                            id={imunisasi}
                            checked={formData.riwayat_imunisasi.includes(imunisasi)}
                            onCheckedChange={(checked) =>
                              handleArrayChange("riwayat_imunisasi", imunisasi, checked as boolean)
                            }
                          />
                          <Label htmlFor={imunisasi} className="text-sm">
                            {imunisasi}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Alat Bantu yang Digunakan</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {alatBantuOptions.map((alat) => (
                      <div key={alat} className="flex items-center space-x-2">
                          <Checkbox
                            id={alat}
                            checked={formData.alat_bantu.includes(alat)}
                            onCheckedChange={(checked) =>
                              handleArrayChange("alat_bantu", alat, checked as boolean)
                            }
                          />
                          <Label htmlFor={alat} className="text-sm">
                            {alat}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kesejahteraan Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Data kesejahteraan</CardTitle>
                  <CardDescription>Informasi kondisi kesejahteraan lansia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dukungan_keluarga">Kondisi Dukungan Keluarga</Label>
                      <Select
                        value={formData.dukungan_keluarga}
                        onValueChange={(value) => handleInputChange("dukungan_keluarga", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi Dukungan Keluarga" />
                        </SelectTrigger>
                        <SelectContent>
                          {dukunganOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kondisi_rumah">Kondisi Rumah</Label>
                      <Select
                        value={formData.kondisi_rumah}
                        onValueChange={(value) => handleInputChange("kondisi_rumah", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi Rumah" />
                        </SelectTrigger>
                        <SelectContent>
                          {rumahOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Kebutuhan Mendesak</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {kebutuhanMendesakOptions.map((kebutuhan) => (
                      <div key={kebutuhan} className="flex items-center space-x-2">
                          <Checkbox
                            id={kebutuhan}
                            checked={formData.kebutuhan_mendesak.includes(kebutuhan)}
                            onCheckedChange={(checked) =>
                              handleArrayChange("kebutuhan_mendesak", kebutuhan, checked as boolean)
                            }
                          />
                          <Label htmlFor={kebutuhan} className="text-sm">
                            {kebutuhan}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hobi_minat">Hobi atau Minat</Label>
                      <Select
                        value={formData.hobi_minat}
                        onValueChange={(value) => handleInputChange("hobi_minat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hobi/minat" />
                        </SelectTrigger>
                        <SelectContent>
                          {hobiOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kondisi_psikologis">Kondisi Psikologis</Label>
                      <Select
                        value={formData.kondisi_psikologis}
                        onValueChange={(value) => handleInputChange("kondisi_psikologis", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi Psikologis" />
                        </SelectTrigger>
                        <SelectContent>
                          {psikologisOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                          ))}
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
                          {hubunganOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
                          {pendidikanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
                          {ketersediaanWaktuOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
                  {adlOptions.map((item) => (
                      <div key={item.key}>
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <Select
                          value={formData[item.key as keyof typeof formData]?.toString() || "0"}
                          onValueChange={(value) => handleInputChange(item.key, parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {adlGetOptions(item.key).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
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
                            "mandi",
                          ].includes(key),
                        )
                        .reduce((total, key) => total + ((formData[key as keyof typeof formData] as number) || 0), 0)}
                      / 20
                    </p>
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

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add("border-blue-400", "bg-blue-50")
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
                        const files = e.dataTransfer.files
                        if (files.length > 0) {
                          const file = files[0]
                          if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls") || file.name.toLowerCase().endsWith(".xlsm")) {
                            setUploadFile(file)
                          } else {
                            setError("Format file tidak valid. Harap upload file Excel (.xlsx atau .xls)")
                          }
                        }
                      }}
                    >
                      <div className="text-center w-full">
                        <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <div className="space-y-2">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-lg font-medium text-gray-900 hover:text-blue-600 block">
                              Klik untuk pilih file Excel
                            </span>
                            <span className="text-sm text-gray-500 block mt-1">atau drag & drop file di area ini</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".xlsx,.xls,.xlsm"
                              className="sr-only"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="text-xs text-gray-400 mt-3">
                            Format yang didukung: .xlsx, .xls, .xlsm (Maksimal: 10MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadFile && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileUp className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900">{uploadFile.name}</p>
                              <p className="text-xs text-blue-700">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setUploadFile(null)
                              const fileInput = document.getElementById("file-upload") as HTMLInputElement
                              if (fileInput) {
                                fileInput.value = ""
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleUploadSubmit} disabled={!uploadFile || isLoading} className="min-w-[120px]">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mengupload...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Catatan Penting:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Pastikan format file sesuai dengan template yang disediakan</li>
                    <li>• NIK harus unik dan tidak boleh duplikat</li>
                    <li>• Tanggal lahir harus dalam format YYYY-MM-DD</li>
                    <li>• Kolom yang wajib diisi: Nama Lengkap, NIK, Jenis Kelamin</li>
                    <li>• File maksimal berukuran 10MB</li>
                    <li>• Pastikan tidak ada baris kosong di tengah data</li>
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
