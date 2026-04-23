import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const UserForm = ({ onSubmit, initialData = {}, isEdit = false }) => {
  const [form, setForm] = useState({
    username: initialData.username || "",
    email: initialData.email || "",
    password: "",
    is_active: initialData.is_active ?? true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!form.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (form.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = "Username hanya boleh huruf, angka, dan underscore";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password validation (only for create, or if password is filled in edit)
    if (!isEdit || form.password) {
      if (!form.password) {
        newErrors.password = "Password wajib diisi";
      } else {
        const passwordErrors = validatePassword(form.password);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors[0];
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password minimal 8 karakter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password harus mengandung huruf besar");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password harus mengandung huruf kecil");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password harus mengandung angka");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password harus mengandung karakter khusus");
    }

    return errors;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return null;

    let strength = 0;
    const checks = [
      password.length >= 8,
      password.length >= 12,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 16,
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2) return { level: "weak", color: "red", text: "Lemah" };
    if (strength <= 4) return { level: "medium", color: "yellow", text: "Sedang" };
    if (strength <= 6) return { level: "strong", color: "green", text: "Kuat" };
    return { level: "very-strong", color: "emerald", text: "Sangat Kuat" };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setForm({ ...form, [name]: newValue });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    // Update password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data to send
      const dataToSend = { ...form };
      
      // If editing and password is empty, remove it from the data
      if (isEdit && !form.password) {
        delete dataToSend.password;
      }

      await onSubmit(dataToSend);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = "text", required = false, ...props }) => (
    <div>
      <label className="block mb-2 font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          errors[name] ? "border-red-500 bg-red-50" : "border-slate-300"
        }`}
        {...props}
      />
      {errors[name] && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {/* Username */}
      <InputField
        label="Username"
        name="username"
        required
        placeholder="Masukkan username"
        autoComplete="username"
      />

      {/* Email */}
      <InputField
        label="Email"
        name="email"
        type="email"
        required
        placeholder="user@example.com"
        autoComplete="email"
      />

      {/* Password */}
      <div>
        <label className="block mb-2 font-medium text-slate-700">
          Password {!isEdit && <span className="text-red-500">*</span>}
          {isEdit && <span className="text-slate-500 text-sm font-normal"> (kosongkan jika tidak ingin mengubah)</span>}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
            placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 8 karakter"}
            autoComplete="new-password"
            className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.password ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {form.password && passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Kekuatan Password:</span>
              <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                style={{
                  width:
                    passwordStrength.level === "weak"
                      ? "25%"
                      : passwordStrength.level === "medium"
                      ? "50%"
                      : passwordStrength.level === "strong"
                      ? "75%"
                      : "100%",
                }}
              />
            </div>
          </div>
        )}

        {errors.password && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertCircle size={14} />
            <span>{errors.password}</span>
          </div>
        )}

        {/* Password Requirements */}
        {form.password && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-600 mb-2">Password harus mengandung:</p>
            <div className="space-y-1">
              <PasswordRequirement met={form.password.length >= 8} text="Minimal 8 karakter" />
              <PasswordRequirement met={/[A-Z]/.test(form.password)} text="Huruf besar (A-Z)" />
              <PasswordRequirement met={/[a-z]/.test(form.password)} text="Huruf kecil (a-z)" />
              <PasswordRequirement met={/[0-9]/.test(form.password)} text="Angka (0-9)" />
              <PasswordRequirement
                met={/[!@#$%^&*(),.?":{}|<>]/.test(form.password)}
                text="Karakter khusus (!@#$%...)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={form.is_active}
          onChange={handleChange}
          className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
          <span>Status Aktif</span>
          {form.is_active ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Aktif</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Nonaktif</span>
          )}
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

// Helper component for password requirements
const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle size={14} className="text-green-600" />
    ) : (
      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
    )}
    <span className={met ? "text-green-600 font-medium" : "text-slate-500"}>{text}</span>
  </div>
);

export default UserForm;