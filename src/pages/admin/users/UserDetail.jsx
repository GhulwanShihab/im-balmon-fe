import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserById, getUserWithRoles, getUserAccountStatus } from "./services/userService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Lock,
  Unlock,
  Clock,
  Activity,
  Edit3,
  Loader2,
} from "lucide-react";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userWithRoles, setUserWithRoles] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all user data in parallel
        const [userData, rolesData, statusData] = await Promise.all([
          getUserById(id),
          getUserWithRoles(id),
          getUserAccountStatus(id),
        ]);

        setUser(userData);
        setUserWithRoles(rolesData);
        setAccountStatus(statusData);
      } catch (err) {
        console.error("Error fetching user detail:", err);
        setError(err.response?.data?.detail || "Gagal memuat detail pengguna");
        toast.error("Gagal memuat detail pengguna");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Memuat detail pengguna...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Pengguna
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Pengguna</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{user.username}</h1>
                  <p className="text-slate-500 mt-1">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={14} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle size={14} />
                        Nonaktif
                      </span>
                    )}
                    
                    {user.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <CheckCircle size={14} />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock size={14} />
                        Belum Diverifikasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={`/admin/users/edit/${id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                <Edit3 size={20} />
                Edit Pengguna
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={24} className="text-blue-600" />
              Informasi Dasar
            </h2>
            <div className="space-y-4">
              <InfoRow icon={<User size={18} />} label="Username" value={user.username} />
              <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
              {/*<InfoRow
                icon={<Calendar size={18} />}
                label="Tanggal Dibuat"
                value={new Date(user.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />*/}
              {user.last_login && (
                <InfoRow
                  icon={<Activity size={18} />}
                  label="Login Terakhir"
                  value={new Date(user.last_login).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={24} className="text-purple-600" />
              Role & Permissions
            </h2>
            <div className="space-y-3">
              {userWithRoles?.roles && userWithRoles.roles.length > 0 ? (
                userWithRoles.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                  >
                    <Shield size={20} className="text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">{role.name}</p>
                      {role.description && (
                        <p className="text-sm text-purple-700">{role.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Shield size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada role yang ditetapkan</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Status 
          {accountStatus && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lock size={24} className="text-orange-600" />
                Status Keamanan Akun
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                  icon={accountStatus.is_locked ? <Lock /> : <Unlock />}
                  label="Status Akun"
                  value={accountStatus.is_locked ? "Terkunci" : "Normal"}
                  color={accountStatus.is_locked ? "red" : "green"}
                />
                <StatusCard
                  icon={<Activity />}
                  label="Percobaan Login Gagal"
                  value={accountStatus.failed_login_attempts}
                  color={accountStatus.failed_login_attempts > 0 ? "yellow" : "green"}
                />
                <StatusCard
                  icon={<Shield />}
                  label="MFA"
                  value={accountStatus.mfa_enabled ? "Aktif" : "Nonaktif"}
                  color={accountStatus.mfa_enabled ? "green" : "slate"}
                />
                <StatusCard
                  icon={<CheckCircle />}
                  label="Verifikasi"
                  value={accountStatus.is_verified ? "Terverifikasi" : "Belum"}
                  color={accountStatus.is_verified ? "green" : "yellow"}
                />
              </div>

              {accountStatus.locked_until && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    <Lock size={16} className="inline mr-2" />
                    Akun terkunci hingga:{" "}
                    {new Date(accountStatus.locked_until).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )} 
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-slate-800 font-semibold break-words">{value || "-"}</p>
    </div>
  </div>
);

const StatusCard = ({ icon, label, value, color }) => {
  const colors = {
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {React.cloneElement(icon, { size: 20 })}
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default UserDetail;