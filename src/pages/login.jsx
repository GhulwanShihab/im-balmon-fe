import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Smartphone, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TokenManager, setupAutoRefresh } from '../services/api'; // 🔥 Import utilities

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // 🔥 Add remember me
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Email atau password salah');

      // 🔥 Store remember me preference first
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('rememberMe', rememberMe.toString());

      // 🔥 Use TokenManager to store tokens with proper expiry
      const expiresIn = data.expires_in || 1800; // Default 30 minutes
      TokenManager.setTokens(data.access_token, data.refresh_token, expiresIn);

      // Ambil data user
      const meRes = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!meRes.ok) throw new Error('Gagal mengambil data user');
      const userData = await meRes.json();

      // 🟡 CEK STATUS USER SEBELUM LANJUT LOGIN
      if (!userData.is_active || !userData.is_verified) {
        toast.error('Akun Anda belum disetujui oleh admin. Silakan coba lagi nanti.');
        TokenManager.clearTokens();
        setLoading(false);
        return;
      }

      // Simpan data user
      storage.setItem('user', JSON.stringify(userData));

      // Ambil role user
      const roleRes = await fetch('http://localhost:8000/api/v1/users/me/roles', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const roleData = await roleRes.json();
      const roles = roleData.roles || [];
      storage.setItem('roles', JSON.stringify(roles));

      // 🔥 Setup auto-refresh after successful login
      setupAutoRefresh();

      // Redirect berdasarkan role
      const roleNames = roles.map((r) => r.name);
      if (roleNames.includes('admin')) {
        toast.success(`Selamat datang, ${userData.full_name || 'Admin'}!`);
        navigate('/admin', { replace: true });
      } else if (roleNames.includes('manager')) {
        // 🆕 Deteksi manager
        toast.success(`Selamat datang, ${userData.full_name || 'Manager'}!`);
        navigate('/manager', { replace: true });
      } else {
        toast.success(`Selamat datang, ${userData.full_name || 'User'}!`);
        navigate('/user', { replace: true });
      }

    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background animasi */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Selamat Datang
            </h1>
            <p className="text-gray-600">Masuk ke Sistem IM-Balmon</p>
          </div>

          {/* Form Login */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Alamat Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 🔥 Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              {/* Tombol Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Info keamanan */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Diamankan dengan enkripsi end-to-end</span>
            </div>
          </div>

          {/* Link Registrasi */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={() => navigate('/registrasi')}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Daftar Sekarang
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default LoginPage;