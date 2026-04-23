import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Smartphone,
  Calendar,
  User,
  MessageSquare,
  Upload,
  ImageIcon,
  X,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/api';

const ReturnPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    device_condition_on_return: 'BAIK',
    return_notes: ''
  });
  const [evidenceFiles, setEvidenceFiles] = useState({}); // { [item.id]: File }
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      // ✅ Gunakan apiClient.get (token otomatis ditambahkan)
      const response = await apiClient.get('/loans/my-loans', {
        params: { page_size: 50 }
      });

      
      // Debug: Cek status setiap loan
      if (response.data.loans) {
        response.data.loans.forEach((loan, index) => {
        });
      }
      
      setLoans(response.data.loans || []);
    } catch (error) {
      toast.error('Gagal memuat data peminjaman');
      
      // ✅ Handle error 401 (redirect ke login jika unauthorized)
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReturnDevice = async (loan) => {
    setSelectedLoan(loan);
    
    // Jika loan_items tidak ada, fetch detail loan terlebih dahulu
    if (!loan.loan_items || loan.loan_items.length === 0) {
      try {
        // ✅ Gunakan apiClient.get
        const response = await apiClient.get(`/loans/${loan.id}`);
        setSelectedLoan(response.data);
      } catch (error) {
        toast.error('Gagal memuat detail peminjaman');
        return;
      }
    }
    
    setShowReturnModal(true);
  };

  const submitReturn = async () => {
    if (!selectedLoan) return;
    setSubmitting(true);

    try {
      const payload = {
        actual_return_date: new Date().toISOString().split('T')[0],
        return_notes: returnData.return_notes || '',
        loan_items: selectedLoan.loan_items.map(item => ({
          id: item.id,
          device_id: item.device_id,
          condition_after: item.condition_after || 'BAIK'
        }))
      };


      const response = await apiClient.post(
        `/loans/${selectedLoan.id}/return`,
        payload
      );

      // Upload evidence photos for condition changes
      if (response.data && Object.keys(evidenceFiles).length > 0) {
        // Fetch condition change requests for this loan
        try {
          const ccResponse = await apiClient.get('/loans/condition-change-requests', {
            params: { loan_id: selectedLoan.id }
          });
          const changeRequests = ccResponse.data || [];
          
          for (const req of changeRequests) {
            // Find matching evidence file by loan_item_id
            if (evidenceFiles[req.loan_item_id]) {
              const formData = new FormData();
              formData.append('file', evidenceFiles[req.loan_item_id]);
              await apiClient.post(
                `/loans/condition-change/${req.id}/upload-evidence`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            }
          }
        } catch (uploadError) {
          toast.error('Pengembalian berhasil, tapi gagal upload foto bukti.');
        }
      }

      toast.success('Pengajuan pengembalian berhasil! Menunggu verifikasi admin.');
      setShowReturnModal(false);
      setReturnData({
        device_condition_on_return: 'BAIK',
        return_notes: ''
      });
      setEvidenceFiles({});
      fetchLoans();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mengajukan pengembalian';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (loan) => {
    const today = new Date();
    const endDate = new Date(loan.loan_end_date);
    let badge = { label: '', color: '', icon: null };
    
    // Normalize status untuk case-insensitive comparison
    const normalizedStatus = loan.status?.toLowerCase();

    switch (normalizedStatus) {
      case 'active':
        if (endDate < today) {
          badge = { label: 'Terlambat', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
        } else {
          badge = { label: 'Aktif', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> };
        }
        break;
      case 'overdue':
        badge = { label: 'Terlambat', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
        break;
      case 'returned':
        badge = { label: 'Sudah Dikembalikan', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
        break;
      case 'cancelled':
        badge = { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-800', icon: <RotateCcw className="w-3 h-3" /> };
        break;
      default:
        badge = { label: loan.status, color: 'bg-gray-100 text-gray-800', icon: null };
    }

    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>
    );
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengembalian Perangkat</h1>
        <p className="text-gray-600 leading-relaxed">
          Halaman ini menampilkan daftar perangkat yang sedang atau pernah Anda pinjam. 
          Klik tombol <strong>"Kembalikan"</strong> pada peminjaman yang berstatus <strong>Aktif</strong> untuk mengajukan pengembalian. 
          Setelah pengajuan dikirim, admin akan memverifikasi kondisi perangkat sebelum pengembalian dikonfirmasi.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Peminjaman ({loans.length})
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada peminjaman</h3>
              <p className="text-gray-500 mb-4">Anda belum meminjam perangkat apapun.</p>
              <button
                onClick={() => navigate('/user/borrow')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Pinjam Perangkat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => {
                const daysLeft = calculateDaysLeft(loan.loan_end_date);
                const isOverdue = daysLeft < 0;
                
                // Normalize status untuk perbandingan (case-insensitive)
                const normalizedStatus = loan.status?.toLowerCase();

                return (
                  <div
                    key={loan.id}
                    className={`border rounded-2xl p-6 transition-all hover:shadow-md ${
                      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Nama Kegiatan di atas */}
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{loan.activity_name}</h2>
                              
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-3">
                        {/* Daftar perangkat */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          {loan.loan_items?.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Smartphone className="w-5 h-5 text-blue-600" />
                              <span>{item.child?.device_name || item.device?.device_name || 'Perangkat Tidak Diketahui'}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Info peminjam & tanggal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{loan.borrower_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(loan.loan_start_date).toLocaleDateString('id-ID')} -{' '}
                              {new Date(loan.loan_end_date).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {normalizedStatus === 'active'
                                ? isOverdue
                                  ? `Terlambat ${Math.abs(daysLeft)} hari`
                                  : `${daysLeft} hari lagi`
                                : normalizedStatus === 'overdue'
                                ? `Terlambat ${Math.abs(daysLeft)} hari`
                                : normalizedStatus === 'returned'
                                ? 'Sudah dikembalikan'
                                : loan.status}
                            </span>
                          </div>
                        </div>
                              
                        {loan.notes && (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-gray-700">Catatan:</span>
                                <p className="text-sm text-gray-600">{loan.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Tombol aksi */}
                      <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2 lg:w-48">
                        {(normalizedStatus === 'active' || normalizedStatus === 'overdue') && (
                          <button
                            onClick={() => handleReturnDevice(loan)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Kembalikan</span>
                          </button>
                        )}
            
                        <button
                          onClick={() => navigate('/user/reports', { state: { loanId: loan.id } })}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Pengembalian */}
      {showReturnModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pengembalian Perangkat</h3>
      
            {selectedLoan.loan_items && selectedLoan.loan_items.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Panduan kondisi perangkat */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Cara mengisi pengembalian:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Pilih <strong>kondisi perangkat</strong> saat dikembalikan (Baik atau Rusak)</li>
                      <li>Unggah <strong>foto bukti kondisi</strong> jika diperlukan (opsional)</li>
                      <li>Tambahkan <strong>catatan</strong> jika ada hal yang perlu dilaporkan</li>
                    </ul>
                  </div>
                </div>
                {selectedLoan.loan_items.map((item, index) => (
                  <div key={item.id} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.child?.device_name || item.device?.device_name || `Unit ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Kondisi saat dipinjam: {item.condition_before || "BAIK"}
                        </p>
                      </div>
                
                      <select
                        value={item.condition_after || "BAIK"}
                        onChange={(e) => {
                          const updatedItems = selectedLoan.loan_items.map((it) =>
                            it.id === item.id
                              ? { ...it, condition_after: e.target.value }
                              : it
                          );
                          setSelectedLoan({ ...selectedLoan, loan_items: updatedItems });
                        }}
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BAIK">Baik</option>
                        <option value="RUSAK">Rusak</option>
                      </select>
                    </div>

                    {/* Upload Foto Bukti (Opsional) - selalu tampil per item */}
                    <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-white">
                      <p className="text-xs text-gray-500 mb-2 flex items-center">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Foto Bukti Kondisi (opsional)
                      </p>
                      {evidenceFiles[item.id] ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(evidenceFiles[item.id])}
                            alt="Preview bukti"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...evidenceFiles };
                              delete updated[item.id];
                              setEvidenceFiles(updated);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Pilih foto bukti</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                setEvidenceFiles(prev => ({
                                  ...prev,
                                  [item.id]: e.target.files[0]
                                }));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada perangkat dalam peminjaman ini.</p>
            )}

            <div className="mt-4 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={returnData.return_notes}
                  onChange={(e) =>
                    setReturnData({ ...returnData, return_notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tambahkan catatan jika ada..."
                />
              </div>
            </div>
                
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedLoan(null);
                  setReturnData({
                    device_condition_on_return: 'BAIK',
                    return_notes: ''
                  });
                  setEvidenceFiles({});
                }}
                disabled={submitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={submitReturn}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Ajukan Pengembalian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnPage;