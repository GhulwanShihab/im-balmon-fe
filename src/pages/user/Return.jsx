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
  FileText,
  Star,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReturnPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    device_condition_on_return: 'BAIK',
    return_notes: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get('/api/v1/loans/my-loans', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 50 }
      });

      console.log('Raw loans data:', response.data);
      console.log('Loans array:', response.data.loans);
      
      // Debug: Cek status setiap loan
      if (response.data.loans) {
        response.data.loans.forEach((loan, index) => {
          console.log(`Loan ${index + 1}:`, {
            id: loan.id,
            status: loan.status,
            statusType: typeof loan.status,
            device: loan.device?.device_name,
            isActive: loan.status === 'active'
          });
        });
      }
      
      setLoans(response.data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnDevice = async (loan) => {
    console.log('Opening return modal for loan:', loan);
    setSelectedLoan(loan);
    
    // Jika loan_items tidak ada, fetch detail loan terlebih dahulu
    if (!loan.loan_items || loan.loan_items.length === 0) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`/api/v1/loans/${loan.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched loan detail:', response.data);
        setSelectedLoan(response.data);
      } catch (error) {
        console.error('Error fetching loan detail:', error);
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
      const token = sessionStorage.getItem('token');

      const payload = {
        actual_return_date: new Date().toISOString().split('T')[0],
        return_notes: returnData.return_notes || '',
        rating: returnData.rating,
        loan_items: selectedLoan.loan_items.map(item => ({
          id: item.id,
          device_id: item.device_id,
          condition_after: item.condition_after || 'BAIK'
        }))
      };

      console.log('Payload pengembalian:', payload);

      const response = await axios.post(
        `/api/v1/loans/${selectedLoan.id}/return`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Pengajuan pengembalian berhasil! Menunggu verifikasi admin.');
      setShowReturnModal(false);
      fetchLoans();
    } catch (error) {
      console.error('Return error:', error);
      toast.error('Gagal mengajukan pengembalian');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Peminjaman</h1>
        <p className="text-gray-600">Melihat semua perangkat yang pernah Anda pinjam</p>
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
                {selectedLoan.loan_items && selectedLoan.loan_items.map((item, index) => (
                  <div key={item.id} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
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
                        <option value="RUSAK_RINGAN">Rusak Ringan</option>
                        <option value="RUSAK_BERAT">Rusak Berat</option>
                      </select>
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
                  Rating (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReturnData({ ...returnData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= returnData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
                
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
                }}
                disabled={submitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors"
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