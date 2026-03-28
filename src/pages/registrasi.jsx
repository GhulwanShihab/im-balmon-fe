import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Lock, UserPlus, ArrowRight, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

const Registrasi = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nip: '',
    jabatan: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    return formData.nama && formData.email;
  };

  const validateStep2 = () => {
    return formData.password.length >= 8 && 
           formData.password === formData.confirmPassword;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) {
      toast.error('Pastikan password minimal 8 karakter dan cocok');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        nama: formData.nama,
        nip: formData.nip || null,
        jabatan: formData.jabatan || null,
      });

      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
      toast.success('Registrasi berhasil! Cek email Anda.');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registrasi gagal';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email: registeredEmail });
      toast.success('Link verifikasi telah dikirim ulang!');
    } catch (error) {
      toast.error('Gagal mengirim ulang email verifikasi.');
    } finally {
      setResending(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 8) return { strength: 1, text: 'Terlalu Pendek', color: 'text-red-500' };
    if (password.length >= 8) return { strength: 3, text: 'Valid', color: 'text-green-500' };
    return { strength: 2, text: 'Sedang', color: 'text-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
          <div className="absolute top-60 left-20 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 right-40 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Mail className="w-10 h-10 text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">Cek Email Anda! 📧</h2>
              
              <p className="text-gray-600">
                Kami telah mengirim link verifikasi ke:
              </p>
              <p className="font-semibold text-emerald-700 bg-emerald-50 py-2 px-4 rounded-xl">
                {registeredEmail}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
                <p className="text-sm font-medium text-blue-800 mb-2">Langkah selanjutnya:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Buka email dan klik link verifikasi</li>
                  <li>Tunggu persetujuan admin</li>
                  <li>Login setelah akun diapprove</li>
                </ol>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {resending ? (
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{resending ? 'Mengirim...' : 'Kirim Ulang'}</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Ke Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute top-60 left-20 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Daftar IM-Balmon
            </h1>
            <p className="text-gray-600">Buat akun pengguna baru</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                step >= 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-16 h-1 rounded transition-all duration-300 ${
                step >= 2 ? 'bg-emerald-500' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                step >= 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Info Personal</span>
              <span>Keamanan</span>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nama Lengkap
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Masukkan email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* NIP (Opsional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      NIP <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        placeholder="Masukkan NIP (jika ada)"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Jabatan (Opsional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Jabatan <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="jabatan"
                        value={formData.jabatan}
                        onChange={handleInputChange}
                        placeholder="Masukkan jabatan (jika ada)"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!validateStep1()}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Buat password (minimal 8 karakter)"
                        required
                        minLength={8}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Kekuatan password</span>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                              passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                              passwordStrength.strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Konfirmasi password"
                        required
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 text-gray-900 placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="flex items-center space-x-2 mt-2">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500">Password cocok</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-red-500"></div>
                            <span className="text-xs text-red-500">Password tidak cocok</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-all duration-300"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !validateStep2()}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Membuat...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Buat Akun</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Data Anda dilindungi dengan enkripsi</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors hover:underline"
              >
                Masuk
              </button>
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Registrasi;