import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import apiClient from '../../services/api';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    devices: { total: 0, available: 0, in_use: 0, maintenance: 0 },
    users: { total: 0, active: 0, pending: 0 },
    loans: { active: 0, overdue: 0, total_today: 0, total_this_month: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState({
    users: 0,
    conditions: 0,
    loans: 0
  });

  useEffect(() => {
    fetchDashboardData();
    fetchPendingApprovals();
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

  const fetchPendingApprovals = async () => {
    try {
      // Fetch pending user approvals
      const userApprovals = await apiClient.get('/users/pending');
      
      // Fetch pending condition change requests
      const conditionRequests = await apiClient.get('/loans/condition-change-requests');
      
      // Fetch pending loans (if any)
      const loanApprovals = await apiClient.get('/loans', {
        params: { status: 'PENDING_APPROVAL' }
      });

      setPendingApprovals({
        users: userApprovals.data?.total || 0,
        conditions: conditionRequests.data?.length || 0,
        loans: loanApprovals.data?.total || 0
      });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green', badge = null }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600 border-green-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
        {badge && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              {badge}
            </span>
          </div>
        )}
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel manajemen IM-Balmon</p>
      </div>

      {/* Pending Approvals - Priority Section */}
      {(pendingApprovals.users > 0 || pendingApprovals.conditions > 0 || pendingApprovals.loans > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-6 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Persetujuan Menunggu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingApprovals.users > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pengguna Baru</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingApprovals.users}</p>
                    <a href="/manager/user-approvals" className="text-sm text-green-600 hover:underline mt-1 inline-block">
                      Lihat Detail →
                    </a>
                  </div>
                )}
                {pendingApprovals.conditions > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Perubahan Kondisi</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingApprovals.conditions}</p>
                    <a href="/manager/condition-approvals" className="text-sm text-green-600 hover:underline mt-1 inline-block">
                      Lihat Detail →
                    </a>
                  </div>
                )}
                {pendingApprovals.loans > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Peminjaman</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingApprovals.loans}</p>
                    <a href="/manager/usage-reports" className="text-sm text-green-600 hover:underline mt-1 inline-block">
                      Lihat Detail →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          badge={stats.users.pending > 0 ? stats.users.pending : null}
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

      {/* Quick Actions - Manager specific */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/manager/user-approvals"
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Setujui Pengguna</span>
          </a>
          <a 
            href="/manager/condition-approvals"
            className="flex items-center justify-center space-x-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 font-medium">Setujui Kondisi</span>
          </a>
          <a 
            href="/manager/statistics"
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">Lihat Laporan</span>
          </a>
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

      {/* Info Box for Manager */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
        <div className="flex items-start">
          <Activity className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Akses Manager
            </h3>
            <p className="text-sm text-green-800">
              Anda memiliki akses untuk melihat semua data, menyetujui permintaan pengguna, 
              perubahan kondisi perangkat, dan membatalkan peminjaman. Untuk menambah atau 
              mengubah data, silakan hubungi Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;