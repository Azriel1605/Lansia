"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Home,
  Users,
  Loader2,
} from "lucide-react"
import { dataAPI } from "@/lib/api"
import RouteGuard from "@/components/route-guard"

interface LansiaData {
  id: number
  nama_lengkap: string
  nik: string
  jenis_kelamin: string
  usia: number
  rt: string
  rw: string
  kelompok_usia: string
  alamat_lengkap: string
  status_perkawinan: string
  created_at: string
}

interface LansiaDetail {
  id: number
  nama_lengkap: string
  nik: string
  jenis_kelamin: string
  tanggal_lahir: string
  usia: number
  kelompok_usia: string
  alamat_lengkap: string
  rt: string
  rw: string
  status_perkawinan: string
  agama: string
  pendidikan_terakhir: string
  pekerjaan_terakhir: string
  sumber_penghasilan: string
  kesehatan: any
  kesejahteraan: any
  keluarga: any
  daily_living: any
  created_at: string
}

interface FilterOptions {
  genders: string[]
  age_groups: string[]
  rws: string[]
}

function DataTableContent() {
  const [data, setData] = useState<LansiaData[]>([])
  const [selectedLansia, setSelectedLansia] = useState<LansiaDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ genders: [], age_groups: [], rws: [] })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [ageGroupFilter, setAgeGroupFilter] = useState("all")
  const [rwFilter, setRwFilter] = useState("all")

  // Sorting
  const [sortBy, setSortBy] = useState("nama_lengkap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchFilterOptions()
    // Load initial data without filters
    fetchData(true)
  }, [])

  useEffect(() => {
    if (!isInitialLoading) {
      setCurrentPage(1) // Reset to first page when filters change
      fetchData()
    }
  }, [searchDebounce, genderFilter, ageGroupFilter, rwFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!isInitialLoading) {
      fetchData()
    }
  }, [currentPage, perPage])

  const fetchFilterOptions = async () => {
    try {
      const response = await dataAPI.getFilterOptions()
      if (response.ok) {
        const options = await response.json()
        setFilterOptions(options)
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchData = async (initial = false) => {
    if (initial) {
      setIsInitialLoading(true)
    } else {
      setIsTableLoading(true)
    }

    try {
      const filters = {
        search: searchDebounce,
        gender: genderFilter === "all" ? "" : genderFilter,
        age_group: ageGroupFilter === "all" ? "" : ageGroupFilter,
        rw: rwFilter === "all" ? "" : rwFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      }

      const response = await dataAPI.getLansia(currentPage, perPage, filters)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
        setTotalPages(result.pages)
        setTotalItems(result.total)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      if (initial) {
        setIsInitialLoading(false)
      } else {
        setIsTableLoading(false)
      }
    }
  }

  const fetchDetailedData = async (id: number) => {
    try {
      const response = await dataAPI.getLansiaDetail(id)
      if (response.ok) {
        const data = await response.json()
        setSelectedLansia(data)
        setIsDetailOpen(true)
      }
    } catch (error) {
      console.error("Error fetching detailed data:", error)
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const clearFilters = () => {
    setSearchTerm("")
    setGenderFilter("all")
    setAgeGroupFilter("all")
    setRwFilter("all")
    setCurrentPage(1)
  }

  const getStatusBadge = (kelompokUsia: string) => {
    const colors = {
      "Pra Lansia": "bg-blue-100 text-blue-800",
      "Lansia Muda": "bg-green-100 text-green-800",
      "Lansia Madya": "bg-yellow-100 text-yellow-800",
      "Lansia Tua": "bg-red-100 text-red-800",
    }
    return colors[kelompokUsia as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(perPage)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Lansia</h1>
          <p className="mt-2 text-gray-600">Kelola dan lihat data lansia yang terdaftar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Lansia</CardTitle>
            <CardDescription>Total {totalItems} data lansia terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama, NIK, atau alamat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Kelompok Usia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.age_groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rwFilter} onValueChange={setRwFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="RW" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {filterOptions.rws.map((rw) => (
                        <SelectItem key={rw} value={rw}>
                          RW {rw}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="relative">
              {isTableLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}

              <div className="overflow-x-auto">
                {isTableLoading ? (
                  <TableSkeleton />
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("nama_lengkap")} className="font-semibold">
                            Nama Lengkap
                            {getSortIcon("nama_lengkap")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("nik")} className="font-semibold">
                            NIK
                            {getSortIcon("nik")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("jenis_kelamin")} className="font-semibold">
                            Jenis Kelamin
                            {getSortIcon("jenis_kelamin")}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("usia")} className="font-semibold">
                            Usia
                            {getSortIcon("usia")}
                          </Button>
                        </th>
                        <th className="text-left p-4">Kelompok Usia</th>
                        <th className="text-left p-4">
                          <Button variant="ghost" onClick={() => handleSort("rw")} className="font-semibold">
                            RT/RW
                            {getSortIcon("rw")}
                          </Button>
                        </th>
                        <th className="text-left p-4">Alamat</th>
                        <th className="text-center p-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((lansia) => (
                        <tr key={lansia.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{lansia.nama_lengkap}</td>
                          <td className="p-4 font-mono text-sm">{lansia.nik}</td>
                          <td className="p-4">{lansia.jenis_kelamin}</td>
                          <td className="p-4">{lansia.usia} tahun</td>
                          <td className="p-4">
                            <Badge className={getStatusBadge(lansia.kelompok_usia)}>{lansia.kelompok_usia}</Badge>
                          </td>
                          <td className="p-4">
                            RT {lansia.rt} / RW {lansia.rw}
                          </td>
                          <td className="p-4 max-w-xs truncate">{lansia.alamat_lengkap}</td>
                          <td className="p-4 text-center">
                            <Button variant="outline" size="sm" onClick={() => fetchDetailedData(lansia.id)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalItems)} dari{" "}
                  {totalItems} data
                </span>
                <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>

                <span className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Data Lansia</DialogTitle>
              <DialogDescription>Informasi lengkap data lansia</DialogDescription>
            </DialogHeader>

            {selectedLansia && (
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="health">
                    <Heart className="h-4 w-4 mr-2" />
                    Kesehatan
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Home className="h-4 w-4 mr-2" />
                    Sosial
                  </TabsTrigger>
                  <TabsTrigger value="family">
                    <Users className="h-4 w-4 mr-2" />
                    Keluarga
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Nama Lengkap</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.nama_lengkap}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">NIK</Label>
                      <p className="text-sm text-gray-600 font-mono">{selectedLansia.nik}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Jenis Kelamin</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.jenis_kelamin}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Tanggal Lahir</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.tanggal_lahir || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Usia</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.usia} tahun</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Kelompok Usia</Label>
                      <Badge className={getStatusBadge(selectedLansia.kelompok_usia)}>
                        {selectedLansia.kelompok_usia}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Label className="font-semibold">Alamat Lengkap</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.alamat_lengkap}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">RT/RW</Label>
                      <p className="text-sm text-gray-600">
                        RT {selectedLansia.rt} / RW {selectedLansia.rw}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Status Perkawinan</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.status_perkawinan || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Agama</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.agama || "-"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Pendidikan Terakhir</Label>
                      <p className="text-sm text-gray-600">{selectedLansia.pendidikan_terakhir || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  {selectedLansia.kesehatan ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Kondisi Kesehatan Umum</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.kesehatan.kondisi_kesehatan_umum || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Status Gizi</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.status_gizi || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Riwayat Penyakit Kronis</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesehatan.riwayat_penyakit_kronis?.length > 0 ? (
                            selectedLansia.kesehatan.riwayat_penyakit_kronis.map((penyakit: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {penyakit}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Alat Bantu</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesehatan.alat_bantu?.length > 0 ? (
                            selectedLansia.kesehatan.alat_bantu.map((alat: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {alat}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Aktivitas Fisik</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesehatan.aktivitas_fisik || "-"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Data kesehatan belum tersedia</p>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  {selectedLansia.kesejahteraan ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Dukungan Keluarga</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.dukungan_keluarga || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Kondisi Rumah</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.kondisi_rumah || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Kebutuhan Mendesak</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLansia.kesejahteraan.kebutuhan_mendesak?.length > 0 ? (
                            selectedLansia.kesejahteraan.kebutuhan_mendesak.map((kebutuhan: string, index: number) => (
                              <Badge key={index} variant="destructive">
                                {kebutuhan}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">Tidak ada</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold">Kondisi Psikologis</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.kesejahteraan.kondisi_psikologis || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Hobi & Minat</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.kesejahteraan.hobi_minat || "-"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Data kesejahteraan sosial belum tersedia</p>
                  )}
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  {selectedLansia.keluarga ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Nama Pendamping</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.nama_pendamping || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Hubungan dengan Lansia</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.hubungan_dengan_lansia || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Usia Pendamping</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.usia_pendamping
                            ? `${selectedLansia.keluarga.usia_pendamping} tahun`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Pendidikan Pendamping</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.pendidikan_pendamping || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Ketersediaan Waktu</Label>
                        <p className="text-sm text-gray-600">{selectedLansia.keluarga.ketersediaan_waktu || "-"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Partisipasi Program BKL</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.partisipasi_program_bkl || "-"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Riwayat Partisipasi BKL</Label>
                        <p className="text-sm text-gray-600">
                          {selectedLansia.keluarga.riwayat_partisipasi_bkl || "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Data keluarga pendamping belum tersedia</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function DataTablePage() {
  return (
    <RouteGuard requireAuth={true}>
      <DataTableContent />
    </RouteGuard>
  )
}
