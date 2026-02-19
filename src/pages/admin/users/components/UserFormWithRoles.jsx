import React, { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { getRoles } from "../services/userService";
import toast from "react-hot-toast";

const UserFormWithRoles = ({ onSubmit, initialData = {}, isEdit = false }) => {
  const [form, setForm] = useState({
    nama: initialData.nama || "",
    email: initialData.email || "",
    password: "",
    is_active: initialData.is_active ?? true,
    role_ids: initialData.role_ids || [],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch roles - HANYA SEKALI
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const data = await getRoles();
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Gagal memuat daftar role");
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Update form hanya untuk role_ids saat edit dan roles sudah dimuat
  useEffect(() => {
    if (isEdit && initialData && initialData.roles && roles.length > 0) {
      const roleIds = initialData.roles.map((role) => 
        typeof role === 'object' ? role.id : role
      );
      setForm((prev) => ({ ...prev, role_ids: roleIds }));
    }
  }, [roles]);

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!form.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    } else if (form.nama.length < 3) {
      newErrors.nama = "Nama minimal 3 karakter";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password validation - HANYA CEK TIDAK KOSONG
    if (!isEdit && !form.password) {
      newErrors.password = "Password wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleRoleChange = (roleId) => {
    const roleIdNum = parseInt(roleId);
    setForm((prev) => {
      const currentRoles = prev.role_ids || [];
      const isSelected = currentRoles.includes(roleIdNum);
      return {
        ...prev,
        role_ids: isSelected
          ? currentRoles.filter((id) => id !== roleIdNum)
          : [...currentRoles, roleIdNum],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali form Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = { ...form };
      if (isEdit && !form.password) {
        delete dataToSend.password;
      }
      await onSubmit(dataToSend);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Nama Lengkap */}
      <div>
        <label className="block mb-2 font-medium text-slate-700">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => handleInputChange('nama', e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Masukkan nama lengkap"
          autoComplete="name"
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${
            errors.nama ? "border-red-500 bg-red-50" : "border-slate-300"
          }`}
        />
        {errors.nama && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <AlertCircle size={14} />
            <span>{errors.nama}</span>
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 font-medium text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="user@example.com"
          autoComplete="email"
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${
            errors.email ? "border-red-500 bg-red-50" : "border-slate-300"
          }`}
        />
        {errors.email && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <AlertCircle size={14} />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      {/* Password - TANPA VALIDASI RUMIT */}
      <div>
        <label className="block mb-2 font-medium text-slate-700">
          Password {!isEdit && <span className="text-red-500">*</span>}
          {isEdit && (
            <span className="text-slate-500 text-sm font-normal">
              {" "}(kosongkan jika tidak ingin mengubah)
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required={!isEdit}
            disabled={isSubmitting}
            placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
            autoComplete="new-password"
            className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${
              errors.password ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {errors.password && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={14} />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      {/* Roles Selection */}
      <div>
        <label className="block mb-2 font-medium text-slate-700 flex items-center gap-2">
          <Shield size={18} className="text-purple-600" />
          Role Pengguna
        </label>
        
        {loadingRoles ? (
          <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            Memuat daftar role...
          </div>
        ) : roles.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            Tidak ada role tersedia. Hubungi administrator.
          </div>
        ) : (
          <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all cursor-pointer ${
                  form.role_ids.includes(role.id)
                    ? "border-purple-400 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.role_ids.includes(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                  disabled={isSubmitting}
                  className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-purple-600" />
                    <span className="font-medium text-slate-800">{role.name}</span>
                  </div>
                  {role.description && (
                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
        
        {form.role_ids.length === 0 && (
          <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
            <AlertCircle size={14} />
            Pilih minimal satu role untuk pengguna
          </p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          disabled={isSubmitting}
          className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
        <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
          <span>Status Aktif</span>
          {form.is_active ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Aktif</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">Nonaktif</span>
          )}
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>{isEdit ? "Update Pengguna" : "Tambah Pengguna"}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 focus:ring-4 focus:ring-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default UserFormWithRoles;