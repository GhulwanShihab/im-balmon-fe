// File: src/pages/user/Reports.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  Download,
  Calendar,
  Smartphone,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ReportsPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exportingId, setExportingId] = useState(null); // Added for loading state
  const [filters, setFilters] = useState({
    status: "",
    activity_name: "",
    date_range: "",
  });
  const [stats, setStats] = useState({
    total_loans: 0,
    active_loans: 0,
    completed_loans: 0,
    overdue_loans: 0,
  });
  const location = useLocation();

  useEffect(() => {
    fetchLoans();
    fetchStats();

    if (location.state?.loanId) {
      fetchLoanDetail(location.state.loanId);
    }
  }, [currentPage, filters, location.state]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = {
        page: currentPage,
        page_size: 10,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await axios.get("/api/v1/loans/my-loans", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setLoans(response.data.loans || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 10));
    } catch (error) {
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.get("/api/v1/loans/my-loans", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 },
      });

      const allLoans = response.data.loans || [];
      const stats = {
        total_loans: allLoans.length,
        active_loans: allLoans.filter((l) => l.status?.toUpperCase() === "ACTIVE").length,
        completed_loans: allLoans.filter((l) => l.status?.toUpperCase() === "RETURNED").length,
        overdue_loans: allLoans.filter((l) => l.status?.toUpperCase() === "OVERDUE").length,
      };

      setStats(stats);
    } catch (error) {
    }
  };

  const fetchLoanDetail = async (loanId) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.get(`/api/v1/loans/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedLoan(response.data);
      setShowDetailModal(true);
    } catch (error) {
    }
  };

  /**
   * ✨ FIXED: Export PDF function - sesuai dengan implementasi admin
   * Menggunakan endpoint /api/v1/loans/:id/export-pdf yang benar
   */
  const exportToPDF = async (loanId, loanNumber) => {
    try {
      setExportingId(loanId);
      
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      if (!token) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        window.location.href = '/login';
        return;
      }

      // Loading toast
      const loadingToast = toast.loading("Mengunduh PDF...");

      // Call the correct endpoint - FIXED: gunakan /export-pdf bukan /export
      const response = await axios.get(
        `/api/v1/loans/${loanId}/export-pdf`,
        {
          headers: { 
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
          },
          responseType: "blob",
        }
      );


      // Handle unauthorized
      if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        window.location.href = '/login';
        return;
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Generate filename with timestamp - sama seperti admin
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Berita_Acara_${loanNumber || loanId}_${timestamp}.pdf`;
      link.setAttribute("download", filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      
      toast.dismiss(loadingToast);
      toast.success(`Berita Acara berhasil diunduh: ${filename}`);
      
    } catch (error) {
      
      // Handle different error types with proper messages
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          window.location.href = '/login';
        } else if (error.response.status === 404) {
          toast.error("Data peminjaman tidak ditemukan.");
        } else if (error.response.status === 403) {
          toast.error("Anda tidak memiliki akses untuk export data ini.");
        } else {
          // Try to parse error message
          const errorMessage = error.response.data?.detail || "Gagal mengunduh laporan. Silakan coba lagi.";
          toast.error(errorMessage);
        }
      } else {
        toast.error("Terjadi kesalahan saat export PDF. Silakan coba lagi.");
      }
    } finally {
      setExportingId(null);
    }
  };

  const getStatusBadge = (loan) => {
    const normalizedStatus = loan.status?.toLowerCase();
    
    const statusConfig = {
      active: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Aktif",
        icon: Clock,
      },
      returned: {
        color: "bg-green-100 text-green-800",
        label: "Dikembalikan",
        icon: CheckCircle,
      },
      overdue: {
        color: "bg-red-100 text-red-800",
        label: "Terlambat",
        icon: AlertTriangle,
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800",
        label: "Dibatalkan",
        icon: Clock,
      },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.active;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const LoanDetailModal = () => {
    if (!showDetailModal || !selectedLoan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Detail Peminjaman
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">{getStatusBadge(selectedLoan)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kegiatan
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedLoan.activity_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  No. Surat Tugas
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedLoan.assignment_letter_number}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Peminjam
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedLoan.borrower_name}
                </p>
              </div>
            </div>

            {/* Device Info - List all borrowed devices */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Perangkat Yang Dipinjam
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                {selectedLoan.loan_items && selectedLoan.loan_items.length > 0 ? (
                  selectedLoan.loan_items.map((item, index) => {
                    const deviceInfo = item.child_device || item.device;
                    return (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">
                              Nama Perangkat
                            </label>
                            <p className="text-sm text-gray-900 mt-1 font-medium">
                              {deviceInfo?.device_name || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">
                              Kode Perangkat
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {deviceInfo?.device_code || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">
                              NUP
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {deviceInfo?.nup_device || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">
                              Brand
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {deviceInfo?.bmn_brand || deviceInfo?.sample_brand || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">
                              Kondisi Awal
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {item.condition_before === "BAIK"
                                ? "Baik"
                                : item.condition_before === "RUSAK"
                                ? "Rusak"
                                : item.condition_before === "MAINTENANCE"
                                ? "Maintenance"
                                : "-"}
                            </p>
                          </div>
                          {selectedLoan.status?.toUpperCase() === "RETURNED" && item.condition_after && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500">
                                Kondisi Saat Dikembalikan
                              </label>
                              <p className="text-sm text-gray-900 mt-1">
                                {item.condition_after === "BAIK"
                                  ? "Baik"
                                  : item.condition_after === "RUSAK"
                                  ? "Rusak"
                                  : item.condition_after === "MAINTENANCE"
                                  ? "Maintenance"
                                  : "-"}
                              </p>
                            </div>
                          )}
                        </div>
                        {item.condition_notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-500">
                              Catatan Kondisi
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {item.condition_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada data perangkat</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Timeline Peminjaman
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tanggal Mulai
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedLoan.loan_start_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tanggal Berakhir
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedLoan.loan_end_date)}
                    </p>
                  </div>
                </div>
                {selectedLoan.actual_return_date && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tanggal Dikembalikan
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedLoan.actual_return_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Return Info - Updated to show per-device condition */}
            {selectedLoan.status?.toUpperCase() === "RETURNED" && selectedLoan.loan_items && selectedLoan.loan_items.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Informasi Pengembalian
                </h3>
                <div className="bg-green-50 p-4 rounded-xl space-y-3">
                  {selectedLoan.loan_items.map((item, index) => {
                    const deviceInfo = item.child_device || item.device;
                    if (!item.condition_after) return null;
                    
                    return (
                      <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {deviceInfo?.device_name || '-'}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500">
                                  Kondisi Saat Dikembalikan
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                  {item.condition_after === "BAIK"
                                    ? "Baik"
                                    : item.condition_after === "RUSAK"
                                    ? "Rusak"
                                    : item.condition_after === "MAINTENANCE"
                                    ? "Maintenance"
                                    : "-"}
                                </p>
                              </div>
                              {item.condition_notes && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">
                                    Catatan
                                  </label>
                                  <p className="text-sm text-gray-900 mt-1">
                                    {item.condition_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                  
                  {selectedLoan.return_notes && (
                    <div className="bg-white p-3 rounded-lg border border-green-200 mt-2">
                      <label className="block text-xs font-medium text-gray-500">
                        Catatan Pengembalian Umum
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedLoan.return_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedLoan.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catatan Peminjaman
                </label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-xl">
                  {selectedLoan.notes}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between space-x-2">
            <button
              onClick={() => exportToPDF(selectedLoan.id, selectedLoan.loan_number)}
              disabled={exportingId === selectedLoan.id}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingId === selectedLoan.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedLoan(null);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Peminjaman</h1>
        <p className="text-gray-600 mt-1 leading-relaxed">
          Halaman ini menampilkan seluruh riwayat peminjaman perangkat Anda. 
          Gunakan <strong>filter</strong> di bawah untuk mencari berdasarkan status, kegiatan, atau periode tertentu. 
          Anda juga dapat mengunduh <strong>Berita Acara</strong> dalam format PDF untuk setiap peminjaman dengan menekan tombol "PDF" di kolom aksi.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Peminjaman"
          value={stats.total_loans}
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Aktif"
          value={stats.active_loans}
          color="yellow"
        />
        <StatCard
          icon={CheckCircle}
          title="Selesai"
          value={stats.completed_loans}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          title="Terlambat"
          value={stats.overdue_loans}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Filter Laporan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="RETURNED">Dikembalikan</option>
              <option value="OVERDUE">Terlambat</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kegiatan
            </label>
            <input
              type="text"
              placeholder="Cari nama kegiatan..."
              value={filters.activity_name}
              onChange={(e) =>
                setFilters({ ...filters, activity_name: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode
            </label>
            <select
              value={filters.date_range}
              onChange={(e) =>
                setFilters({ ...filters, date_range: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Semua Periode</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun Ini</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tidak ada laporan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tidak ditemukan data sesuai filter
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kegiatan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perangkat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {loan.activity_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.assignment_letter_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {loan.loan_items && loan.loan_items.length > 0 ? (
                        <div className="space-y-1">
                          {loan.loan_items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-xs">
                              {item.child_device?.device_name || item.device?.device_name || '-'}
                            </div>
                          ))}
                          {loan.loan_items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{loan.loan_items.length - 2} perangkat lainnya
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(loan.loan_start_date)} -{" "}
                      {formatDate(loan.loan_end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(loan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => fetchLoanDetail(loan.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Detail
                      </button>
                      <button
                        onClick={() => exportToPDF(loan.id, loan.loan_number)}
                        disabled={exportingId === loan.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {exportingId === loan.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" /> PDF
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <LoanDetailModal />
    </div>
  );
};

export default ReportsPage;