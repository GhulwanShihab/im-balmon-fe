import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileDown,
  Calendar,
  User,
  Building,
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const ViewLoanDetailManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  const getAuthHeaders = () => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

  const fetchLoanDetail = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`http://localhost:8000/api/v1/loans/${id}`, {
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
      const loanData = data?.loan || data?.data || data;
      
      console.log('Loan detail:', loanData);
      setLoan(loanData);
    } catch (error) {
      console.error('Error fetching loan detail:', error);
      alert('Gagal memuat data peminjaman');
      navigate('/manager/usage-reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(
        `http://localhost:8000/api/v1/loans/${id}/export-pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': headers.Authorization,
            'Accept': 'application/pdf'
          }
        }
      );

      if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.status === 403) {
        const errorText = await response.text();
        console.error('403 Forbidden:', errorText);
        alert('❌ Anda tidak memiliki akses untuk export data ini.\n\nSilakan hubungi administrator.');
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `Berita_Acara_${loan.loan_number}_${timestamp}.pdf`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        
        link.remove();
        window.URL.revokeObjectURL(url);
        
        alert(`✅ Berita Acara berhasil diunduh: ${filename}`);
      } else {
        const errorText = await response.text();
        console.error('Export error:', errorText);
        alert('Gagal export PDF. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Terjadi kesalahan saat export PDF.');
    } finally {
      setExportingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'APPROVED': { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'ACTIVE': { label: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'RETURNED': { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      'OVERDUE': { label: 'Terlambat', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'CANCELLED': { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-600', icon: XCircle }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = statusInfo.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-semibold rounded-full ${statusInfo.color}`}>
          <Icon className="w-4 h-4" />
          <span>{statusInfo.label}</span>
        </span>
      </div>
    );
  };

  const getConditionBadge = (condition) => {
    const conditionMap = {
      'baik': { label: 'Baik', color: 'bg-green-100 text-green-800' },
      'rusak_ringan': { label: 'Rusak Ringan', color: 'bg-yellow-100 text-yellow-800' },
      'rusak_berat': { label: 'Rusak Berat', color: 'bg-red-100 text-red-800' },
      'hilang': { label: 'Hilang', color: 'bg-gray-200 text-gray-700' }
    };
    
    const info = conditionMap[condition] || { label: condition, color: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${info.color}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Data peminjaman tidak ditemukan</h2>
        <button
          onClick={() => navigate('/manager/usage-reports')}
          className="mt-4 px-4 py-2 text-green-600 hover:text-green-800"
        >
          Kembali ke Laporan Peminjaman
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header - Manager: HANYA VIEW & EXPORT (tidak ada Edit/Delete) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/manager/usage-reports')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Peminjaman</h1>
            <p className="text-gray-600">Informasi lengkap data peminjaman</p>
          </div>
        </div>
        
        {/* Manager hanya bisa Export PDF */}
        <div className="flex items-center space-x-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <p className="text-xs text-green-800 font-medium">👁️ Mode Read-Only</p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {exportingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Semua konten sama seperti admin - copy paste dari atas mulai dari Status Badge sampai Metadata */}
      {/* Status Badge */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Status Peminjaman</h3>
            {getStatusBadge(loan.status)}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">No. Peminjaman</p>
            <p className="text-xl font-bold text-gray-900">{loan.loan_number}</p>
          </div>
        </div>
      </div>

      {/* Informasi Peminjam */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          Informasi Peminjam
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Nama Peminjam
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.borrower_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Instansi
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.borrower_institution || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              No. Telepon
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.borrower_phone || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.borrower_email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Informasi Kegiatan */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          Informasi Kegiatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Nama Kegiatan
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.activity_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              No. Surat Tugas
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.assignment_letter_number || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Lokasi Kegiatan
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.activity_location || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              PIC Kegiatan
            </label>
            <p className="text-lg font-semibold text-gray-900">{loan.activity_pic || '-'}</p>
          </div>
        </div>
      </div>

      {/* Periode Peminjaman */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          Periode Peminjaman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tanggal Pinjam
            </label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(loan.loan_start_date)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tanggal Rencana Kembali
            </label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(loan.loan_end_date)}</p>
          </div>

          {loan.actual_return_date && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tanggal Aktual Kembali
              </label>
              <p className="text-lg font-semibold text-green-600">{formatDate(loan.actual_return_date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Daftar Perangkat */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          Daftar Perangkat Dipinjam
        </h3>

        {loan.loan_items && loan.loan_items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perangkat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode/NUP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi Pinjam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi Kembali</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loan.loan_items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.device_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.device_type || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.device_code}</div>
                      <div className="text-xs text-gray-500">{item.nup_device}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getConditionBadge(item.condition_before)}
                    </td>
                    <td className="px-4 py-3">
                      {item.condition_after ? getConditionBadge(item.condition_after) : (
                        <span className="text-sm text-gray-500">Belum dikembalikan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Tidak ada perangkat</p>
        )}
      </div>

      {/* Catatan */}
      {loan.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
              <FileText className="w-4 h-4 text-yellow-600" />
            </div>
            Catatan
          </h3>
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">{loan.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Dibuat oleh:</span>{' '}
            {loan.created_by_name || loan.created_by || '-'}
          </div>
          <div>
            <span className="font-medium">Dibuat pada:</span>{' '}
            {formatDate(loan.created_at)}
          </div>
          {loan.approved_by_name && (
            <>
              <div>
                <span className="font-medium">Disetujui oleh:</span>{' '}
                {loan.approved_by_name}
              </div>
              <div>
                <span className="font-medium">Disetujui pada:</span>{' '}
                {formatDate(loan.approved_at)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLoanDetailManager;