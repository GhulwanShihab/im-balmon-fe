import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
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
import apiClient from '../../services/api';

const ViewLoanDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  const fetchLoanDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/loans/${id}`);
      const loanData = response.data?.loan || response.data?.data || response.data;
      setLoan(loanData);
    } catch (error) {
      alert('Gagal memuat data peminjaman');
      navigate('/admin/usage-reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data peminjaman ini?')) return;
    try {
      await apiClient.delete(`/loans/${id}`);
      alert('Peminjaman berhasil dihapus');
      navigate('/admin/usage-reports');
    } catch {
      alert('Gagal menghapus peminjaman');
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);

      const response = await apiClient.get(`/loans/${id}/export-pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `Berita_Acara_${loan.loan_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal export PDF');
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
      PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      RETURNED: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      OVERDUE: { label: 'Terlambat', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-600', icon: XCircle }
    };

    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = info.icon;

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-semibold rounded-full ${info.color}`}>
          <Icon className="w-4 h-4" />
          <span>{info.label}</span>
        </span>
      </div>
    );
  };

  const getConditionBadge = (condition) => {
    const conditionMap = {
      BAIK: { label: 'Baik', color: 'bg-green-100 text-green-800' },
      RUSAK: { label: 'Rusak', color: 'bg-red-100 text-red-800' },
      MAINTENANCE: { label: 'Maintenance', color: 'bg-sky-100 text-sky-800' },
    };

    const info = conditionMap[condition] || { label: condition || '-', color: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${info.color}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Data peminjaman tidak ditemukan</h2>
        <button
          onClick={() => navigate('/admin/usage-reports')}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Kembali ke Daftar Peminjaman
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/usage-reports')}
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

        <div className="flex space-x-2">
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
          <button
            onClick={() => navigate(`/admin/loans/${id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-500 mb-1">Nama Peminjam</label>
            <p className="text-lg font-semibold text-gray-900">{loan.borrower_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1"></label>
            <p className="text-lg font-semibold text-gray-900"></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Pihak 1</label>
            <p className="text-lg font-semibold text-gray-900">{loan.pihak_1?.nama || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Pihak 2</label>
            <p className="text-lg font-semibold text-gray-900">{loan.pihak_2?.nama || '-'}</p>
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
            <label className="block text-sm font-medium text-gray-500 mb-1">Nama Kegiatan</label>
            <p className="text-lg font-semibold text-gray-900">{loan.activity_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">No. Surat Tugas</label>
            <p className="text-lg font-semibold text-gray-900">{loan.assignment_letter_number || '-'}</p>
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
            <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Pinjam</label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(loan.loan_start_date)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Rencana Kembali</label>
            <p className="text-lg font-semibold text-gray-900">{formatDate(loan.loan_end_date)}</p>
          </div>

          {loan.actual_return_date && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Aktual Kembali</label>
              <p className="text-lg font-semibold text-green-600">
                {formatDate(loan.actual_return_date)}
              </p>
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
                {loan.loan_items.map((item, index) => {
                  const device = item.child || item.device;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {device?.device_name || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device?.device_type || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{device?.device_code || '-'}</div>
                        <div className="text-xs text-gray-500">{device?.nup_device || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getConditionBadge(item.condition_before)}
                      </td>
                      <td className="px-4 py-3">
                        {item.condition_after
                          ? getConditionBadge(item.condition_after)
                          : <span className="text-sm text-gray-500">Belum dikembalikan</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Tidak ada perangkat</p>
        )}
      </div>

      {/* Catatan */}
      {loan.return_notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
              <FileText className="w-4 h-4 text-yellow-600" />
            </div>
            Catatan
          </h3>
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            {loan.return_notes}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Dibuat pada:</span>{' '}
            {formatDate(loan.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLoanDetail;