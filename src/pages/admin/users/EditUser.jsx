import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, getUserWithRoles, updateUser, updateUserRole } from "./services/userService";
import UserFormWithRoles from "./components/UserFormWithRoles";
import toast from "react-hot-toast";
import { Edit3, ArrowLeft, Loader2 } from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user with roles
        const data = await getUserWithRoles(id);
        
        // Extract role IDs from roles
        const roleIds = data.roles ? data.roles.map(role => role.id) : [];
        
        // Set user data with role_ids
        setUser({
          ...data,
          role_ids: roleIds
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.detail || "Gagal memuat data pengguna");
        toast.error("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // Separate role_ids from user data
      const { role_ids, ...userData } = formData;
      
      // Remove password if empty (means user doesn't want to change it)
      if (!userData.password || userData.password.trim() === "") {
        delete userData.password;
      }

      // Update user basic info
      await updateUser(id, userData);
      
      // Update roles if provided
      if (role_ids && Array.isArray(role_ids)) {
        try {
          await updateUserRole(id, { role_ids });
        } catch (roleError) {
          console.error("Error updating roles:", roleError);
          toast.warning("Data pengguna diperbarui, tapi gagal update role");
        }
      }
      
      toast.success("✅ Pengguna berhasil diperbarui");
      
      // Wait a bit before navigating
      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (error) {
      console.error("Error updating user:", error);
      
      // Handle different error scenarios
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string" && detail.includes("Password validation failed")) {
          toast.error(detail.replace("Password validation failed: ", ""));
        } else {
          toast.error(detail || "Data tidak valid");
        }
      } else if (error.response?.status === 404) {
        toast.error("Pengguna tidak ditemukan");
      } else if (error.response?.status === 422) {
        // Validation error
        const errors = error.response?.data?.detail;
        if (Array.isArray(errors)) {
          errors.forEach((err) => {
            toast.error(`${err.loc?.[1] || "Field"}: ${err.msg}`);
          });
        } else {
          toast.error("Validasi gagal, periksa kembali data Anda");
        }
      } else if (error.response?.status === 403) {
        toast.error("Anda tidak memiliki akses untuk mengubah pengguna ini");
      } else {
        toast.error("Gagal memperbarui pengguna. Silakan coba lagi.");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Memuat data pengguna...</p>
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

  // No user found
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-3xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pengguna Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-6">Data pengguna yang Anda cari tidak tersedia</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Pengguna</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Edit3 className="text-yellow-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Edit Pengguna</h1>
              <p className="text-slate-500 mt-1">
                Ubah informasi untuk <span className="font-semibold text-slate-700">{user.nama}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-lg">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Tips Edit Pengguna</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Kosongkan field password jika tidak ingin mengubahnya</li>
                <li>• Pastikan email belum digunakan oleh pengguna lain</li>
                <li>• Perubahan status aktif akan segera diterapkan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <UserFormWithRoles initialData={user} onSubmit={handleSubmit} isEdit={true} />
      </div>
    </div>
  );
};

export default EditUser;