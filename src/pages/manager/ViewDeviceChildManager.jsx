import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Eye, QrCode } from 'lucide-react';
import apiClient from '../../services/api';
import { getMediaUrl } from '../../config/api';
import QRCodeGenerator from '../../components/QRCodeGenerator';

const ViewDeviceChildManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deviceChild, setDeviceChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchDeviceChild();
  }, [id]);

  const fetchDeviceChild = async () => {
    try {
      const response = await apiClient.get(`/device-children/${id}`);
      const data = response.data?.device_child || response.data?.data || response.data;

      const normalized = {
        ...data,
        device_status: data.device_status?.toUpperCase?.() || "TERSEDIA",
        device_condition: data.device_condition?.toLowerCase?.() || "baik",
      };
      setDeviceChild(normalized);
    } catch (error) {
      console.error("Error fetching child device:", error);
      alert("Gagal memuat data perangkat anak");
      navigate("/manager/devices");
    } finally {
      setLoading(false);
    }
  };


  const statusBadge = (status) => {
    switch (status) {
      case "TERSEDIA":
        return { label: "Tersedia", color: "bg-green-100 text-green-800" };
      case "DIPINJAM":
        return { label: "Dipinjam", color: "bg-blue-100 text-blue-800" };
      case "MAINTENANCE":
        return { label: "Maintenance", color: "bg-yellow-100 text-yellow-800" };
      case "NONAKTIF":
        return { label: "Tidak Aktif", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Tidak Diketahui", color: "bg-gray-100 text-gray-600" };
    }
  };

  const conditionBadge = (condition) => {
    switch (condition) {
      case "baik":
        return { label: "Baik", color: "bg-green-100 text-green-800" };
      case "rusak_ringan":
        return { label: "Rusak Ringan", color: "bg-yellow-100 text-yellow-800" };
      case "rusak_berat":
        return { label: "Rusak Berat", color: "bg-red-100 text-red-800" };
      case "hilang":
        return { label: "Hilang", color: "bg-gray-200 text-gray-700" };
      default:
        return { label: "Tidak Diketahui", color: "bg-gray-100 text-gray-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!deviceChild) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Perangkat anak tidak ditemukan</h2>
        <button
          onClick={() => navigate('/manager/devices')}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          Kembali ke Daftar Perangkat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/manager/devices')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Perangkat Anak</h1>
            <p className="text-gray-600">Informasi lengkap perangkat anak</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Informasi Utama */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-emerald-600 text-sm font-semibold">1</span>
          </div>
          Identitas Perangkat Anak
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Nama Perangkat Anak
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Kode Perangkat Anak
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              NUP Perangkat
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.nup_device}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Brand
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {deviceChild.bmn_brand || deviceChild.sample_brand || '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tahun Perangkat
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_year || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tipe Perangkat
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_type || '-'}</p>
          </div>
        </div>
      </div>

      {/* Lokasi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-emerald-600 text-sm font-semibold">2</span>
          </div>
          Lokasi & Penempatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Stasiun
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_station || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Ruangan
            </label>
            <p className="text-lg font-semibold text-gray-900">{deviceChild.device_room || '-'}</p>
          </div>
        </div>
      </div>

      {/* Status & Kondisi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-emerald-600 text-sm font-semibold">3</span>
          </div>
          Status & Kondisi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Kondisi
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                conditionBadge(deviceChild.device_condition).color
              }`}
            >
              {conditionBadge(deviceChild.device_condition).label}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                statusBadge(deviceChild.device_status).color
              }`}
            >
              {statusBadge(deviceChild.device_status).label}
            </span>
          </div>
        </div>
      </div>

      {/* Deskripsi */}
      {deviceChild.description && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">4</span>
            </div>
            Deskripsi
          </h3>
          <p className="text-gray-900 leading-relaxed">{deviceChild.description}</p>
        </div>
      )}

      {/* Foto */}
      {deviceChild.photos_url && deviceChild.photos_url.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">5</span>
            </div>
            Foto Perangkat Anak
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deviceChild.photos_url.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={getMediaUrl(url)}
                  alt={`child-photo-${i}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <a
                  href={getMediaUrl(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <Eye className="w-6 h-6 text-white" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeGenerator
        device={deviceChild}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};

export default ViewDeviceChildManager;
