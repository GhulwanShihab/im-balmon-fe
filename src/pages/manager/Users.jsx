import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Eye,
  Shield,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Lock
} from 'lucide-react';
import axios from 'axios';

const ManagerUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [filters, setFilters] = useState({
    is_active: '',
    is_verified: '',
    mfa_enabled: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    mfa_enabled: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, searchTerm, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const params = {
        page: currentPage,
        page_size: 10,
        ...(searchTerm && { email: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await axios.get('/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await axios.get('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green' }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
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

  const UserDetailModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-semibold text-gray-900">Detail Pengguna</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900 mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <p className="text-sm text-gray-900 mt-1">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900 mt-1">{user.username || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Terverifikasi</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MFA</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.mfa_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.mfa_enabled ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Terakhir Login</label>
                <p className="text-sm text-gray-900 mt-1">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                  >
                    <Shield className="w-3 h-3" />
                    {role.name}
                  </span>
                )) || <span className="text-sm text-gray-500">Tidak ada role</span>}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - READ ONLY */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pengguna</h1>
          <p className="text-gray-600 mt-1">Lihat informasi pengguna sistem</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-sm text-green-800 font-medium">📖 Mode Tampilan (Read-Only)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UsersIcon}
          title="Total Pengguna"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          title="Pengguna Aktif"
          value={stats.active}
          subtitle={`${((stats.active / stats.total) * 100 || 0).toFixed(1)}% dari total`}
          color="green"
        />
        <StatCard
          icon={Shield}
          title="Email Terverifikasi"
          value={stats.verified}
          subtitle={`${((stats.verified / stats.total) * 100 || 0).toFixed(1)}% dari total`}
          color="yellow"
        />
        <StatCard
          icon={Lock}
          title="MFA Aktif"
          value={stats.mfa_enabled}
          subtitle={`${((stats.mfa_enabled / stats.total) * 100 || 0).toFixed(1)}% dari total`}
          color="purple"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari email pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({...filters, is_active: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
            
            <select
              value={filters.is_verified}
              onChange={(e) => setFilters({...filters, is_verified: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Verifikasi</option>
              <option value="true">Terverifikasi</option>
              <option value="false">Belum Terverifikasi</option>
            </select>

            <select
              value={filters.mfa_enabled}
              onChange={(e) => setFilters({...filters, mfa_enabled: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua MFA</option>
              <option value="true">MFA Aktif</option>
              <option value="false">MFA Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verifikasi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MFA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-green-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'Terverifikasi' : 'Belum'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.mfa_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.mfa_enabled ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.slice(0, 2).map((role) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                            >
                              <Shield className="w-3 h-3" />
                              {role.name}
                            </span>
                          )) || <span className="text-xs text-gray-400">-</span>}
                          {user.roles?.length > 2 && (
                            <span className="text-xs text-gray-500">+{user.roles.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default ManagerUsers;