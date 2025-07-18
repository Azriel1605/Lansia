"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Heart,
  Home,
  Users,
  Save,
  X,
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
  const [editingLansia, setEditingLansia] = useState<LansiaDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ genders: [], age_groups: [], rws: [] })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)

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
    fetchData(true)
  }, [])

  useEffect(() => {
    if (!isInitialLoading) {
      setCurrentPage(1)
      fetchData()
    }
  }, [searchDebounce, genderFilter, ageGroupFilter, rwFilter, sortBy, sortOrder])

  useEffect(() => {
    if (!isInitialLoading) {
      fetchData()
    }
  }, [currentPage, perPage])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, error])

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
        setSelectedIds([])
        setSelectAll(false)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Gagal memuat data")
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
      setError("Gagal memuat detail data")
    }
  }

  const fetchEditData = async (id: number) => {
    try {
      const response = await dataAPI.getLansiaDetail(id)
      if (response.ok) {
        const data = await response.json()
        setEditingLansia(data)
        setIsEditOpen(true)
      }
    } catch (error) {
      console.error("Error fetching edit data:", error)
      setError("Gagal memuat data untuk edit")
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

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(data.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
      setSelectAll(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data?`)) return

    try {
      const response = await dataAPI.bulkDeleteLansia(selectedIds)
      if (response.ok) {
        setMessage(`${selectedIds.length} data berhasil dihapus`)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal menghapus data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus data")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return

    try {
      const response = await dataAPI.deleteLansia(id)
      if (response.ok) {
        setMessage("Data berhasil dihapus")
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal menghapus data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus data")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingLansia) return

    setIsSaving(true)
    try {
      const response = await dataAPI.updateLansia(editingLansia.id, editingLansia)
      if (response.ok) {
        setMessage("Data berhasil diperbarui")
        setIsEditOpen(false)
        setEditingLansia(null)
        fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Gagal memperbarui data")
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memperbarui data")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditChange = (field: string, value: any) => {
    if (!editingLansia) return
    setEditingLansia({
      ...editingLansia,
      [field]: value,
    })
  }

  const handleEditNestedChange = (section: string, field: string, value: any) => {
    if (!editingLansia) return
    setEditingLansia({
      ...editingLansia,
      [section]: {
        ...editingLansia[section as keyof LansiaDetail],
        [field]: value,
      },
    })
  }

  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(perPage)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-24" />
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Lansia</h1>
          <p className="mt-2 text-gray-600">Kelola dan lihat data lansia yang terdaftar</p>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                <div className="flex flex-wrap gap-2">
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-full sm:w-40">
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
                    <SelectTrigger className="w-full sm:w-40">
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
                    <SelectTrigger className="w-full sm:w-32">
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

                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">{selectedIds.length} item dipilih</span>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Terpilih
                  </Button>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="relative">
              {isTableLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                {isTableLoading ? (
                  <TableSkeleton />
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 w-12">
                          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                        </th>
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
                          <td className="p-4">
                            <Checkbox
                              checked={selectedIds.includes(lansia.id)}
                              onCheckedChange={(checked) => handleSelectItem(lansia.id, checked as boolean)}
                              aria-label={`Select ${lansia.nama_lengkap}`}
                            />
                          </td>
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
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => fetchDetailedData(lansia.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => fetchEditData(lansia.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(lansia.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {isTableLoading ? (
                  <div className="space-y-4">
                    {[...Array(perPage)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  data.map((lansia) => (
                    <div key={lansia.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedIds.includes(lansia.id)}
                            onCheckedChange={(checked) => handleSelectItem(lansia.id, checked as boolean)}
                            aria-label={`Select ${lansia.nama_lengkap}`}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{lansia.nama_lengkap}</h3>
                            <p className="text-sm text-gray-500 font-mono">{lansia.nik}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(lansia.kelompok_usia)}>{lansia.kelompok_usia}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Jenis Kelamin:</span>
                          <p className="font-medium">{lansia.jenis_kelamin}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Usia:</span>
                          <p className="font-medium">{lansia.usia} tahun</p>
                        </div>
                        <div>
                          <span className="text-gray-500">RT/RW:</span>
                          <p className="font-medium">
                            RT {lansia.rt} / RW {lansia.rw}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className="font-medium">{lansia.status_perkawinan}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Alamat:</span>
                        <p className="text-sm">{lansia.alamat_lengkap}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchDetailedData(lansia.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => fetchEditData(lansia.id)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lansia.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
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
                <span className="text-gray-600">per halaman</span>
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

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Data Lansia</DialogTitle>
              <DialogDescription>Ubah informasi data lansia</DialogDescription>
            </DialogHeader>

            {editingLansia && (
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
                      <Label htmlFor="edit-nama">Nama Lengkap</Label>
                      <Input
                        id="edit-nama"
                        value={editingLansia.nama_lengkap}
                        onChange={(e) => handleEditChange("nama_lengkap", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-nik">NIK</Label>
                      <Input
                        id="edit-nik"
                        value={editingLansia.nik}
                        onChange={(e) => handleEditChange("nik", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">Jenis Kelamin</Label>
                      <Select
                        value={editingLansia.jenis_kelamin}
                        onValueChange={(value) => handleEditChange("jenis_kelamin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-birth">Tanggal Lahir</Label>
                      <Input
                        id="edit-birth"
                        type="date"
                        value={editingLansia.tanggal_lahir}
                        onChange={(e) => handleEditChange("tanggal_lahir", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-address">Alamat Lengkap</Label>
                      <Textarea
                        id="edit-address"
                        value={editingLansia.alamat_lengkap}
                        onChange={(e) => handleEditChange("alamat_lengkap", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-rt">RT</Label>
                      <Input
                        id="edit-rt"
                        value={editingLansia.rt}
                        onChange={(e) => handleEditChange("rt", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-rw">RW</Label>
                      <Input
                        id="edit-rw"
                        value={editingLansia.rw}
                        onChange={(e) => handleEditChange("rw", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-marriage">Status Perkawinan</Label>
                      <Select
                        value={editingLansia.status_perkawinan}
                        onValueChange={(value) => handleEditChange("status_perkawinan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="edit-religion">Agama</Label>
                      <Select value={editingLansia.agama} onValueChange={(value) => handleEditChange("agama", value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-health-condition">Kondisi Kesehatan Umum</Label>
                      <Select
                        value={editingLansia.kesehatan?.kondisi_kesehatan_umum || ""}
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "kondisi_kesehatan_umum", value)}
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
                      <Label htmlFor="edit-nutrition">Status Gizi</Label>
                      <Select
                        value={editingLansia.kesehatan?.status_gizi || ""}
                        onValueChange={(value) => handleEditNestedChange("kesehatan", "status_gizi", value)}
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
                    <div className="col-span-2">
                      <Label htmlFor="edit-medication">Penggunaan Obat Rutin</Label>
                      <Textarea
                        id="edit-medication"
                        value={editingLansia.kesehatan?.penggunaan_obat_rutin || ""}
                        onChange={(e) => handleEditNestedChange("kesehatan", "penggunaan_obat_rutin", e.target.value)}
                        placeholder="Contoh: Amlodipine 5mg 1x sehari"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-activity">Aktivitas Fisik</Label>
                      <Input
                        id="edit-activity"
                        value={editingLansia.kesehatan?.aktivitas_fisik || ""}
                        onChange={(e) => handleEditNestedChange("kesehatan", "aktivitas_fisik", e.target.value)}
                        placeholder="Contoh: Jalan pagi 3x seminggu"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-immunization">Riwayat Imunisasi</Label>
                      <Input
                        id="edit-immunization"
                        value={editingLansia.kesehatan?.riwayat_imunisasi || ""}
                        onChange={(e) => handleEditNestedChange("kesehatan", "riwayat_imunisasi", e.target.value)}
                        placeholder="Contoh: Flu 2023, Pneumonia 2022"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-family-support">Dukungan Keluarga</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.dukungan_keluarga || ""}
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "dukungan_keluarga", value)}
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
                    <div>
                      <Label htmlFor="edit-house-condition">Kondisi Rumah</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.kondisi_rumah || ""}
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "kondisi_rumah", value)}
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
                      <Label htmlFor="edit-psychology">Kondisi Psikologis</Label>
                      <Select
                        value={editingLansia.kesejahteraan?.kondisi_psikologis || ""}
                        onValueChange={(value) => handleEditNestedChange("kesejahteraan", "kondisi_psikologis", value)}
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
                    <div>
                      <Label htmlFor="edit-hobbies">Hobi & Minat</Label>
                      <Textarea
                        id="edit-hobbies"
                        value={editingLansia.kesejahteraan?.hobi_minat || ""}
                        onChange={(e) => handleEditNestedChange("kesejahteraan", "hobi_minat", e.target.value)}
                        placeholder="Contoh: Berkebun, memasak, menonton TV"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-caregiver-name">Nama Pendamping</Label>
                      <Input
                        id="edit-caregiver-name"
                        value={editingLansia.keluarga?.nama_pendamping || ""}
                        onChange={(e) => handleEditNestedChange("keluarga", "nama_pendamping", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-relationship">Hubungan dengan Lansia</Label>
                      <Select
                        value={editingLansia.keluarga?.hubungan_dengan_lansia || ""}
                        onValueChange={(value) => handleEditNestedChange("keluarga", "hubungan_dengan_lansia", value)}
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
                    <div>
                      <Label htmlFor="edit-caregiver-age">Usia Pendamping</Label>
                      <Input
                        id="edit-caregiver-age"
                        type="number"
                        value={editingLansia.keluarga?.usia_pendamping || ""}
                        onChange={(e) => handleEditNestedChange("keluarga", "usia_pendamping", e.target.value)}
                        min="0"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-caregiver-education">Pendidikan Pendamping</Label>
                      <Select
                        value={editingLansia.keluarga?.pendidikan_pendamping || ""}
                        onValueChange={(value) => handleEditNestedChange("keluarga", "pendidikan_pendamping", value)}
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
                      <Label htmlFor="edit-availability">Ketersediaan Waktu</Label>
                      <Select
                        value={editingLansia.keluarga?.ketersediaan_waktu || ""}
                        onValueChange={(value) => handleEditNestedChange("keluarga", "ketersediaan_waktu", value)}
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
                    <div>
                      <Label htmlFor="edit-bkl-participation">Partisipasi Program BKL</Label>
                      <Input
                        id="edit-bkl-participation"
                        value={editingLansia.keluarga?.partisipasi_program_bkl || ""}
                        onChange={(e) => handleEditNestedChange("keluarga", "partisipasi_program_bkl", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-bkl-history">Riwayat Partisipasi BKL</Label>
                      <Textarea
                        id="edit-bkl-history"
                        value={editingLansia.keluarga?.riwayat_partisipasi_bkl || ""}
                        onChange={(e) => handleEditNestedChange("keluarga", "riwayat_partisipasi_bkl", e.target.value)}
                        placeholder="Contoh: Aktif sejak 2020, pernah menjadi ketua kelompok"
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
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
