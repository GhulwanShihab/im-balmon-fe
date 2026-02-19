import { useEffect, useState } from "react";
import { getPendingUsers, approveUser, rejectUser } from "./services/userService";
import toast from "react-hot-toast";
import { UserCheck, UserX, AlertCircle, Loader2, RefreshCw } from "lucide-react";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, page: 1 });

  const fetchPendingUsers = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const params = {
        page,
        page_size: 10,
      };
      const data = await getPendingUsers(params);
      setUsers(data.users || []);
      setMeta({
        total: data.total || 0,
        total_pages: data.total_pages || 1,
        page: data.page || 1,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Gagal memuat pengguna pending");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingUsers(false);
    setRefreshing(false);
    toast.success("Data berhasil diperbarui");
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui pengguna ini?")) return;
    try {
      await approveUser(id);
      toast.success("✅ Pengguna berhasil disetujui");
      fetchPendingUsers(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal menyetujui pengguna");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menolak pengguna ini? Data akan dihapus permanen."))
      return;
    try {
      await rejectUser(id);
      toast.success("❌ Pengguna berhasil ditolak");
      fetchPendingUsers(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal menolak pengguna");
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Memuat pengguna pending...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="text-orange-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Menunggu Persetujuan</h1>
                <p className="text-slate-500 mt-1">
                  {meta.total} pengguna menunggu approval admin
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
            >
              <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Info Card */}
        {users.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">⚠️</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Tindakan Diperlukan</h3>
                <p className="text-sm text-orange-800">
                  Tinjau dan setujui atau tolak registrasi pengguna baru. Pengguna yang ditolak akan
                  dihapus secara permanen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Pengguna</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">
                      Tanggal Registrasi
                    </th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-orange-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {u.nama?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{u.nama}</p>
                            <p className="text-xs text-slate-500 md:hidden truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 hidden md:table-cell">
                        <span className="truncate block max-w-xs">{u.email}</span>
                      </td>
                      <td className="p-4 text-slate-600 hidden lg:table-cell">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
                          >
                            <UserCheck size={16} />
                            <span className="hidden sm:inline">Setujui</span>
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
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
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Tidak Ada Pengguna Pending</h3>
              <p className="text-slate-500">Semua registrasi telah diproses</p>
            </div>
          )}

          {/* Pagination */}
          {users.length > 0 && meta.total_pages > 1 && (
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
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <div className="flex items-center px-4 py-2 border border-slate-300 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium">
                    {meta.page} / {meta.total_pages}
                  </span>
                </div>
                <button
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingUsers;