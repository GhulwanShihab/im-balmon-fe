import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Folder,
  Trash2,
  Edit2,
  Eye,
  ChevronRight,
  Plus,
  X,
  Search,
  Package,
  CheckCircle,
  AlertCircle,
  Layers,
  Calendar,
  User,
  Info
} from 'lucide-react';
import apiClient from '../../services/api';
import DeviceImage from '../../components/DeviceImage';
import toast from 'react-hot-toast';

const DeviceGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeviceListModal, setShowDeviceListModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const navigate = useNavigate();

  // Form state for creating/editing group
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    device_ids: [],
    child_device_ids: []
  });

  useEffect(() => {
    fetchGroups();
    fetchDevices();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/device-groups/', {
        params: { page_size: 100 }
      });
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat grup perangkat');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await apiClient.get('/devices/', {
        params: { page_size: 100 }
      });
      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('Nama grup harus diisi');
      return;
    }

    if (groupForm.device_ids.length === 0 && groupForm.child_device_ids.length === 0) {
      toast.error('Pilih minimal 1 perangkat');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/device-groups/', groupForm);
      toast.success('Grup berhasil dibuat!');
      setShowCreateModal(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal membuat grup');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Yakin ingin menghapus grup ini?')) return;

    try {
      await apiClient.delete(`/device-groups/${groupId}`);
      toast.success('Grup berhasil dihapus');
      fetchGroups();
    } catch (error) {
      toast.error('Gagal menghapus grup');
    }
  };

  const handleViewGroupDetail = async (groupId) => {
    try {
      const response = await apiClient.get(`/device-groups/${groupId}`);
      setSelectedGroup(response.data);
    } catch (error) {
      toast.error('Gagal memuat detail grup');
    }
  };

  const handleBorrowGroup = async (group) => {
    // Check availability first
    try {
      const response = await apiClient.get(`/device-groups/${group.id}/check-availability`);
      
      if (!response.data.all_available) {
        toast.error(`Tidak dapat meminjam grup: ${response.data.unavailable_devices.join(', ')} sedang tidak tersedia`);
        return;
      }

      // Navigate to borrow page with group info
      navigate('/user/borrow-group', { state: { group } });
    } catch (error) {
      toast.error('Gagal mengecek ketersediaan grup');
    }
  };

  const toggleDeviceSelection = (deviceId, isChild = false) => {
    const key = isChild ? 'child_device_ids' : 'device_ids';
    
    setGroupForm(prev => {
      const currentIds = prev[key];
      const newIds = currentIds.includes(deviceId)
        ? currentIds.filter(id => id !== deviceId)
        : [...currentIds, deviceId];
      
      return { ...prev, [key]: newIds };
    });
  };

  const resetForm = () => {
    setGroupForm({
      name: '',
      description: '',
      device_ids: [],
      child_device_ids: []
    });
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDevices = devices.filter(device =>
    device.device_name.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
    device.device_code.toLowerCase().includes(deviceSearchTerm.toLowerCase())
  );

  const getTotalSelectedDevices = () => {
    return groupForm.device_ids.length + groupForm.child_device_ids.length;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Folder className="w-6 h-6 text-blue-600" />
              Grup Perangkat Saya
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola grup perangkat untuk memudahkan peminjaman
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeviceListModal(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Perangkat</span>
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Grup Baru</span>
              <span className="sm:hidden">Buat</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari grup perangkat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Narasi Panduan */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Apa itu Grup Perangkat?</p>
          <p>
            Grup perangkat memudahkan Anda <strong>meminjam beberapa perangkat sekaligus</strong> dalam satu kali proses. 
            Buat grup dengan memilih perangkat yang sering Anda pinjam bersamaan, lalu klik tombol <strong>"Pinjam"</strong> pada grup tersebut 
            untuk langsung mengajukan peminjaman semua perangkat dalam grup.
          </p>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat grup perangkat...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Grup tidak ditemukan' : 'Belum ada grup perangkat'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Coba kata kunci lain atau buat grup baru'
              : 'Buat grup perangkat untuk memudahkan peminjaman perangkat secara batch'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <FolderPlus className="w-5 h-5" />
              Buat Grup Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.device_count} perangkat
                    </p>
                  </div>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewGroupDetail(group.id)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Detail
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBorrowGroup(group)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Pinjam
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-700 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Buat Grup Perangkat Baru</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Grup *
                  </label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Monitoring Cuaca Set A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan tujuan atau kegunaan grup ini..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Device Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Pilih Perangkat ({getTotalSelectedDevices()})
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari perangkat..."
                      value={deviceSearchTerm}
                      onChange={(e) => setDeviceSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-xl p-4">
                  {filteredDevices.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Tidak ada perangkat yang cocok
                    </p>
                  ) : (
                    filteredDevices.map((device) => {
                      const hasChildren = device.children && device.children.length > 0;
                      const isParentSelected = groupForm.device_ids.includes(device.id);
                      const status = (device.device_status || '').toUpperCase();
                      const isAvailable = status === 'TERSEDIA';

                      return (
                        <div key={device.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Parent Device */}
                          <div className={`p-3 flex items-center justify-between ${!isAvailable ? 'bg-gray-50' : ''}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isParentSelected}
                                onChange={() => toggleDeviceSelection(device.id, false)}
                                disabled={!isAvailable}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {device.device_name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {device.device_code} • {device.nup_device}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {status}
                            </span>
                          </div>

                          {/* Child Devices */}
                          {hasChildren && (
                            <div className="bg-gray-50 border-t border-gray-200 p-3 space-y-2">
                              {device.children.map((child) => {
                                const isChildSelected = groupForm.child_device_ids.includes(child.id);
                                const childStatus = (child.device_status || '').toUpperCase();
                                const isChildAvailable = childStatus === 'TERSEDIA';

                                return (
                                  <div key={child.id} className="flex items-center justify-between pl-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <input
                                        type="checkbox"
                                        checked={isChildSelected}
                                        onChange={() => toggleDeviceSelection(child.id, true)}
                                        disabled={!isChildAvailable}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                                      />
                                      <Layers className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-medium text-gray-800 truncate">
                                          {child.device_name}
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                          {child.device_code}
                                        </p>
                                      </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      isChildAvailable 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {childStatus}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={loading || getTotalSelectedDevices() === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Membuat...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Buat Grup ({getTotalSelectedDevices()})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detail Grup</h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedGroup.name}
                </h3>
                {selectedGroup.description && (
                  <p className="text-gray-600">{selectedGroup.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(selectedGroup.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <span>
                    <Package className="w-4 h-4 inline mr-1" />
                    {selectedGroup.device_count} perangkat
                  </span>
                </div>
              </div>

              {/* Devices List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Perangkat dalam Grup</h4>
                <div className="space-y-2">
                  {selectedGroup.devices && selectedGroup.devices.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      {item.child_device_id ? (
                        <Layers className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Package className="w-4 h-4 text-green-500" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.device_name}</h5>
                        <p className="text-sm text-gray-500">{item.device_code}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.device_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Warning */}
              {selectedGroup.all_available === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 mb-1">Tidak Semua Perangkat Tersedia</p>
                    <p className="text-sm text-yellow-800">
                      Perangkat berikut tidak tersedia: {selectedGroup.unavailable_devices?.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedGroup(null);
                    handleBorrowGroup(selectedGroup);
                  }}
                  disabled={!selectedGroup.all_available}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-5 h-5" />
                  Pinjam Grup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device List Modal (View Only) */}
      {showDeviceListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Daftar Perangkat</h2>
              <button
                onClick={() => setShowDeviceListModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari perangkat..."
                  value={deviceSearchTerm}
                  onChange={(e) => setDeviceSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                {filteredDevices.map((device) => {
                  const hasChildren = device.children && device.children.length > 0;
                  const status = (device.device_status || '').toUpperCase();

                  return (
                    <div key={device.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        {/* Device Image */}
                        <DeviceImage 
                          photos={device.photos_url} 
                          name={device.device_name} 
                          size="md" 
                        />
                        
                        {/* Device Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{device.device_name}</h4>
                          <p className="text-sm text-gray-500 truncate">
                            {device.device_code} • {device.nup_device}
                          </p>
                          {device.device_type && (
                            <p className="text-xs text-gray-400 mt-0.5">{device.device_type}</p>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`text-xs px-2.5 py-1 rounded flex-shrink-0 ${
                          status === 'TERSEDIA'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status}
                        </span>
                      </div>

                      {hasChildren && (
                        <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-2">
                          {device.children.map((child) => {
                            const childStatus = (child.device_status || '').toUpperCase();
                            return (
                              <div key={child.id} className="flex items-center justify-between pl-4">
                                <div className="flex items-center gap-3">
                                  <Layers className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-800">{child.device_name}</h5>
                                    <p className="text-xs text-gray-500">{child.device_code}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  childStatus === 'TERSEDIA'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {childStatus}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceGroupsPage;