import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Smartphone, 
  Users, 
  Calendar,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Cell,
  Pie
} from 'recharts';
import axios from 'axios';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [deviceStats, setDeviceStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [loanStats, setLoanStats] = useState({});
  const [usageSummary, setUsageSummary] = useState({});
  const [mostUsedDevices, setMostUsedDevices] = useState([]);
  const [neverUsedDevices, setNeverUsedDevices] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [
        deviceResponse,
        userResponse,
        loanResponse,
        usageResponse,
        mostUsedResponse,
        neverUsedResponse
      ] = await Promise.all([
        axios.get('/api/devices/stats', config),
        axios.get('/api/users/stats', config),
        axios.get('/api/loans/stats', config),
        axios.get('/api/devices/usage/summary', config),
        axios.get('/api/devices/usage/most-used?limit=10', config),
        axios.get('/api/devices/usage/never-used', config)
      ]);

      setDeviceStats(deviceResponse.data);
      setUserStats(userResponse.data);
      setLoanStats(loanResponse.data);
      setUsageSummary(usageResponse.data);
      setMostUsedDevices(mostUsedResponse.data);
      setNeverUsedDevices(neverUsedResponse.data);

      // Generate monthly trends (mock data - replace with actual API)
      generateMonthlyTrends();
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyTrends = () => {
    // Mock data for demonstration - replace with actual API call
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = months.map((month, index) => ({
      month,
      loans: Math.floor(Math.random() * 50) + 20,
      returns: Math.floor(Math.random() * 45) + 15,
      new_devices: Math.floor(Math.random() * 10) + 2
    }));
    setMonthlyTrends(trends);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend = null }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Prepare data for charts
  const deviceStatusData = [
    { name: 'Tersedia', value: deviceStats.available || 0, color: '#10B981' },
    { name: 'Dipinjam', value: deviceStats.in_use || 0, color: '#3B82F6' },
    { name: 'Maintenance', value: deviceStats.maintenance || 0, color: '#F59E0B' },
    { name: 'Tidak Aktif', value: deviceStats.inactive || 0, color: '#6B7280' }
  ];

  const deviceConditionData = [
    { name: 'Baik', value: deviceStats.good_condition || 0, color: '#10B981' },
    { name: 'Rusak Ringan', value: deviceStats.minor_damage || 0, color: '#F59E0B' },
    { name: 'Rusak Berat', value: deviceStats.major_damage || 0, color: '#EF4444' },
    { name: 'Hilang', value: deviceStats.lost || 0, color: '#6B7280' }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Statistik</h1>
        <p className="text-gray-600 mt-1">Analisis dan visualisasi data sistem IM-Balmon</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Smartphone}
          title="Total Perangkat"
          value={deviceStats.total || 0}
          subtitle={`${deviceStats.available || 0} tersedia`}
          color="blue"
          trend="+5% dari bulan lalu"
        />
        <StatCard
          icon={Users}
          title="Total Pengguna"
          value={userStats.total || 0}
          subtitle={`${userStats.active || 0} aktif`}
          color="green"
          trend="+8% dari bulan lalu"
        />
        <StatCard
          icon={Calendar}
          title="Peminjaman Aktif"
          value={loanStats.active || 0}
          subtitle="Sedang berlangsung"
          color="yellow"
        />
        <StatCard
          icon={Activity}
          title="Total Penggunaan"
          value={`${usageSummary.total_usage_days || 0} hari`}
          subtitle="Akumulasi"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loans" stroke="#3B82F6" name="Peminjaman" />
              <Line type="monotone" dataKey="returns" stroke="#10B981" name="Pengembalian" />
              <Line type="monotone" dataKey="new_devices" stroke="#F59E0B" name="Perangkat Baru" />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        {/* Device Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Perangkat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie data={deviceStatusData}>
              <Pie
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Devices */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Perangkat Paling Sering Digunakan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={mostUsedDevices.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="device_name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_usage_days" fill="#3B82F6" name="Hari Penggunaan" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>

        {/* Device Condition Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kondisi Perangkat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie data={deviceConditionData}>
              <Pie
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {deviceConditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Penggunaan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Hari Penggunaan</span>
              <span className="font-semibold">{usageSummary.total_usage_days || 0} hari</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Rata-rata per Perangkat</span>
              <span className="font-semibold">{usageSummary.average_usage_per_device || 0} hari</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Perangkat Aktif</span>
              <span className="font-semibold">{usageSummary.active_devices || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Perangkat Tidak Pernah Digunakan</span>
              <span className="font-semibold text-red-600">{neverUsedDevices.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Tingkat Utilisasi</span>
              <span className="font-semibold text-green-600">
                {deviceStats.total ? ((deviceStats.total - neverUsedDevices.length) / deviceStats.total * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Highlights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sorotan Terbaru</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Peningkatan Peminjaman</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Peminjaman perangkat meningkat 15% dibanding bulan lalu
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Perangkat Terpopuler</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {mostUsedDevices[0]?.device_name || 'Tidak ada data'} adalah perangkat yang paling sering dipinjam
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Perlu Perhatian</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {neverUsedDevices.length} perangkat belum pernah digunakan
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Peminjaman Terlambat</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {loanStats.overdue || 0} peminjaman melewati batas waktu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrik Utama</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{deviceStats.total || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Perangkat</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {deviceStats.total ? ((deviceStats.available || 0) / deviceStats.total * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Tingkat Ketersediaan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {usageSummary.average_usage_per_device || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Rata-rata Hari Penggunaan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{userStats.active || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Pengguna Aktif</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;