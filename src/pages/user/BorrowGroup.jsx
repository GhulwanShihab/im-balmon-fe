import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Package,
  Layers,
  ChevronLeft,
  Folder
} from 'lucide-react';
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

const BorrowGroupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { group } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [groupDetail, setGroupDetail] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [pihak1Employees, setPihak1Employees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [formData, setFormData] = useState({
    borrower_name: '',
    activity_name: '',
    assignment_letter_number: '',
    assignment_letter_date: new Date().toISOString().split('T')[0],
    loan_start_date: new Date().toISOString().split('T')[0],
    usage_duration_days: 1,
    purpose: '',
    monitoring_devices: '',
    pihak_1_id: '',
    pihak_2_id: ''
  });

  useEffect(() => {
    if (!group) {
      toast.error('Grup tidak ditemukan');
      navigate('/user/device-groups');
      return;
    }

    // Auto-fill borrower name from logged-in user
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.nama || user.full_name || user.username || '';
        if (name) {
          setFormData(prev => ({ ...prev, borrower_name: name }));
        }
      } catch (e) { /* ignore */ }
    }

    fetchGroupDetail();
    fetchEmployees();
  }, [group]);

  const fetchGroupDetail = async () => {
    try {
      const response = await apiClient.get(`/device-groups/${group.id}`);
      setGroupDetail(response.data);
    } catch (error) {
      toast.error('Gagal memuat detail grup');
      navigate('/user/device-groups');
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const [allRes, pihak1Res] = await Promise.all([
        apiClient.get('/employees/'),
        apiClient.get('/employees/', { params: { pihak_1_only: true } })
      ]);
      const allEmps = allRes.data.employees || allRes.data || [];
      const p1Emps = pihak1Res.data.employees || pihak1Res.data || [];
      setEmployees(allEmps.filter(emp => emp.nip && emp.nip.trim() !== ''));
      setPihak1Employees(p1Emps.filter(emp => emp.nip && emp.nip.trim() !== ''));
    } catch (error) {
      toast.error('Gagal memuat data pegawai');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.borrower_name || !formData.activity_name || 
        !formData.assignment_letter_number || !formData.pihak_1_id || !formData.pihak_2_id) {
      toast.error('Harap lengkapi semua data yang diperlukan');
      return;
    }

    setLoading(true);

    try {
      const borrowData = {
        borrower_name: formData.borrower_name,
        activity_name: formData.activity_name,
        assignment_letter_number: formData.assignment_letter_number,
        assignment_letter_date: formData.assignment_letter_date,
        loan_start_date: formData.loan_start_date,
        usage_duration_days: parseInt(formData.usage_duration_days),
        pihak_1_id: parseInt(formData.pihak_1_id),
        pihak_2_id: parseInt(formData.pihak_2_id)
      };

      const response = await apiClient.post(`/device-groups/${group.id}/borrow`, borrowData);

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/user/reports');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal meminjam grup perangkat');
    } finally {
      setLoading(false);
    }
  };

  if (!groupDetail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat detail grup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/user/device-group')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pinjam Grup Perangkat</h1>
          <p className="text-gray-600">Isi data peminjaman untuk semua perangkat dalam grup</p>
        </div>
      </div>

      {/* Group Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Folder className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{groupDetail.name}</h2>
            {groupDetail.description && (
              <p className="text-gray-600 mb-3">{groupDetail.description}</p>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Perangkat yang akan dipinjam ({groupDetail.device_count}):
              </p>
              <div className="space-y-2">
                {groupDetail.devices && groupDetail.devices.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">#{index + 1}</span>
                    {item.child_device_id ? (
                      <Layers className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Package className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-gray-900">{item.device_name}</span>
                    <span className="text-gray-500">({item.device_code})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Check */}
      {groupDetail.all_available === false && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900 mb-1">Grup Tidak Dapat Dipinjam</p>
            <p className="text-sm text-red-800">
              Perangkat berikut tidak tersedia: {groupDetail.unavailable_devices?.join(', ')}
            </p>
            <button
              onClick={() => navigate('/user/device-group')}
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              ← Kembali ke Daftar Grup
            </button>
          </div>
        </div>
      )}

      {/* Borrowing Form */}
      {groupDetail.all_available !== false && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Peminjaman</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nama Pengguna *
              </label>
              <input
                type="text"
                value={formData.borrower_name}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                placeholder="Nama terisi otomatis (Sistem)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Nama Kegiatan *
              </label>
              <input
                type="text"
                value={formData.activity_name}
                onChange={handleInputChange('activity_name')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                placeholder="Nama kegiatan sesuai surat tugas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                No. Surat Tugas *
              </label>
              <input
                type="text"
                value={formData.assignment_letter_number}
                onChange={handleInputChange('assignment_letter_number')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                placeholder="Masukkan nomor surat tugas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal Surat Tugas *
              </label>
              <input
                type="date"
                value={formData.assignment_letter_date}
                onChange={handleInputChange('assignment_letter_date')}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal Mulai *
              </label>
              <input
                type="date"
                value={formData.loan_start_date}
                onChange={handleInputChange('loan_start_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Durasi (Hari) *
              </label>
              <input
                type="number"
                value={formData.usage_duration_days}
                onChange={handleInputChange('usage_duration_days')}
                min="1"
                max="365"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Kuasa Izin Peminjam Barang *
              </label>
              <select
                value={formData.pihak_1_id}
                onChange={handleInputChange('pihak_1_id')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                required
              >
                <option value="">Pilih Kuasa Izin Peminjam Barang...</option>
                {employeeLoading ? (
                  <option>Memuat data...</option>
                ) : (
                  pihak1Employees
                    .filter((emp) => String(emp.id) !== String(formData.pihak_2_id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nama} ({emp.jabatan})
                      </option>
                    ))
                )}
              </select>
              {pihak1Employees.length === 0 && !employeeLoading && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Belum ada pegawai yang ditandai sebagai Kuasa Izin Peminjam Barang. Hubungi admin.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Pihak 2 (Mengetahui) *
              </label>
              <select
                value={formData.pihak_2_id}
                onChange={handleInputChange('pihak_2_id')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                required
              >
                <option value="">Pilih Pegawai...</option>
                {employeeLoading ? (
                  <option>Memuat data...</option>
                ) : (
                  employees
                    .filter((emp) => String(emp.id) !== String(formData.pihak_1_id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nama} ({emp.jabatan})
                      </option>
                    ))
                )}
              </select>
            </div>

          </div>

          {/* Warning */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Perhatian:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Semua perangkat dalam grup akan dipinjam sekaligus</li>
                <li>Pastikan data yang dimasukkan sudah benar</li>
                <li>Perangkat harus dikembalikan sesuai tanggal yang ditentukan</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate('/user/device-group')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Konfirmasi Peminjaman
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowGroupPage;