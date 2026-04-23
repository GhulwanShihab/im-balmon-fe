import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Radio, DoorOpen } from 'lucide-react';
import apiClient from '../../../services/api';
import toast from 'react-hot-toast';

const AddLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'STASIUN';
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: defaultType,
    description: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/locations/', form);
      toast.success(`${form.type === 'STASIUN' ? 'Stasiun' : 'Ruangan'} berhasil ditambahkan`);
      navigate('/admin/locations');
    } catch (error) {
      if (error.message === 'Session expired. Please login again.') return;
      toast.error(`Gagal menambahkan ${form.type === 'STASIUN' ? 'stasiun' : 'ruangan'}`);
    } finally {
      setLoading(false);
    }
  };

  const isStation = form.type === 'STASIUN';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/locations')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Lokasi Baru</h1>
          <p className="text-gray-600">Tambahkan stasiun atau ruangan baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">1</span>
            </div>
            Tipe Lokasi
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange('type', 'STASIUN')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                isStation
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Radio className={`w-8 h-8 mb-2 ${isStation ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${isStation ? 'text-emerald-700' : 'text-gray-600'}`}>Stasiun</span>
              <span className="text-xs text-gray-500 mt-1">Stasiun pemantauan</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'RUANGAN')}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                !isStation
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <DoorOpen className={`w-8 h-8 mb-2 ${!isStation ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${!isStation ? 'text-blue-700' : 'text-gray-600'}`}>Ruangan</span>
              <span className="text-xs text-gray-500 mt-1">Ruangan perangkat</span>
            </button>
          </div>
        </div>

        {/* Name & Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">2</span>
            </div>
            Informasi {isStation ? 'Stasiun' : 'Ruangan'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama {isStation ? 'Stasiun' : 'Ruangan'} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder={isStation ? 'Masukkan Nama Stasiun' : 'Masukkan Nama Ruangan'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Deskripsi lokasi (opsional)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/locations')}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 ${
              isStation 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Simpan {isStation ? 'Stasiun' : 'Ruangan'}</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLocation;