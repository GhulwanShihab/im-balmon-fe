import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import apiClient from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    devices: { total: 0, available: 0, in_use: 0, maintenance: 0 },
    users: { total: 0, active: 0 },
    loans: { active: 0, overdue: 0, total_today: 0, total_this_month: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [deviceStats, userStats, loanStats] = await Promise.all([
        apiClient.get('/devices/stats'),
        apiClient.get('/users/stats'),
        apiClient.get('/loans/stats')
      ]);

      setStats({
        devices: deviceStats.data,
        users: userStats.data,
        loans: loanStats.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel administrasi IM-Balmon</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Smartphone}
          title="Total Perangkat"
          value={stats.devices.total}
          subtitle={`${stats.devices.available} tersedia`}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Total Pengguna"
          value={stats.users.total}
          subtitle={`${stats.users.active} aktif`}
          color="green"
        />
        <StatCard
          icon={FileText}
          title="Peminjaman Aktif"
          value={stats.loans.active}
          subtitle="Sedang berlangsung"
          color="yellow"
        />
        <StatCard
          icon={AlertTriangle}
          title="Terlambat"
          value={stats.loans.overdue}
          subtitle="Perlu tindak lanjut"
          color="red"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Peminjaman Hari Ini"
          value={stats.loans.total_today}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          title="Peminjaman Bulan Ini"
          value={stats.loans.total_this_month}
          color="green"
        />
        <StatCard
          icon={Activity}
          title="Perangkat Dalam Perawatan"
          value={stats.devices.maintenance}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">Tambah Perangkat</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Kelola Pengguna</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors">
            <FileText className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium">Lihat Laporan</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Server Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Database</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Update</span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;