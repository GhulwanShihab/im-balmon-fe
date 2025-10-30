import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock,
  User,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

const UsageReports = () => {
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exportingId, setExportingId] = useState(null);
  const [conditionRequests, setConditionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const [summary, setSummary] = useState({
    total_loans: 0,
    total_returned: 0,
    total_active: 0,
    most_loaned_device: null
  });
  
  const [filters, setFilters] = useState({
    borrower_name: '',
    assignment_letter_number: '',
    status: '',
    sort_by: 'loan_start_date',
    sort_order: 'desc'
  });
  const [showDebug, setShowDebug] = useState(false);

  // Debug: Test API connection
  const testApiConnection = async () => {
    console.log('=== API CONNECTION TEST ===');
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('1. Token exists:', !!token);
    console.log('2. Token location:', localStorage.getItem('token') ? 'localStorage' : sessionStorage.getItem('token') ? 'sessionStorage' : 'none');
    console.log('3. Token value:', token?.substring(0, 50) + '...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/loans?page=1&page_size=1', {
        method: 'GET',
        headers: {
          'Authorization': token?.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('4. Response status:', response.status);
      console.log('5. Response ok:', response.ok);
      
      if (response.status === 401) {
        console.error('❌ UNAUTHORIZED: Token tidak valid atau sudah expired');
        console.log('Silakan login ulang untuk mendapatkan token baru');
        const errorData = await response.json();
        console.log('Error detail:', errorData);
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ API CONNECTION SUCCESS');
        console.log('6. Response data:', data);
      } else {
        const errorData = await response.json();
        console.log('❌ ERROR:', errorData);
      }
    } catch (error) {
      console.error('❌ API CONNECTION FAILED:', error);
    }
    console.log('=== END TEST ===');
  };

  const fetchConditionRequests = async () => {
    try {
      setLoadingRequests(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(
        'http://localhost:8000/api/v1/devices/condition-change-requests',
        {
          method: 'GET',
          headers: headers
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConditionRequests(data || []);
      } else {
        console.error('Gagal memuat permintaan kondisi');
        setConditionRequests([]);
      }
    } catch (error) {
      console.error('Error fetching condition requests:', error);
      setConditionRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchConditionRequests();
  }, [currentRequestPage]);

  useEffect(() => {
    fetchLoanData();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const getAuthHeaders = () => {
    // Cek token di localStorage dulu, kalau tidak ada cek sessionStorage
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (!token) {
      console.error('No token found in localStorage or sessionStorage');
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = '/login';
      return null;
    }
    
    // Debug: Log token format
    console.log('Token found in:', localStorage.getItem('token') ? 'localStorage' : 'sessionStorage');
    console.log('Token preview:', token.substring(0, 30) + '...');
    
    // Pastikan token tidak sudah include "Bearer "
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    return {
      'Authorization': authToken,
      'Content-Type': 'application/json'
    };
  };

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '10',
      });

      if (filters.borrower_name) params.append('borrower_name', filters.borrower_name);
      if (filters.assignment_letter_number) params.append('assignment_letter_number', filters.assignment_letter_number);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const url = `http://localhost:8000/api/v1/loans?${params}`;
      console.log('Fetching URL:', url);
      console.log('Request headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
        // Hapus credentials: 'include' karena menyebabkan CORS error dengan wildcard origins
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.error('Unauthorized - clearing token and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Loans data received:', data);

      setLoanData(data.loans || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      
    } catch (error) {
      console.error('Error fetching loan data:', error);
      setLoanData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('http://localhost:8000/api/v1/loans/stats', {
        method: 'GET',
        headers: headers
      });

      if (response.status === 401) {
        console.error('Unauthorized on stats endpoint');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data);
        setSummary({
          total_loans: data.total_loans || 0,
          total_active: data.active_loans || 0,
          total_returned: data.returned_loans || 0,
          most_loaned_device: data.most_borrowed_device || null
        });
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleExportSingle = async (loanId, loanNumber) => {
    try {
      setExportingId(loanId);
      const headers = getAuthHeaders();
      if (!headers) return;

      // Export single loan by ID
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
        link.setAttribute('download', `peminjaman-${loanNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorText = await response.text();
        console.error('Export error:', errorText);
        alert('Gagal export laporan. Endpoint mungkin belum tersedia.');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Gagal export laporan.');
    } finally {
      setExportingId(null);
    }
  };

  const handleViewDetail = (loanId) => {
    // Navigate ke detail page atau buka modal
    window.location.href = `/loans/${loanId}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
    };
  
  const handleApproveRequest = async (requestId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
    
      const response = await fetch(`http://localhost:8000/api/v1/devices/condition-change-requests/${requestId}/approve`, {
        method: 'POST',
        headers: headers
      });
    
      if (response.ok) {
        toast.success('Permintaan berhasil disetujui');
        setConditionRequests(prev => prev.filter(r => r.id !== requestId));
        fetchLoanData(); // refresh loan table agar kondisi device update
      } else {
        toast.error('Gagal menyetujui permintaan');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saat approve');
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
    
      const response = await fetch(`http://localhost:8000/api/v1/devices/condition-change-requests/${requestId}/reject`, {
        method: 'POST',
        headers: headers
      });
    
      if (response.ok) {
        toast.success('Permintaan ditolak');
        setConditionRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        toast.error('Gagal menolak permintaan');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saat reject');
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { label: 'Aktif', class: 'bg-blue-100 text-blue-800' },
      'RETURNED': { label: 'Dikembalikan', class: 'bg-green-100 text-green-800' },
      'OVERDUE': { label: 'Terlambat', class: 'bg-red-100 text-red-800' },
      'CANCELLED': { label: 'Dibatalkan', class: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
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
          <h1 className="text-2xl font-bold text-gray-900">Laporan Peminjaman</h1>
          <p className="text-gray-600 mt-1">Statistik dan data peminjaman perangkat</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">Debug Panel</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Token di localStorage:</strong> {localStorage.getItem('token') ? '✅ Ada' : '❌ Tidak ada'}
            </div>
            <div>
              <strong>Token di sessionStorage:</strong> {sessionStorage.getItem('token') ? '✅ Ada' : '❌ Tidak ada'}
            </div>
            <div>
              <strong>Token Preview:</strong> <code className="bg-white px-2 py-1 rounded text-xs break-all">
                {(localStorage.getItem('token') || sessionStorage.getItem('token'))?.substring(0, 50)}...
              </code>
            </div>
            <div>
              <strong>API URL:</strong> <code className="text-xs">http://localhost:8000/api/v1/loans</code>
            </div>
            <div>
              <strong>CORS Origins dari Backend:</strong> http://localhost:3000, http://127.0.0.1:3000
            </div>
            <button
              onClick={testApiConnection}
              className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Test API Connection
            </button>
            <div className="text-xs text-yellow-800 mt-2">
              Buka Console (F12) untuk melihat hasil test lengkap
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Total Peminjaman"
          value={summary.total_loans}
          subtitle="Semua transaksi"
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Masih Dipinjam"
          value={summary.total_active}
          subtitle="Belum dikembalikan"
          color="yellow"
        />
        <StatCard
          icon={User}
          title="Sudah Dikembalikan"
          value={summary.total_returned}
          subtitle="Selesai"
          color="green"
        />
        <StatCard
          icon={Smartphone}
          title="Perangkat Terpopuler"
          value={summary.most_loaned_device?.device_name || '-'}
          subtitle={summary.most_loaned_device ? `${summary.most_loaned_device.loan_count} kali` : 'Tidak ada data'}
          color="purple"
        />
      </div>

      {/* Section Permintaan Perubahan Kondisi */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Permintaan Perubahan Kondisi Device</h2>

        {loadingRequests ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : conditionRequests.length === 0 ? (
          <p className="text-gray-500">Tidak ada permintaan perubahan kondisi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Perangkat</th>
                  <th className="px-4 py-2 text-left">Kondisi Sebelumnya</th>
                  <th className="px-4 py-2 text-left">Kondisi Yang Diubah</th>
                  <th className="px-4 py-2 text-left">Pengguna</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Tanggal Pengajuan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conditionRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{req.device_name}</td>
                    <td className="px-4 py-2">{req.old_condition}</td>
                    <td className="px-4 py-2 font-semibold">{req.new_condition}</td>
                    <td className="px-4 py-2">{req.requested_by_name}</td>
                    <td className="px-4 py-2">{req.status}</td>
                    <td className="px-4 py-2">{new Date(req.requested_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Cari nama peminjam..."
            value={filters.borrower_name}
            onChange={(e) => handleFilterChange('borrower_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="No. Surat Tugas..."
            value={filters.assignment_letter_number}
            onChange={(e) => handleFilterChange('assignment_letter_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="RETURNED">Dikembalikan</option>
            <option value="OVERDUE">Terlambat</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : loanData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText className="w-12 h-12 mb-2 text-gray-400" />
            <p>Tidak ada data peminjaman</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pinjaman</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kegiatan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perangkat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Pinjam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Kembali</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loanData.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{loan.loan_number}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{loan.borrower_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{loan.activity_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {loan.loan_items && loan.loan_items.length > 0 
                          ? `${loan.loan_items.length} perangkat`
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatDate(loan.loan_start_date)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {loan.actual_return_date ? formatDate(loan.actual_return_date) : formatDate(loan.loan_end_date)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetail(loan.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportSingle(loan.id, loan.loan_number)}
                            disabled={exportingId === loan.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsageReports;