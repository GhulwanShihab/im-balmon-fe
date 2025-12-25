import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Smartphone, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient, { TokenManager } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Already processing, ignoring duplicate submit');
      return;
    }
    
    setLoading(true);
    
    console.log('%c🔵 ========== LOGIN STARTED ==========', 'color: blue; font-weight: bold; font-size: 14px');
    console.log('🔵 Step 1: Form data:', { email: formData.email, password: '***' });
    console.log('🔵 Remember me:', rememberMe);

    try {
      // Step 2: Login API call
      console.log('🔵 Step 2: Calling /auth/login...');
      console.log('🔵 Request URL:', `${apiClient.defaults.baseURL}/auth/login`);
      
      const loginResponse = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Step 2: Login successful!', loginResponse.data);
      
      const { access_token, refresh_token, expires_in } = loginResponse.data;
      
      if (!access_token) {
        throw new Error('❌ No access token in response!');
      }

      // Step 3: Store rememberMe preference FIRST
      console.log('🔵 Step 3: Storing rememberMe preference...');
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        console.log('✅ Using localStorage (rememberMe = true)');
      } else {
        sessionStorage.setItem('rememberMe', 'false');
        console.log('✅ Using sessionStorage (rememberMe = false)');
      }

      // Step 4: Store tokens
      console.log('🔵 Step 4: Storing tokens...');
      const expiresInSeconds = expires_in || 1800;
      TokenManager.setTokens(access_token, refresh_token, expiresInSeconds);
      console.log('✅ Step 4: Tokens stored');
      
      // Verify tokens
      const storedToken = TokenManager.getAccessToken();
      console.log('Verification - Token stored:', storedToken ? '✅ YES' : '❌ NO');

      // Step 5: Get user data
      console.log('🔵 Step 5: Fetching user data...');
      const userResponse = await apiClient.get('/users/me');
      const userData = userResponse.data;
      console.log('✅ Step 5: User data:', userData);

      // Step 6: Validate user status
      console.log('🔵 Step 6: Validating user...');
      
      if (!userData.is_active) {
        console.log('❌ User is NOT ACTIVE');
        toast.error('Akun Anda tidak aktif. Hubungi administrator.');
        TokenManager.clearTokens();
        setLoading(false);
        return;
      }

      if (!userData.is_verified) {
        console.log('❌ User is NOT VERIFIED');
        toast.error('Akun Anda belum disetujui oleh admin. Silakan tunggu persetujuan.');
        TokenManager.clearTokens();
        setLoading(false);
        return;
      }
      
      console.log('✅ Step 6: User OK (active & verified)');

      // Step 7: Get roles
      console.log('🔵 Step 7: Fetching roles...');
      const rolesResponse = await apiClient.get('/users/me/roles');
      const roles = rolesResponse.data.roles || [];
      console.log('✅ Step 7: Roles:', roles);

      // Step 8: Store user data and roles
      console.log('🔵 Step 8: Storing user data and roles...');
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('user', JSON.stringify(userData));
      storage.setItem('roles', JSON.stringify(roles));
      console.log('✅ Step 8: Data stored in', rememberMe ? 'localStorage' : 'sessionStorage');

      // Step 9: Determine redirect
      console.log('🔵 Step 9: Determining redirect...');
      const roleNames = roles.map((r) => r.name);
      console.log('Role names:', roleNames);
      
      const userName = userData.full_name || userData.username || 'User';
      let redirectPath = '/user'; // Default
      
      if (roleNames.includes('admin') || roleNames.includes('pimpinan')) {
        redirectPath = '/admin';
        console.log('✅ Redirect to: /admin (Admin/Pimpinan)');
      } else if (roleNames.includes('manager')) {
        redirectPath = '/manager';
        console.log('✅ Redirect to: /manager (Manager)');
      } else {
        redirectPath = '/user';
        console.log('✅ Redirect to: /user (User)');
      }

      // Show success toast
      toast.success(`Selamat datang, ${userName}!`, {
        icon: roleNames.includes('admin') ? '👨‍💼' : roleNames.includes('manager') ? '👔' : '👋',
        duration: 2000,
      });

      console.log('🔵 Step 10: Redirecting...');
      console.log('Target path:', redirectPath);
      
      // Wait a moment for toast to show
      setTimeout(() => {
        console.log('🔵 Executing redirect NOW');
        window.location.href = redirectPath;
      }, 300);

      console.log('%c✅ ========== LOGIN COMPLETED ==========', 'color: green; font-weight: bold; font-size: 14px');

    } catch (err) {
      console.error('%c❌ ========== LOGIN ERROR ==========', 'color: red; font-weight: bold; font-size: 14px');
      console.error('❌ Error:', err);
      
      if (err.response) {
        console.error('❌ Status:', err.response.status);
        console.error('❌ Data:', err.response.data);
        console.error('❌ Headers:', err.response.headers);
      } else if (err.request) {
        console.error('❌ No response from server');
        console.error('❌ Request:', err.request);
      } else {
        console.error('❌ Error message:', err.message);
      }

      let errorMessage = 'Terjadi kesalahan saat login';

      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail;

        switch (status) {
          case 400:
            errorMessage = 'Email atau password salah';
            break;
          case 401:
            errorMessage = detail || 'Email atau password salah';
            break;
          case 403:
            errorMessage = 'Akses ditolak';
            break;
          case 422:
            errorMessage = 'Data tidak valid';
            break;
          case 500:
            errorMessage = 'Server error';
            break;
          default:
            errorMessage = detail || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }

      toast.error(errorMessage, { duration: 4000 });
      TokenManager.clearTokens();
      setLoading(false);
      
    } finally {
      console.log('%c========================================', 'color: gray');
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
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Alamat Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@example.com"
                    required
                    autoComplete="username"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
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
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me 
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Ingat saya
                </label>
              </div> */}

              {/* Tombol Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
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
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
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