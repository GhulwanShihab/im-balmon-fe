import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Clock,
  User,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown
} from 'lucide-react';
import apiClient from '../../services/api';

const UsageReports = () => {
  const navigate = useNavigate();
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exportingId, setExportingId] = useState(null);
  
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
    loan_start_date_from: '',
    loan_start_date_to: '',
    sort_by: 'loan_start_date',
    sort_order: 'desc'
  });

  useEffect(() => {
    fetchLoanData();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        page_size: 10,
      };

      if (filters.borrower_name) params.borrower_name = filters.borrower_name;
      if (filters.assignment_letter_number) params.assignment_letter_number = filters.assignment_letter_number;
      if (filters.status) params.status = filters.status;
      if (filters.loan_start_date_from) params.loan_start_date_from = filters.loan_start_date_from;
      if (filters.loan_start_date_to) params.loan_start_date_to = filters.loan_start_date_to;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;

      const response = await apiClient.get('/loans', { params });
      const data = response.data;

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
      const response = await apiClient.get('/loans/stats');
      const data = response.data;
      
      setSummary({
        total_loans: data.total_loans || 0,
        total_active: data.active_loans || 0,
        total_returned: data.returned_loans || 0,
        most_loaned_device: data.most_borrowed_device || null
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleExportPDF = async (loanId, loanNumber) => {
    try {
      setExportingId(loanId);
      console.log(`📄 Starting PDF export for loan ID: ${loanId}`);
      
      const response = await apiClient.get(`/loans/${loanId}/export-pdf`, {
        responseType: 'blob'
      });
      
      console.log('✅ PDF export successful, downloading file...');
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Berita_Acara_${loanNumber}_${timestamp}.pdf`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully:', filename);
      alert(`Berita Acara berhasil diunduh: ${filename}`);
      
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      
      if (error.response?.status === 404) {
        alert('Data peminjaman tidak ditemukan.');
      } else if (error.response?.status === 403) {
        alert('Anda tidak memiliki akses untuk export data ini.');
      } else {
        alert('Terjadi kesalahan saat export PDF. Silakan coba lagi.');
      }
    } finally {
      setExportingId(null);
    }
  };

  const handleViewDetail = (loanId) => {
    navigate(`/admin/loans/${loanId}`);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        {/* <StatCard
          icon={Smartphone}
          title="Perangkat Terpopuler"
          value={summary.most_loaned_device?.device_name || '-'}
          subtitle={summary.most_loaned_device ? `${summary.most_loaned_device.loan_count} kali` : 'Tidak ada data'}
          color="purple"
        /> */}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
            <input
              type="text"
              placeholder="Cari nama peminjam..."
              value={filters.borrower_name}
              onChange={(e) => handleFilterChange('borrower_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Surat Tugas</label>
            <input
              type="text"
              placeholder="No. Surat Tugas..."
              value={filters.assignment_letter_number}
              onChange={(e) => handleFilterChange('assignment_letter_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Mulai (Dari)
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
               Mulai (Sampai)
             </label>
             <input
               type="date"
               value={filters.loan_start_date_to}
               onChange={(e) => handleFilterChange('loan_start_date_to', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
           </div>
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
                            onClick={() => handleExportPDF(loan.id, loan.loan_number)}
                            disabled={exportingId === loan.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export Berita Acara (PDF)"
                          >
                            {exportingId === loan.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <FileDown className="w-4 h-4" />
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