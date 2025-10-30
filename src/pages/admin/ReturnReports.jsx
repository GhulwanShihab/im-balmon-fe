import { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  User
} from 'lucide-react';

const ReturnReports = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    borrower_name: '',
    assignment_letter_number: '',
    loan_start_date_from: '',
    loan_start_date_to: '',
    sort_by: 'loan_start_date',
    sort_order: 'desc'
  });

  const [stats, setStats] = useState({
    total_loans: 0,
    active_loans: 0,
    returned_loans: 0,
    overdue_loans: 0,
    cancelled_loans: 0
  });

  useEffect(() => {
    fetchLoans();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchLoanStats();
  }, []);

  const getAuthHeaders = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (!token) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = '/login';
      return null;
    }
    
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return {
      'Authorization': authToken,
      'Content-Type': 'application/json'
    };
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '10',
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.borrower_name) params.append('borrower_name', filters.borrower_name);
      if (filters.assignment_letter_number) params.append('assignment_letter_number', filters.assignment_letter_number);
      if (filters.loan_start_date_from) params.append('loan_start_date_from', filters.loan_start_date_from);
      if (filters.loan_start_date_to) params.append('loan_start_date_to', filters.loan_start_date_to);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const response = await fetch(`http://localhost:8000/api/v1/loans?${params}`, {
        method: 'GET',
        headers: headers
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoans(data.loans || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanStats = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('http://localhost:8000/api/v1/loans/stats', {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          total_loans: data.total_loans || 0,
          active_loans: data.active_loans || 0,
          returned_loans: data.returned_loans || 0,
          overdue_loans: data.overdue_loans || 0,
          cancelled_loans: data.cancelled_loans || 0
        });
      }
    } catch (error) {
      console.error('Error fetching loan stats:', error);
    }
  };

  const handleExportSingle = async (loanId, loanNumber) => {
    try {
      setExportingId(loanId);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`http://localhost:8000/api/v1/loans/${loanId}/export`, {
        method: 'GET',
        headers: {
          'Authorization': headers.Authorization
        }
      });
      
      if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pengembalian-${loanNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Gagal export laporan. Endpoint mungkin belum tersedia.');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Gagal export laporan.');
    } finally {
      setExportingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-blue-100 text-blue-800', label: 'Aktif' },
      'RETURNED': { color: 'bg-green-100 text-green-800', label: 'Dikembalikan' },
      'OVERDUE': { color: 'bg-red-100 text-red-800', label: 'Terlambat' },
      'CANCELLED': { color: 'bg-gray-100 text-gray-800', label: 'Dibatalkan' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      gray: 'bg-gray-50 text-gray-600'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const LoanDetailModal = ({ loan, isOpen, onClose }) => {
    if (!isOpen || !loan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Detail Peminjaman</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Peminjaman</label>
                <p className="text-sm text-gray-900 mt-1">{loan.loan_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(loan.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peminjam</label>
                <p className="text-sm text-gray-900 mt-1">{loan.borrower_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Surat Tugas</label>
                <p className="text-sm text-gray-900 mt-1">{loan.assignment_letter_number}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Kegiatan</label>
                <p className="text-sm text-gray-900 mt-1">{loan.activity_name}</p>
              </div>
            </div>

            {/* Device Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Perangkat yang Dipinjam</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {loan.loan_items && loan.loan_items.length > 0 ? (
                  loan.loan_items.map((item, index) => (
                    <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Perangkat #{index + 1}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Device ID: {item.device_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Kondisi Awal</p>
                          <p className="text-sm font-medium">{item.condition_before}</p>
                        </div>
                      </div>
                      {item.condition_after && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Kondisi Akhir</p>
                              <p className="text-sm font-medium">{item.condition_after}</p>
                            </div>
                            {item.condition_notes && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Catatan</p>
                                <p className="text-sm">{item.condition_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada perangkat</p>
                )}
              </div>
            </div>

            {/* Loan Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Jadwal Peminjaman</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(loan.loan_start_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(loan.loan_end_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Dikembalikan</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {loan.actual_return_date ? formatDate(loan.actual_return_date) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Info */}
            {loan.status === 'RETURNED' && loan.return_notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Pengembalian</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700">Catatan Pengembalian</label>
                  <p className="text-sm text-gray-900 mt-1">{loan.return_notes}</p>
                </div>
              </div>
            )}

            {/* Purpose */}
            {loan.purpose && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tujuan Peminjaman</label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{loan.purpose}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Pengembalian</h1>
          <p className="text-gray-600 mt-1">Kelola dan pantau status pengembalian perangkat</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={RotateCcw}
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
          title="Dikembalikan"
          value={stats.returned_loans}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          title="Terlambat"
          value={stats.overdue_loans}
          color="red"
        />
        <StatCard
          icon={User}
          title="Dibatalkan"
          value={stats.cancelled_loans}
          color="gray"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="RETURNED">Dikembalikan</option>
              <option value="OVERDUE">Terlambat</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Peminjam
            </label>
            <input
              type="text"
              placeholder="Cari nama peminjam..."
              value={filters.borrower_name}
              onChange={(e) => handleFilterChange('borrower_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Surat Tugas
            </label>
            <input
              type="text"
              placeholder="Cari no. surat tugas..."
              value={filters.assignment_letter_number}
              onChange={(e) => handleFilterChange('assignment_letter_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai (Dari)
            </label>
            <input
              type="date"
              value={filters.loan_start_date_from}
              onChange={(e) => handleFilterChange('loan_start_date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai (Sampai)
            </label>
            <input
              type="date"
              value={filters.loan_start_date_to}
              onChange={(e) => handleFilterChange('loan_start_date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutkan berdasarkan
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="loan_start_date">Tanggal Mulai</option>
              <option value="loan_end_date">Tanggal Berakhir</option>
              <option value="borrower_name">Nama Peminjam</option>
              <option value="created_at">Tanggal Dibuat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <RotateCcw className="w-12 h-12 mb-2 text-gray-400" />
            <p>Tidak ada data peminjaman</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No. Pinjaman
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Peminjam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kegiatan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jumlah Perangkat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal Mulai
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal Berakhir
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {loan.loan_number}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.borrower_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.assignment_letter_number}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {loan.activity_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {loan.loan_items ? loan.loan_items.length : 0} perangkat
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDate(loan.loan_start_date)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDate(loan.loan_end_date)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportSingle(loan.id, loan.loan_number)}
                            disabled={exportingId === loan.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                            title="Export PDF"
                          >
                            {exportingId === loan.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} dari {total} data
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <LoanDetailModal
        loan={selectedLoan}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLoan(null);
        }}
      />
    </div>
  );
};

export default ReturnReports;