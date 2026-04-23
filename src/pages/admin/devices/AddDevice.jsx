import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import apiClient from '../../../services/api';
import { useDeviceForm } from '../../../hooks/useDeviceForm';

const AddDevice = () => {
  const navigate = useNavigate();
  const {
    device,
    loading,
    setLoading,
    photos,
    previews,
    stations,
    rooms,
    handleInputChange,
    handleFileChange,
    handleRemovePhoto,
  } = useDeviceForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      // 1️⃣ Simpan data perangkat dulu
      const res = await apiClient.post('/devices/', device);
      const newDevice = res.data;

      // 2️⃣ Upload foto kalau ada
      if (photos && photos.length > 0 && newDevice.id) {
        for (const file of photos) {
          const formData = new FormData();
          formData.append('file', file);

          await apiClient.post(`/devices/${newDevice.id}/photos`, formData, {
            headers: { 'Content-Type': undefined },
          });
        }
      }

      alert('Perangkat dan foto berhasil ditambahkan');
      navigate('/admin/devices');
    } catch (error) {

      if (error.message === 'Session expired. Please login again.') {
        return;
      }

      // Try to get specific detail string from backend first (e.g. FastAPI validation errors or custom HTTPException)
      const detail = error.response?.data?.detail;
      let errorMessage = 'Gagal menambahkan perangkat. Silakan coba lagi.';
      
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        errorMessage = detail[0].msg; // Handle FastAPI Pydantic validation errors
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/devices')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Perangkat Baru</h1>
          <p className="text-gray-600">Lengkapi informasi perangkat monitoring</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">1</span>
            </div>
            Identitas Perangkat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Perangkat
              </label>
              <input
                type="text"
                value={device.device_name}
                onChange={(e) => handleInputChange('device_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Masukkan Nama Perangkat"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Perangkat *
              </label>
              <input
                type="text"
                value={device.device_code}
                onChange={(e) => handleInputChange('device_code', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Masukkan Kode Perangkat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NUP Perangkat *
              </label>
              <input
                type="text"
                value={device.nup_device}
                onChange={(e) => handleInputChange('nup_device', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Nomor Urut Pendaftaran"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand BMN
              </label>
              <input
                type="text"
                value={device.bmn_brand}
                onChange={(e) => handleInputChange('bmn_brand', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Brand untuk BMN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Sample
              </label>
              <input
                type="text"
                value={device.sample_brand}
                onChange={(e) => handleInputChange('sample_brand', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Brand untuk sample"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Perangkat
              </label>
              <input
                type="number"
                value={device.device_year}
                onChange={(e) => handleInputChange('device_year', parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="2000"
                max={new Date().getFullYear() + 5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Perangkat
              </label>
              <input
                type="text"
                value={device.device_type}
                onChange={(e) => handleInputChange('device_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Masukkan Tipe Perangkat"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">2</span>
            </div>
            Lokasi & Penempatan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stasiun Perangkat
              </label>
              <select
                value={device.device_station}
                onChange={(e) => handleInputChange('device_station', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Pilih Stasiun --</option>
                {stations.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruangan
              </label>
              <select
                value={device.device_room}
                onChange={(e) => handleInputChange('device_room', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">3</span>
            </div>
            Status & Kondisi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kondisi Perangkat
              </label>
              <select
                value={device.device_condition}
                onChange={(e) => handleInputChange('device_condition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK">Rusak</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Perangkat
              </label>
              <select
                value={device.device_status}
                onChange={(e) => handleInputChange('device_status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="NONAKTIF">Tidak Aktif</option>
              </select>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">4</span>
            </div>
            Informasi Tambahan
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Perangkat
            </label>
            <textarea
              value={device.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Deskripsi detail perangkat, spesifikasi, atau catatan khusus..."
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">5</span>
            </div>
            Foto Perangkat
          </h3>

          <div className="flex flex-col space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Foto (opsional)
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-semibold
                         file:bg-emerald-50 file:text-emerald-700
                         hover:file:bg-emerald-100"
            />

            {/* Preview Thumbnail */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/devices')}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Simpan Perangkat</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDevice;