import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Search, X, Radio, DoorOpen, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../../services/api';
import toast from 'react-hot-toast';

const Locations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('STASIUN'); // 'STASIUN' | 'RUANGAN'
  const [expandedId, setExpandedId] = useState(null);
  const [devicesByLocation, setDevicesByLocation] = useState({});

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await apiClient.get('/locations/');
      const data = Array.isArray(res.data) ? res.data : [];
      setLocations(data);
    } catch (err) {
      toast.error('Gagal memuat data lokasi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevicesForLocation = async (locationId) => {
    if (devicesByLocation[locationId]) return; // already loaded
    try {
      const res = await apiClient.get(`/locations/${locationId}`);
      setDevicesByLocation(prev => ({ ...prev, [locationId]: res.data.devices || [] }));
    } catch (err) {
      setDevicesByLocation(prev => ({ ...prev, [locationId]: [] }));
    }
  };

  const handleExpandToggle = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchDevicesForLocation(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/locations/${id}`);
      toast.success('Lokasi berhasil dihapus');
      setDeleteConfirm(null);
      fetchLocations();
    } catch (err) {
      toast.error('Gagal menghapus lokasi');
    }
  };

  const filteredLocations = locations
    .filter(loc => loc.type === activeTab)
    .filter(loc =>
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stasiunCount = locations.filter(l => l.type === 'STASIUN').length;
  const ruanganCount = locations.filter(l => l.type === 'RUANGAN').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lokasi</h1>
          <p className="text-gray-600">Kelola stasiun dan ruangan perangkat secara terpisah</p>
        </div>
        <button
          onClick={() => navigate(`/admin/locations/add?type=${activeTab}`)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah {activeTab === 'STASIUN' ? 'Stasiun' : 'Ruangan'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
        <button
          onClick={() => { setActiveTab('STASIUN'); setExpandedId(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-md transition-all font-medium text-sm ${
            activeTab === 'STASIUN'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Stasiun ({stasiunCount})</span>
        </button>
        <button
          onClick={() => { setActiveTab('RUANGAN'); setExpandedId(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-md transition-all font-medium text-sm ${
            activeTab === 'RUANGAN'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Ruangan ({ruanganCount})</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Cari ${activeTab === 'STASIUN' ? 'stasiun' : 'ruangan'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            {activeTab === 'STASIUN' ? <Radio className="w-12 h-12 text-gray-300 mb-4" /> : <DoorOpen className="w-12 h-12 text-gray-300 mb-4" />}
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchTerm ? `${activeTab === 'STASIUN' ? 'Stasiun' : 'Ruangan'} tidak ditemukan` : `Belum ada ${activeTab === 'STASIUN' ? 'stasiun' : 'ruangan'}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : `Tambahkan ${activeTab === 'STASIUN' ? 'stasiun' : 'ruangan'} baru untuk memulai`}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate(`/admin/locations/add?type=${activeTab}`)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Tambah {activeTab === 'STASIUN' ? 'Stasiun' : 'Ruangan'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {activeTab === 'STASIUN' ? 'Nama Stasiun' : 'Nama Ruangan'}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perangkat</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLocations.map((loc, index) => (
                  <>
                    <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${activeTab === 'STASIUN' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                            {activeTab === 'STASIUN' ? <Radio className="w-3.5 h-3.5 text-emerald-600" /> : <DoorOpen className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{loc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{loc.description || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleExpandToggle(loc.id)}
                          className="inline-flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                          {expandedId === loc.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/locations/${loc.id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(loc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded devices row */}
                    {expandedId === loc.id && (
                      <tr key={`devices-${loc.id}`} className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="ml-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Perangkat di {activeTab === 'STASIUN' ? 'Stasiun' : 'Ruangan'} ini:
                            </p>
                            {!devicesByLocation[loc.id] ? (
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                <span>Memuat...</span>
                              </div>
                            ) : devicesByLocation[loc.id].length === 0 ? (
                              <p className="text-sm text-gray-400 italic">Tidak ada perangkat di lokasi ini.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {devicesByLocation[loc.id].map(dev => (
                                  <div key={dev.id} className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                                    <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{dev.device_name || dev.device_code}</p>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">{dev.device_code}</span>
                                        {dev.device_condition && (
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            dev.device_condition === 'BAIK' ? 'bg-green-100 text-green-700' :
                                            dev.device_condition === 'RUSAK_RINGAN' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            {dev.device_condition}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus {activeTab === 'STASIUN' ? 'Stasiun' : 'Ruangan'}?</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus {activeTab === 'STASIUN' ? 'stasiun' : 'ruangan'} ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;