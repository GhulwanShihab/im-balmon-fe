import { useState } from "react";
import UserFormWithRoles from "./components/UserFormWithRoles";
import { createUser, updateUserRole } from "./services/userService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";

const AddUser = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // Separate role_ids from user data
      const { role_ids, ...userData } = formData;
      
      // Create user first
      const newUser = await createUser(userData);
      
      // If user created successfully and has roles, assign roles
      const userIdToUse = newUser.uuid || newUser.id;
      if (newUser && userIdToUse && role_ids && role_ids.length > 0) {
        try {
          await updateUserRole(userIdToUse, { role_ids });
        } catch (roleError) {
          toast("Pengguna dibuat, tapi gagal assign role. Silakan edit role nanti.", { icon: "⚠️" });
        }
      }
      
      toast.success("✅ Pengguna berhasil dibuat");
      
      // Wait a bit before navigating to allow user to see the success message
      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (error) {
      
      // Handle different error scenarios
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail;
        if (detail === "Email already registered") {
          toast.error("Email sudah terdaftar");
        } else if (typeof detail === "string" && detail.includes("Password validation failed")) {
          toast.error(detail.replace("Password validation failed: ", ""));
        } else {
          toast.error(detail || "Data tidak valid");
        }
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
        toast.error("Anda tidak memiliki akses untuk menambah pengguna");
      } else {
        toast.error("Gagal menambahkan pengguna. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="p-3 bg-blue-100 rounded-xl">
              <UserPlus className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Tambah Pengguna Baru</h1>
              <p className="text-slate-500 mt-1">Buat akun pengguna baru untuk sistem</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">ℹ️</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Informasi Penting</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pengguna baru akan dibuat dengan status <strong>Tidak Aktif</strong> secara default</li>
                <li>• Admin perlu menyetujui pengguna baru sebelum mereka dapat login</li>
                <li>• Password harus memenuhi kriteria keamanan yang ditentukan</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <UserFormWithRoles onSubmit={handleSubmit} isEdit={false} />
      </div>
    </div>
  );
};

export default AddUser;