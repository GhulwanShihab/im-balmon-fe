import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, CreditCard, Briefcase, AlertCircle } from 'lucide-react';
import apiClient from '../../../services/api';
import toast from 'react-hot-toast';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', nip: '', jabatan: '', is_pihak_1: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setFetching(true);
      const response = await apiClient.get(`/employees/${id}`);
      setForm(response.data);
    } catch (error) {
      toast.error('Gagal memuat data pegawai');
      navigate('/admin/employees');
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nama.trim()) {
      newErrors.nama = 'Nama pegawai wajib diisi';
    } else if (form.nama.trim().length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }

    const nipVal = (form.nip || '').trim();
    if (nipVal && !/^\d+$/.test(nipVal)) {
      newErrors.nip = 'NIP hanya boleh berisi angka';
    }

    if (!form.jabatan.trim()) {
      newErrors.jabatan = 'Jabatan wajib diisi';
    } else if (form.jabatan.trim().length < 3) {
      newErrors.jabatan = 'Jabatan minimal 3 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon periksa kembali form Anda');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(`/employees/${id}`, {
        nama: form.nama.trim(),
        nip: (form.nip || '').trim() || null,
        jabatan: form.jabatan.trim(),
        is_pihak_1: form.is_pihak_1,
      });
      toast.success('Pegawai berhasil diperbarui');
      navigate('/admin/employees');
    } catch (error) {
      // Try to get specific detail string from backend first (e.g. FastAPI validation errors or custom HTTPException)
      const detail = error.response?.data?.detail;
      let errorMessage = 'Gagal memperbarui pegawai';
      
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        errorMessage = detail[0].msg; // Handle FastAPI Pydantic validation errors
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Memuat data pegawai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group w-fit"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Edit Data Pegawai
                </h1>
                <p className="text-blue-100 mt-1">
                  Perbarui informasi pegawai di bawah ini
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Nama Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Pegawai <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  placeholder="Masukkan nama lengkap pegawai"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.nama
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.nama && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.nama}</span>
                </div>
              )}
            </div>

            {/* NIP Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                NIP <span className="text-gray-400 font-normal text-xs ml-1">(Opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.nip}
                  onChange={(e) => handleChange('nip', e.target.value)}
                  placeholder="Masukkan NIP pegawai"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-mono ${
                    errors.nip
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.nip && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.nip}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <span>💡</span>
                <span>NIP hanya boleh berisi angka</span>
              </p>
            </div>

            {/* Jabatan Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.jabatan}
                  onChange={(e) => handleChange('jabatan', e.target.value)}
                  placeholder="Contoh: Staff IT, Manager, dll"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.jabatan
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.jabatan && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.jabatan}</span>
                </div>
              )}
            </div>

            {/* Toggle is_pihak_1 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hak Akses Pihak 1
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={!!form.is_pihak_1}
                    onChange={(e) => handleChange('is_pihak_1', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    form.is_pihak_1 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_pihak_1 ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Dapat menjadi Kuasa Izin Peminjam Barang (Pihak 1)</p>
                  <p className="text-xs text-gray-500">Jika diaktifkan, pegawai ini akan tampil di dropdown Pihak 1 pada form peminjaman</p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900">
                    Perhatian
                  </p>
                  <p className="text-sm text-amber-700">
                    Pastikan perubahan data sudah benar sebelum menyimpan. Perubahan akan langsung tersimpan di sistem.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;