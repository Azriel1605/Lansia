"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pendidikanOptions, hubunganOptions, ketersediaanWaktuOptions } from "@/lib/options"

interface FamilyData {
  nama_pendamping: string
  hubungan_dengan_lansia: string
  tanggal_lahir_pendamping: string
  pendidikan_pendamping: string
  ketersediaan_waktu: string
  partisipasi_program_bkl: string
  riwayat_partisipasi_bkl: string
  keterlibatan_data: string
}

interface FamilyDataSectionProps {
  data: FamilyData
  onChange: (field: string, value: any) => void
}

const FamilyDataSection = React.memo(({ data, onChange }: FamilyDataSectionProps) => {
  return (
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
              value={data.nama_pendamping}
              onChange={(e) => onChange("nama_pendamping", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hubungan_dengan_lansia">Hubungan dengan Lansia</Label>
            <Select
              value={data.hubungan_dengan_lansia}
              onValueChange={(value) => onChange("hubungan_dengan_lansia", value)}
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
              value={data.tanggal_lahir_pendamping}
              onChange={(e) => onChange("tanggal_lahir_pendamping", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pendidikan_pendamping">Pendidikan Pendamping</Label>
            <Select
              value={data.pendidikan_pendamping}
              onValueChange={(value) => onChange("pendidikan_pendamping", value)}
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
            <Select value={data.ketersediaan_waktu} onValueChange={(value) => onChange("ketersediaan_waktu", value)}>
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
              value={data.partisipasi_program_bkl}
              onChange={(e) => onChange("partisipasi_program_bkl", e.target.value)}
              placeholder="Contoh: Posyandu Lansia"
            />
          </div>
          <div>
            <Label htmlFor="keterlibatan_data">Keterlibatan Data</Label>
            <Input
              id="keterlibatan_data"
              value={data.keterlibatan_data}
              onChange={(e) => onChange("keterlibatan_data", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="riwayat_partisipasi_bkl">Riwayat Partisipasi BKL</Label>
          <Textarea
            id="riwayat_partisipasi_bkl"
            value={data.riwayat_partisipasi_bkl}
            onChange={(e) => onChange("riwayat_partisipasi_bkl", e.target.value)}
            placeholder="Contoh: Aktif sejak 2020, pernah menjadi ketua kelompok"
          />
        </div>
      </CardContent>
    </Card>
  )
})

FamilyDataSection.displayName = "FamilyDataSection"

export default FamilyDataSection
