import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Activity,
  FileText,
  Wrench,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import apiClient from '../../services/api';

const UserDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedDevices, setExpandedDevices] = useState({});
  const [stats, setStats] = useState({
    total_devices: 0,
    available_devices: 0,
    borrowed_devices: 0,
    maintenance_devices: 0
  });
  const [myActiveLoans, setMyActiveLoans] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
    fetchMyLoansCount();
  }, [searchTerm, statusFilter]);

  const fetchMyLoansCount = async () => {
    try {
      const response = await apiClient.get('/loans/my-loans', { 
        params: { page: 1, page_size: 1 } 
      });
      setMyActiveLoans(response.data.total || 0);
    } catch (error) {
      setMyActiveLoans(0);
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        page_size: 100, // Increased to get more devices
        ...(searchTerm && { device_name: searchTerm }),
        ...(statusFilter && { device_status: statusFilter })
      };


      const response = await apiClient.get('/devices/', { params });
      

      // Process devices - parent devices might have children
      const processedDevices = (response.data.devices || []).map(device => {
        // Log device structure to debug

        return {
          ...device,
          children: device.children || [] // Ensure children array exists
        };
      });

      setDevices(processedDevices);
    } catch (error) {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from devices data
  useEffect(() => {
    if (!devices || devices.length === 0) {
      setStats({
        total_devices: 0,
        available_devices: 0,
        borrowed_devices: 0,
        maintenance_devices: 0
      });
      return;
    }

    // Flatten devices: include parent devices without children AND all child devices
    const allDevices = devices.reduce((acc, device) => {
      if (device.children && device.children.length > 0) {
        // If has children, only count the children
        return [...acc, ...device.children];
      } else {
        // If no children, count the parent device
        return [...acc, device];
      }
    }, []);


    const totalDevices = allDevices.length;
    const availableDevices = allDevices.filter(d => 
      d.device_status?.toUpperCase() === 'TERSEDIA'
    ).length;
    const borrowedDevices = allDevices.filter(d => 
      d.device_status?.toUpperCase() === 'DIPINJAM'
    ).length;
    const maintenanceDevices = allDevices.filter(d => 
      d.device_status?.toUpperCase() === 'MAINTENANCE'
    ).length;


    setStats({
      total_devices: totalDevices,
      available_devices: availableDevices,
      borrowed_devices: borrowedDevices,
      maintenance_devices: maintenanceDevices
    });
  }, [devices]);

  const getStatusBadge = (status) => {
    const normalized = (status || "").toUpperCase();
    
    const statusConfig = {
      'TERSEDIA': { 
        label: 'Tersedia', 
        className: 'bg-green-100 text-green-800' 
      },
      'DIPINJAM': { 
        label: 'Dipinjam', 
        className: 'bg-yellow-100 text-yellow-800' 
      },
      'MAINTENANCE': { 
        label: 'Maintenance', 
        className: 'bg-orange-100 text-orange-800' 
      },
      'NONAKTIF': { 
        label: 'Nonaktif', 
        className: 'bg-gray-100 text-gray-800' 
      }
    };

    const config = statusConfig[normalized] || { 
      label: 'Tidak Diketahui', 
      className: 'bg-gray-100 text-gray-800' 
    };

    return (
      <span className={`${config.className} text-xs font-medium px-2.5 py-0.5 rounded`}>
        {config.label}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const toggleExpand = (id) => {
    setExpandedDevices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBorrowDevice = (device) => {
    navigate("/user/borrow", { 
      state: { 
        selectedDevice: device,
        isChildDevice: !!device.parent_id // Flag to identify child device
      } 
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang di IM-Balmon</h1>
        <p className="text-blue-100 mb-6 leading-relaxed">
          Sistem monitoring dan peminjaman perangkat yang memudahkan Anda untuk memantau, 
          meminjam, dan mengembalikan perangkat elektronik dengan efisien. 
          Gunakan fitur scan QR untuk pengalaman yang lebih cepat dan akurat.
        </p>
        <button
          onClick={() => navigate('/user/borrow')}
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-lg"
        >
          <QrCode className="w-5 h-5" />
          <span>Gunakan Alat Monitoring</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid - 5 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Smartphone}
          title="Total Perangkat"
          value={stats.total_devices}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Tersedia"
          value={stats.available_devices}
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Sedang Digunakan"
          value={stats.borrowed_devices}
          color="yellow"
        />
        <StatCard
          icon={Wrench}
          title="Maintenance"
          value={stats.maintenance_devices}
          color="orange"
        />
        <StatCard
          icon={FileText}
          title="Peminjaman Saya"
          value={myActiveLoans}
          color="blue"
        />
      </div>

      {/* Panduan Cepat */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Panduan Cepat</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Ikuti langkah-langkah berikut untuk memulai menggunakan sistem peminjaman perangkat IM-Balmon.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Cari & Lihat Perangkat</h3>
              <p className="text-xs text-gray-500 mt-1">
                Gunakan daftar perangkat di bawah ini untuk melihat ketersediaan perangkat. Klik "Pinjam" pada perangkat yang tersedia.
              </p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Ajukan Peminjaman</h3>
              <p className="text-xs text-gray-500 mt-1">
                Pilih perangkat via scan QR atau manual, isi data surat tugas dan kegiatan, lalu konfirmasi peminjaman Anda.
              </p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Kembalikan Tepat Waktu</h3>
              <p className="text-xs text-gray-500 mt-1">
                Setelah selesai, kunjungi halaman Pengembalian untuk mengajukan pengembalian perangkat sebelum jatuh tempo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Device List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Perangkat</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari perangkat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
              >
                <option value="">Semua Status</option>
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Sedang Digunakan</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Device Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada perangkat</h3>
              <p className="text-gray-500">Tidak ada perangkat yang sesuai dengan filter Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => {
                const hasChildren = Array.isArray(device.children) && device.children.length > 0;
                const expanded = expandedDevices[device.id] || false;
                const status = (device.device_status || "").toUpperCase();
              
                return (
                  <div
                    key={device.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    {/* 🧩 Info utama device */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {device.device_name}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            Kode: {device.device_code || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            NUP: {device.nup_device || '-'}
                          </p>
                          {device.bmn_brand && (
                            <p className="text-xs text-gray-500">
                              Brand: {device.bmn_brand}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ❌ Sembunyikan status dan tombol pinjam kalau punya child */}
                      {!hasChildren && (
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(status)}
                          {status === "TERSEDIA" && (
                            <button
                              onClick={() => handleBorrowDevice(device)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              Pinjam
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 🔽 Tombol Expand jika punya anak */}
                    {hasChildren && (
                      <>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">
                            {device.children.length} unit tersedia
                          </p>
                        </div>
                        <button
                          onClick={() => toggleExpand(device.id)}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm mt-2 flex items-center justify-center space-x-2"
                        >
                          {expanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Tutup Unit</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Lihat Unit ({device.children.length})</span>
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {/* 📦 Daftar unit anak */}
                    {hasChildren && expanded && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {device.children.map((child) => {
                          const childStatus = (child.device_status || "").toUpperCase();
                          return (
                            <div
                              key={child.id}
                              className="flex items-center justify-between py-3 px-3 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1 pr-2">
                                <h4 className="font-medium text-gray-800 text-sm">
                                  {child.device_name}
                                </h4>
                                <div className="space-y-0.5 mt-1">
                                  <p className="text-xs text-gray-500">
                                    Kode: {child.device_code || '-'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    NUP: {child.nup_device || '-'}
                                  </p>
                                </div>
                              </div>
                          
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(childStatus)}
                                {childStatus === "TERSEDIA" && (
                                  <button
                                    onClick={() => handleBorrowDevice(child)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                                  >
                                    Pinjam
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/user/borrow')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Peminjaman</h3>
              <p className="text-sm text-gray-500">Scan QR untuk meminjam perangkat</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/user/return')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pengembalian</h3>
              <p className="text-sm text-gray-500">Kembalikan perangkat yang dipinjam</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/user/reports')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Laporan</h3>
              <p className="text-sm text-gray-500">Lihat riwayat peminjaman Anda</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;