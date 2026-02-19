import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle,
  UserCheck,
  Settings,
  XCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import apiClient from '../../services/api';


const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    devices: { 
      total: 0, 
      available: 0, 
      in_use: 0, 
      maintenance: 0,
      good_condition: 0,
      damaged: 0,
      maintenance_condition: 0
    },
    users: { 
      total: 0, 
      active: 0, 
      pending: 0,
      verified: 0
    },
    loans: { 
      active: 0, 
      overdue: 0, 
      total_today: 0, 
      total_this_month: 0,
      total_this_week: 0,
      returned: 0,
      cancelled: 0,
      total_loans: 0,
      most_borrowed_devices: [],
      top_borrowers: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching dashboard data...');

      // Fetch all stats in parallel
      const [deviceStatsRes, userStatsRes, loanStatsRes, devicesRes] = await Promise.all([
        apiClient.get('/devices/stats').catch(err => {
          console.error('❌ Device stats error:', err);
          return { data: null };
        }),
        apiClient.get('/users/stats').catch(err => {
          console.error('❌ User stats error:', err);
          return { data: null };
        }),
        apiClient.get('/loans/stats').catch(err => {
          console.error('❌ Loan stats error:', err);
          return { data: null };
        }),
        // ✅ Fetch actual devices data with valid page_size (max 100)
        apiClient.get('/devices/', { params: { page: 1, page_size: 100 } }).catch(err => {
          console.error('❌ Devices data error:', err);
          return { data: { devices: [] } };
        })
      ]);

      const deviceData = deviceStatsRes.data;
      const userData = userStatsRes.data;
      const loanData = loanStatsRes.data;
      const devicesData = devicesRes.data;

      console.log('✅ Device stats response:', deviceData);
      console.log('✅ Devices data response:', devicesData);
      console.log('✅ Total devices from API:', devicesData?.devices?.length);

      // Calculate device conditions from actual device data
      const allDevices = devicesData?.devices || [];
      
      console.log('📦 Sample device data (first 3):', allDevices.slice(0, 3).map(d => ({
        id: d.id,
        name: d.device_name,
        condition: d.device_condition,
        status: d.device_status,
        hasChildren: !!d.children,
        childrenCount: d.children?.length || 0
      })));
      
      // Flatten devices: include parent devices without children AND all child devices
      const flattenedDevices = allDevices.reduce((acc, device) => {
        if (device.children && device.children.length > 0) {
          // If has children, count the children
          console.log(`Parent "${device.device_name}" has ${device.children.length} children`);
          return [...acc, ...device.children];
        } else {
          // If no children, count the parent device
          console.log(`Device "${device.device_name}" has no children, counting as single device`);
          return [...acc, device];
        }
      }, []);

      console.log('📦 Total flattened devices:', flattenedDevices.length);
      console.log('📦 Sample flattened devices:', flattenedDevices.slice(0, 5).map(d => ({
        name: d.device_name,
        condition: d.device_condition,
        status: d.device_status
      })));

      // Count devices by condition
      const conditionCounts = {
        good_condition: 0,
        damaged: 0,
        maintenance_condition: 0,
        unknown: 0
      };

      flattenedDevices.forEach(device => {
        const condition = device.device_condition?.toUpperCase()?.trim();
        console.log(`Device "${device.device_name}": condition = "${condition}" (type: ${typeof device.device_condition})`);
        
        if (!condition) {
          console.warn(`⚠️ Device "${device.device_name}" has no condition field!`);
          conditionCounts.unknown++;
          return;
        }
        
        switch (condition) {
          case 'BAIK':
            conditionCounts.good_condition++;
            break;
          case 'RUSAK':
            conditionCounts.damaged++;
            break;
          case 'MAINTENANCE':
            conditionCounts.maintenance_condition++;
            break;
          default:
            console.warn(`⚠️ Unknown condition for device "${device.device_name}": "${condition}"`);
            conditionCounts.unknown++;
        }
      });

      console.log('📊 Condition counts:', conditionCounts);
      console.log('📊 Breakdown:');
      console.log('   - BAIK:', conditionCounts.good_condition);
      console.log('   - RUSAK:', conditionCounts.damaged);
      console.log('   - MAINTENANCE:', conditionCounts.maintenance_condition);
      console.log('   - Unknown/Empty:', conditionCounts.unknown);

      // Count devices by status
      const statusCounts = {
        available: flattenedDevices.filter(d => d.device_status?.toUpperCase() === 'TERSEDIA').length,
        in_use: flattenedDevices.filter(d => d.device_status?.toUpperCase() === 'DIPINJAM').length,
        maintenance: flattenedDevices.filter(d => d.device_status?.toUpperCase() === 'MAINTENANCE').length
      };

      console.log('📊 Status counts:', statusCounts);

      // Parse device stats with calculated conditions
      const parsedDeviceStats = {
        // ✅ Use flattened devices count for consistency
        total: flattenedDevices.length,
        // ✅ Use calculated status counts for consistency
        available: statusCounts.available,
        in_use: statusCounts.in_use,
        maintenance: statusCounts.maintenance,
        // Use calculated condition counts
        good_condition: conditionCounts.good_condition,
        damaged: conditionCounts.damaged,
        maintenance_condition: conditionCounts.maintenance_condition
      };

      console.log('✅ Final device stats:', parsedDeviceStats);
      console.log('✅ Verification:');
      console.log('   Total devices:', parsedDeviceStats.total);
      console.log('   Sum of conditions:', 
        parsedDeviceStats.good_condition + 
        parsedDeviceStats.damaged + 
        parsedDeviceStats.maintenance_condition
      );
      console.log('   Condition match:', 
        parsedDeviceStats.total === 
        (parsedDeviceStats.good_condition + parsedDeviceStats.damaged + parsedDeviceStats.maintenance_condition)
          ? '✅ YES' 
          : '❌ NO - Unknown conditions: ' + conditionCounts.unknown
      );
      console.log('   Sum of statuses:', 
        parsedDeviceStats.available + 
        parsedDeviceStats.in_use + 
        parsedDeviceStats.maintenance
      );
      console.log('   Status match:', 
        parsedDeviceStats.total === 
        (parsedDeviceStats.available + parsedDeviceStats.in_use + parsedDeviceStats.maintenance)
          ? '✅ YES' 
          : '❌ NO - Some devices have other status'
      );

      // Parse user stats with flexible field mapping
      const parsedUserStats = {
        total: userData?.total || userData?.total_users || 0,
        active: userData?.active || userData?.active_users || 0,
        pending: userData?.pending || userData?.pending_users || 0,
        verified: userData?.verified || userData?.verified_users || 0
      };

      // Parse loan stats with flexible field mapping
      const parsedLoanStats = {
        active: loanData?.active_loans || loanData?.active || 0,
        overdue: loanData?.overdue_loans || loanData?.overdue || 0,
        total_today: loanData?.loans_today || loanData?.today || 0,
        total_this_month: loanData?.loans_this_month || loanData?.this_month || 0,
        total_this_week: loanData?.loans_this_week || loanData?.this_week || 0,
        returned: loanData?.returned_loans || loanData?.returned || 0,
        cancelled: loanData?.cancelled_loans || loanData?.cancelled || 0,
        total_loans: loanData?.total_loans || loanData?.total || 0,
        most_borrowed_devices: Array.isArray(loanData?.most_borrowed_devices) ? loanData.most_borrowed_devices : [],
        top_borrowers: Array.isArray(loanData?.top_borrowers) ? loanData.top_borrowers : []
      };

      setStats({
        devices: parsedDeviceStats,
        users: parsedUserStats,
        loans: parsedLoanStats
      });

    } catch (error) {
      console.error('❌ Dashboard Error:', error);
      setError('Gagal memuat data dashboard. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', onClick = null }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
      <div 
        className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </div>
    );
  };

  const TopItemCard = ({ title, items, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Icon className={`w-5 h-5 ${colorClasses[color]} mr-2`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {items && items.length > 0 ? (
            items.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-medium truncate">
                    {item.device_name || item.borrower_name || 'N/A'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700 ml-2">
                  {item.loan_count || 0}x
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tidak ada data</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
        <p className="text-gray-600 mt-1">Monitoring & Approval Panel - IM-Balmon</p>
      </div>

      {/* ============================================ */}
      {/* DEVICE STATISTICS - READ ONLY */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
          Statistik Perangkat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Smartphone} 
            title="Total Perangkat" 
            value={stats.devices.total} 
            subtitle={`${stats.devices.available} tersedia`} 
            color="blue" 
          />
          <StatCard 
            icon={CheckCircle} 
            title="Kondisi Baik" 
            value={stats.devices.good_condition} 
            subtitle="Siap digunakan" 
            color="green" 
          />
          <StatCard 
            icon={AlertTriangle} 
            title="Rusak" 
            value={stats.devices.damaged} 
            subtitle="Perlu perhatian" 
            color="orange" 
          />
          <StatCard 
            icon={Settings} 
            title="Maintenance" 
            value={stats.devices.maintenance_condition} 
            subtitle="Dalam perawatan" 
            color="red" 
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* LOAN STATISTICS - WITH APPROVAL ACTIONS */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-yellow-600" />
          Statistik Peminjaman
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={FileText} 
            title="Peminjaman Aktif" 
            value={stats.loans.active} 
            subtitle="Sedang berlangsung" 
            color="blue" 
          />
          <StatCard 
            icon={AlertTriangle} 
            title="Terlambat" 
            value={stats.loans.overdue} 
            subtitle="Perlu tindak lanjut" 
            color="red"
            onClick={() => window.location.href = '/manager/overdue-loans'}
          />
          <StatCard 
            icon={Calendar} 
            title="Bulan Ini" 
            value={stats.loans.total_this_month} 
            subtitle={`${stats.loans.total_this_week} minggu ini`} 
            color="green" 
          />
          <StatCard 
            icon={CheckCircle} 
            title="Total Selesai" 
            value={stats.loans.returned} 
            subtitle={`${stats.loans.cancelled} dibatalkan`} 
            color="purple" 
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* USER STATISTICS - WITH APPROVAL BADGE */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Statistik Pengguna
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            icon={Users} 
            title="Total Pengguna" 
            value={stats.users.total} 
            subtitle={`${stats.users.active} aktif`} 
            color="blue" 
          />
          <StatCard 
            icon={UserCheck} 
            title="Terverifikasi" 
            value={stats.users.verified} 
            subtitle="Akun disetujui" 
            color="green" 
          />
          <StatCard 
            icon={Clock} 
            title="Pending Approval" 
            value={stats.users.pending} 
            subtitle="Menunggu persetujuan" 
            color="yellow"
            onClick={() => window.location.href = '/manager/user-approvals'}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* TOP PERFORMERS - ANALYTICS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItemCard 
          title="Perangkat Paling Sering Dipinjam" 
          items={stats.loans.most_borrowed_devices} 
          icon={TrendingUp} 
          color="blue" 
        />
        <TopItemCard 
          title="Peminjam Paling Aktif" 
          items={stats.loans.top_borrowers} 
          icon={Users} 
          color="green" 
        />
      </div>

      {/* ============================================ */}
      {/* SUMMARY CARDS - INSIGHTS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Perangkat</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Tingkat Penggunaan</span>
              <span className="text-sm font-bold text-blue-600">
                {stats.devices.total > 0 ? ((stats.devices.in_use / stats.devices.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Ketersediaan</span>
              <span className="text-sm font-bold text-green-600">
                {stats.devices.total > 0 ? ((stats.devices.available / stats.devices.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-gray-600">Kondisi Baik</span>
              <span className="text-sm font-bold text-emerald-600">
                {stats.devices.total > 0 ? ((stats.devices.good_condition / stats.devices.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">Rusak</span>
              <span className="text-sm font-bold text-orange-600">
                {stats.devices.total > 0 ? ((stats.devices.damaged / stats.devices.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-bold text-red-600">
                {stats.devices.total > 0 ? ((stats.devices.maintenance_condition / stats.devices.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Peminjaman</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Peminjaman</span>
              <span className="text-sm font-bold text-gray-900">{stats.loans.total_loans.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Selesai</span>
              <span className="text-sm font-bold text-green-600">
                {stats.loans.returned.toLocaleString()} 
                {stats.loans.total_loans > 0 && (
                  <span className="text-xs ml-1">
                    ({((stats.loans.returned / stats.loans.total_loans) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-600">Aktif</span>
              <span className="text-sm font-bold text-yellow-600">
                {stats.loans.active.toLocaleString()}
                {stats.loans.total_loans > 0 && (
                  <span className="text-xs ml-1">
                    ({((stats.loans.active / stats.loans.total_loans) * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* QUICK ACTIONS - MANAGER SPECIFIC */}
      {/* ============================================ */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Aksi Cepat Manager
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/manager/user-approvals"
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all group"
          >
            <UserCheck className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-green-700 font-medium text-center">Setujui Pengguna</span>
          </a>
          
          <a 
            href="/manager/condition-approvals"
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-yellow-50 hover:bg-yellow-100 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all group"
          >
            <CheckCircle className="w-7 h-7 text-yellow-600 group-hover:scale-110 transition-transform" />
            <span className="text-yellow-700 font-medium text-center">Setujui Kondisi</span>
          </a>
          
          <a 
            href="/manager/usage-reports"
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all group"
          >
            <FileText className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-blue-700 font-medium text-center">Laporan Penggunaan</span>
          </a>
          
        </div>
      </div>

      {/* ============================================ */}
      {/* MANAGER INFO BOX - PERMISSION NOTICE */}
      {/* ============================================ 
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Activity className="w-6 h-6 text-green-600 mt-0.5" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
              Akses Manager
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">
                READ-ONLY
              </span>
            </h3>
            <div className="text-sm text-green-800 space-y-1">
              <p className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Melihat semua data perangkat, pengguna, dan peminjaman</span>
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Menyetujui pengguna baru dan perubahan kondisi perangkat</span>
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Membatalkan peminjaman aktif jika diperlukan</span>
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Export laporan dalam format PDF dan Excel</span>
              </p>
              <p className="flex items-center text-green-700 mt-3 pt-3 border-t border-green-200">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-medium">
                  Untuk menambah, mengubah, atau menghapus data, silakan hubungi Administrator
                </span>
              </p>
            </div>
          </div> 
        </div> 
      </div> */}
    </div>
  );
};

export default ManagerDashboard;