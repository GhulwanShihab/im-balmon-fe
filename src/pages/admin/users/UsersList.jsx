import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  getRoles,
  deleteUser,
  getUserStats,
  unlockUserAccount,
  getUserWithRoles,
} from "./services/userService";
import toast from "react-hot-toast";

const AdminUserManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ search: "", is_active: "", role_id: "" });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, page: 1 });
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    verified_users: 0,
    locked_users: 0,
    mfa_enabled_users: 0,
    pending_users: 0,
    new_users_today: 0,
    new_users_this_week: 0,
    new_users_this_month: 0,
  });

  // Tambahkan ref untuk mencegah multiple fetch
  const isFetchingRef = useRef(false);
  const isFetchingUsersRef = useRef(false);
  const isFetchingRolesRef = useRef(false);
  const mountedRef = useRef(true); // Set true immediately

  // Fetch all users dengan protection
  const fetchUsers = async (showLoader = true) => {
    // Prevent duplicate requests
    if (isFetchingUsersRef.current) return;
    isFetchingUsersRef.current = true;
    
    if (showLoader) setLoading(true);
    try {
      const params = {
        page,
        page_size: 10,
        sort_by: "created_at",
        sort_order: "desc",
      };

      if (filters.search) params.email = filters.search;
      if (filters.is_active !== "" && filters.is_active !== undefined) params.is_active = filters.is_active;
      if (filters.role_id) params.role_id = filters.role_id;

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );

      const data = await getUsers(cleanParams);

      if (mountedRef.current) {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setMeta({
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          page: data.page || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (mountedRef.current && error.response?.status !== 401) {
        toast.error(error.response?.data?.detail || "Gagal memuat data pengguna");
      }
    } finally {
      isFetchingUsersRef.current = false;
      if (showLoader && mountedRef.current) setLoading(false);
    }
  };

  // Fetch pending users dengan protection
  const fetchPendingUsers = async (showLoader = true) => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    if (showLoader) setLoading(true);
    
    try {
      const params = {
        page,
        page_size: 10,
      };

      const data = await getPendingUsers(params);
      
      if (mountedRef.current) {
        setPendingUsers(Array.isArray(data.users) ? data.users : []);
        setMeta({
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          page: data.page || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      
      if (error.response?.status !== 401 && mountedRef.current) {
        toast.error(error.response?.data?.detail || "Gagal memuat data pengguna pending");
      }
    } finally {
      isFetchingRef.current = false;
      if (showLoader && mountedRef.current) setLoading(false);
    }
  };

  // Fetch roles with protection
  const fetchRoles = async () => {
    // Prevent duplicate requests
    if (isFetchingRolesRef.current) return;
    isFetchingRolesRef.current = true;
    
    try {
      const data = await getRoles();
      if (mountedRef.current) {
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      isFetchingRolesRef.current = false;
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await getUserStats();

      if (mountedRef.current) {
        setStats({
          total_users: data.total_users || 0,
          active_users: data.active_users || 0,
          verified_users: data.verified_users || 0,
          locked_users: data.locked_users || 0,
          mfa_enabled_users: data.mfa_enabled_users || 0,
          pending_users: data.pending_users || 0,
          new_users_today: data.new_users_today || 0,
          new_users_this_week: data.new_users_this_week || 0,
          new_users_this_month: data.new_users_this_month || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Don't show error toast for stats, as it's not critical
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    if (activeTab === "all") {
      await fetchUsers(false);
    } else {
      await fetchPendingUsers(false);
    }
    if (mountedRef.current) {
      setRefreshing(false);
      toast.success("Data berhasil diperbarui");
    }
  };

  // Handle approve user
  const handleApprove = async (userId) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui pengguna ini?")) return;

    try {
      await approveUser(userId);
      toast.success("✅ Pengguna berhasil disetujui");
      await fetchPendingUsers(false);
      await fetchUsers(false);
      await fetchStats();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error(error.response?.data?.detail || "Gagal menyetujui pengguna");
    }
  };

  // Handle reject user
  const handleReject = async (userId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menolak pengguna ini? Data pengguna akan dihapus permanen."
      )
    )
      return;

    try {
      await rejectUser(userId);
      toast.success("❌ Pengguna berhasil ditolak");
      await fetchPendingUsers(false);
      await fetchStats();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error(error.response?.data?.detail || "Gagal menolak pengguna");
    }
  };

  // Handle role change
  //const handleRoleChange = async (userId, roleNames) => {
    //try {
      //// Convert role names to role IDs
      //const roleIds = roles.filter((role) => roleNames.includes(role.name)).map((role) => role.id);
//
      //await updateUserRole(userId, { role_ids: roleIds });
      //toast.success("✅ Role pengguna berhasil diperbarui");
      //await fetchUsers(false);
    //} catch (error) {
      //console.error("Error updating role:", error);
      //toast.error(error.response?.data?.detail || "Gagal memperbarui role");
    //}
  //};

  // Handle delete user
  const handleDelete = async (userId) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")
    )
      return;

    try {
      await deleteUser(userId);
      toast.success("🗑️ Pengguna berhasil dihapus");
      await fetchUsers(false);
      await fetchStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.detail || "Gagal menghapus pengguna");
    }
  };

  // Handle unlock user
  const handleUnlock = async (userId) => {
    if (!window.confirm("Apakah Anda yakin ingin membuka kunci akun pengguna ini?")) return;

    try {
      await unlockUserAccount(userId);
      toast.success("🔓 Akun pengguna berhasil dibuka");
      await fetchUsers(false);
      await fetchStats();
    } catch (error) {
      console.error("Error unlocking user:", error);
      toast.error(error.response?.data?.detail || "Gagal membuka kunci akun");
    }
  };

  // Setup mounted ref
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial load
  useEffect(() => {
    if (mountedRef.current) {
      fetchRoles();
      fetchStats();
    }
  }, []);

  // Load data when tab or page changes
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (activeTab === "all") {
      fetchUsers();
    } else {
      fetchPendingUsers();
    }
  }, [activeTab, page]);

  // Reset page and fetch when filters change
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (activeTab === "all") {
      setPage(1);
      // Gunakan timeout kecil untuk mencegah race condition
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          fetchUsers();
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search, filters.is_active, filters.role_id]);

  const pendingCount = stats.pending_users || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="text-blue-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
                <p className="text-slate-500 mt-1">Kelola pengguna dan approval</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <a
                href="/admin/users/add"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2 justify-center"
              >
                <UserCheck size={20} />
                <span className="hidden sm:inline">Tambah Pengguna</span>
              </a>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Pengguna" value={stats.total_users} icon={<Users />} color="blue" />
          <StatCard title="Aktif" value={stats.active_users} icon={<CheckCircle />} color="green" />
          <StatCard
            title="Menunggu Approval"
            value={pendingCount}
            icon={<AlertCircle />}
            color="orange"
          />
          <StatCard title="Terkunci" value={stats.locked_users} icon={<Lock />} color="red" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="hidden sm:inline">Semua Pengguna</span>
              <span className="sm:hidden">Semua</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pending");
                setPage(1);
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "pending"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="hidden sm:inline">Pending Approval</span>
              <span className="sm:hidden">Pending</span>
              {pendingCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          {activeTab === "all" && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.is_active}
                  onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
                <select
                  value={filters.role_id}
                  onChange={(e) => setFilters({ ...filters, role_id: e.target.value ? parseInt(e.target.value) : "" })}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <LoadingState />
            ) : activeTab === "all" ? (
              <UsersTable
                users={users}
                roles={roles}
                onDelete={handleDelete}
                onUnlock={handleUnlock}
              />
            ) : (
              <PendingUsersTable
                users={pendingUsers}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
          </div>

          {/* Pagination */}
          {!loading && (activeTab === "all" ? users : pendingUsers).length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Menampilkan <span className="font-medium">{(meta.page - 1) * 10 + 1}</span> -{" "}
                <span className="font-medium">{Math.min(meta.page * 10, meta.total)}</span> dari{" "}
                <span className="font-medium">{meta.total}</span> pengguna
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={20} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <div className="flex items-center px-4 py-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium">
                    {meta.page} / {meta.total_pages}
                  </span>
                </div>
                <button
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm text-slate-500 font-medium truncate">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 md:p-4 rounded-xl border-2 ${colors[color]} flex-shrink-0`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
    </div>
  );
};

// Users Table Component
const UsersTable = ({ users, roles, onRoleChange, onDelete, onUnlock }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleRoleEdit = (userId, currentRoles) => {
    setEditingRole(userId);
    setSelectedRoles(currentRoles || []);
  };

  const handleRoleSave = (userId) => {
    onRoleChange(userId, selectedRoles);
    setEditingRole(null);
  };

  const getUserRoles = (user) => {
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.map((r) => (typeof r === "string" ? r : r.name || ""));
    }
    return [];
  };

  if (users.length === 0) {
    return <EmptyState message="Tidak ada pengguna ditemukan" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Pengguna</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 hidden md:table-cell">
              Email
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Status</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">
              Role
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const userRoles = getUserRoles(user);
            return (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{user.username}</p>
                      {/*<p className="text-xs text-slate-500 md:hidden truncate">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
                      </p> */}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-600 hidden md:table-cell">
                  <span className="truncate block max-w-xs">{user.email}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
                        <CheckCircle size={12} />
                        <span className="hidden sm:inline">Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 w-fit">
                        <XCircle size={12} />
                        <span className="hidden sm:inline">Nonaktif</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 hidden lg:table-cell">
                  {user.role_names?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.role_names.map((roleName, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            roleName === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : roleName === 'manager'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {roleName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <a
                      href={`/admin/users/${user.id}`}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Lihat Detail"
                    >
                      <Eye size={18} className="text-slate-400 group-hover:text-blue-600" />
                    </a>
                    <a
                      href={`/admin/users/edit/${user.id}`}
                      className="p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
                      title="Edit"
                    >
                      <Edit2 size={18} className="text-slate-400 group-hover:text-yellow-600" />
                    </a>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Hapus"
                    >
                      <Trash2 size={18} className="text-slate-400 group-hover:text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Pending Users Table Component
const PendingUsersTable = ({ users, onApprove, onReject }) => {
  if (users.length === 0) {
    return <EmptyState message="Tidak ada user yang menunggu approval" icon={<UserCheck size={48} />} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Pengguna</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 hidden md:table-cell">
              Email
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">
              Tanggal Daftar
            </th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100 hover:bg-orange-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 md:hidden truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                      <AlertCircle size={12} />
                      Pending
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-slate-600 hidden md:table-cell">
                <span className="truncate block max-w-xs">{user.email}</span>
              </td>
              <td className="py-4 px-4 text-slate-600 hidden lg:table-cell">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => onApprove(user.id)}
                    className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <UserCheck size={16} />
                    <span className="hidden sm:inline">Setujui</span>
                  </button>
                  <button
                    onClick={() => onReject(user.id)}
                    className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <UserX size={16} />
                    <span className="hidden sm:inline">Tolak</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="inline-block w-12 h-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-slate-600">Memuat data pengguna...</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-slate-300 mb-4">{icon || <Users size={48} />}</div>
    <p className="text-slate-500 text-lg">{message}</p>
  </div>
);

export default AdminUserManagement;