import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  QrCode
} from 'lucide-react';
import apiClient from '../../services/api';
import QRCodeGenerator from '../../components/QRCodeGenerator';

const Devices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDeviceForQR, setSelectedDeviceForQR] = useState(null);
  const [filters, setFilters] = useState({
    device_type: '',
    device_condition: '',
    device_status: '',
    device_room: ''
  });


  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchTerm, filters]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 10,
        ...(searchTerm && { device_name: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get('/devices/', { params });

      // Handle different possible response structures
      const devicesData = response.data?.devices || response.data?.data || response.data || [];
      const totalCount = response.data?.total || response.data?.count || devicesData.length || 0;
      
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (error) {
      console.error('Error fetching devices:', error);
      
      // Show user-friendly error message
      if (error.message === 'Session expired. Please login again.') {
        // Already handled by interceptor
        return;
      }
      
      // Handle other errors
      setDevices([]);
      alert('Gagal memuat data perangkat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) {
      try {
        await apiClient.delete(`/devices/${deviceId}`);
        fetchDevices();
        alert('Perangkat berhasil dihapus');
      } catch (error) {
        console.error('Error deleting device:', error);
        
        if (error.message === 'Session expired. Please login again.') {
          return;
        }
        
        alert('Gagal menghapus perangkat. Silakan coba lagi.');
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Perangkat</h1>
          <p className="text-gray-600 mt-1">Kelola semua perangkat dalam sistem</p>
        </div>
        <button
          onClick={() => navigate('/admin/devices/add')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perangkat</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari perangkat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.device_condition}
              onChange={(e) => setFilters({...filters, device_condition: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="BAIK">Baik</option>
              <option value="RUSAK">Rusak</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            
            <select
              value={filters.device_status}
              onChange={(e) => setFilters({...filters, device_status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="maintenance">Maintenance</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perangkat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode/NUP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kondisi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruangan
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {device.device_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {device.device_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{device.device_code}</div>
                        <div className="text-sm text-gray-500">{device.nup_device}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {device.bmn_brand || device.sample_brand}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          device.device_condition?.toUpperCase() === 'BAIK' 
                            ? 'bg-green-100 text-green-800'
                            : device.device_condition?.toUpperCase() === 'RUSAK'
                            ? 'bg-red-100 text-red-800'
                            : device.device_condition?.toUpperCase() === 'MAINTENANCE'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.device_condition?.toUpperCase() === 'BAIK' ? 'Baik' :
                           device.device_condition?.toUpperCase() === 'RUSAK' ? 'Rusak' :
                           device.device_condition?.toUpperCase() === 'MAINTENANCE' ? 'Maintenance' : 
                           device.device_condition || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          device.device_status === 'tersedia' 
                            ? 'bg-green-100 text-green-800'
                            : device.device_status === 'dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : device.device_status === 'maintenance'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.device_status === 'tersedia' ? 'Tersedia' :
                           device.device_status === 'dipinjam' ? 'Dipinjam' :
                           device.device_status === 'maintenance' ? 'Maintenance' : 
                           device.device_status === 'tidak_aktif' ? 'Tidak Aktif' : device.device_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {device.device_room || '-'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDeviceForQR(device);
                              setShowQRModal(true);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-800"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/devices/${device.id}/view`)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/devices/${device.id}/edit`)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* QR Code Modal */}
      <QRCodeGenerator
        device={selectedDeviceForQR}
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedDeviceForQR(null);
        }}
      />
    </div>
  );
};

export default Devices;