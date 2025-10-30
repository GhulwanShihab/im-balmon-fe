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
  Activity
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
    my_active_loans: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, [searchTerm, statusFilter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page_size: 20,
        ...(searchTerm && { device_name: searchTerm }),
        ...(statusFilter && { device_status: statusFilter })
      };

      const response = await apiClient.get('/devices/', {
        params
      });

      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [deviceStats, myLoans] = await Promise.all([
        apiClient.get('/devices/stats'),
        apiClient.get('/loans/my-loans?page_size=1')
      ]);

      setStats({
        total_devices: deviceStats.data.total || 0,
        available_devices: deviceStats.data.available || 0,
        borrowed_devices: deviceStats.data.in_use || 0,
        my_active_loans: myLoans.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toUpperCase();
    
    switch (normalized) {
      case "TERSEDIA":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Tersedia</span>;
      case "DIPINJAM":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Dipinjam</span>;
      case "MAINTENANCE":
        return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Maintenance</span>;
      case "NONAKTIF":
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Nonaktif</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tidak Diketahui</span>;
    }
  };


  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          icon={Activity}
          title="Peminjaman Saya"
          value={stats.my_active_loans}
          color="purple"
        />
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
                <option value="tersedia">Tersedia</option>
                <option value="dipinjam">Sedang Digunakan</option>
                <option value="maintenance">Maintenance</option>
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
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                  >
                    {/* 🧩 Info utama device */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{device.device_name}</h3>
                        <p className="text-sm text-gray-500">
                          {device.device_code} • {device.nup_device}
                        </p>
                      </div>

                      {/* ❌ Sembunyikan status dan tombol pinjam kalau punya child */}
                      {!hasChildren && (
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status)}
                          {status === "TERSEDIA" && (
                            <button
                              onClick={() =>
                                navigate("/user/borrow", { state: { selectedDevice: device } })
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg text-xs"
                            >
                              Pinjam
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 🔽 Tombol Expand jika punya anak */}
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(device.id)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm mt-3 flex items-center justify-center space-x-2"
                      >
                        {expanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Tutup Unit</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Lihat Unit</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* 📦 Daftar unit anak */}
                    {hasChildren && expanded && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
                        {device.children.map((child) => {
                          const childStatus = (child.device_status || "").toUpperCase();
                          return (
                            <div
                              key={child.id}
                              className="flex items-center justify-between py-2 px-3 text-sm"
                            >
                              <div>
                                <h4 className="font-medium text-gray-800">{child.device_name}</h4>
                                <p className="text-xs text-gray-500">
                                  {child.device_code} • {child.nup_device}
                                </p>
                              </div>
                          
                              <div className="flex items-center gap-2">
                                {getStatusBadge(childStatus)}
                                {childStatus === "TERSEDIA" && (
                                  <button
                                    onClick={() =>
                                      navigate("/user/borrow", { state: { selectedDevice: child } })
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg text-xs"
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