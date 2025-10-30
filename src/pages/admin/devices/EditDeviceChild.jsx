import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import apiClient from '../../../services/api';
import toast from 'react-hot-toast';

const EditDeviceChild = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingDevice, setFetchingDevice] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const [device, setDevice] = useState({
    device_name: '',
    device_code: '',
    nup_device: '',
    bmn_brand: '',
    sample_brand: '',
    device_year: new Date().getFullYear(),
    device_type: '',
    device_station: '',
    device_condition: 'baik',
    device_status: 'TERSEDIA',
    device_room: '',
    description: '',
    parent_id: null,
  });

  useEffect(() => {
    fetchDeviceChild();
  }, [id]);

  const fetchDeviceChild = async () => {
    try {
      const response = await apiClient.get(`/device-children/${id}`);
      const data = response.data?.device_child || response.data?.data || response.data;
      console.log("Fetched child device:", data);

      setDevice(data);
      setExistingPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching child device:', error);
      toast.error('Gagal memuat data perangkat anak');
      navigate('/admin/devices');
    } finally {
      setFetchingDevice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Updating child device:', device);

      const response = await apiClient.put(`/device-children/${id}`, device);

      if (photos.length > 0) {
        for (const file of photos) {
          const formData = new FormData();
          formData.append('file', file);
          await apiClient.post(`/device-children/${id}/photos`, formData, {
            headers: { 'Content-Type': undefined },
          });
        }
      }

      toast.success('Perangkat anak berhasil diperbarui');
      navigate('/admin/devices');
    } catch (error) {
      console.error('Error updating device child:', error);
      toast.error('Gagal memperbarui perangkat anak');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDevice((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingPhoto = async (photoId) => {
    if (!window.confirm('Hapus foto ini?')) return;
    try {
      await apiClient.delete(`/device-children/${id}/photos/${photoId}`);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success('Foto dihapus');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus foto');
    }
  };

  if (fetchingDevice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Perangkat Anak</h1>
          <p className="text-gray-600">Perbarui informasi perangkat turunan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTITAS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identitas Perangkat Anak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nama Perangkat *" field="device_name" value={device.device_name} onChange={handleInputChange} />
            <InputField label="Kode Perangkat *" field="device_code" value={device.device_code} onChange={handleInputChange} />
            <InputField label="NUP Perangkat *" field="nup_device" value={device.nup_device} onChange={handleInputChange} />
            <InputField label="Brand BMN" field="bmn_brand" value={device.bmn_brand} onChange={handleInputChange} />
            <InputField label="Brand Sample" field="sample_brand" value={device.sample_brand} onChange={handleInputChange} />
            <InputField label="Tahun" type="number" field="device_year" value={device.device_year} onChange={handleInputChange} />
            <InputField label="Tipe Perangkat" field="device_type" value={device.device_type} onChange={handleInputChange} />
          </div>
        </div>

        {/* LOKASI */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lokasi & Penempatan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Stasiun" field="device_station" value={device.device_station} onChange={handleInputChange} />
            <InputField label="Ruangan" field="device_room" value={device.device_room} onChange={handleInputChange} />
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Kondisi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi</label>
              <select
                value={device.device_condition}
                onChange={(e) => handleInputChange('device_condition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={device.device_status}
                onChange={(e) => handleInputChange('device_status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="NONAKTIF">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* DESKRIPSI */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deskripsi</h3>
          <textarea
            value={device.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Deskripsi perangkat anak..."
          />
        </div>

        {/* FOTO */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Foto Perangkat Anak</h3>
          {existingPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.url} alt="device" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingPhoto(photo.id)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

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

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`preview-${i}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
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

        {/* BUTTON */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/devices')}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium"
          >
            {loading ? 'Menyimpan...' : 'Perbarui Perangkat Anak'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 🔧 Input helper
const InputField = ({ label, field, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(field, type === 'number' ? parseInt(e.target.value) : e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

export default EditDeviceChild;
