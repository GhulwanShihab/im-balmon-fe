import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email berhasil diverifikasi!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail || 
          'Link verifikasi tidak valid atau sudah kedaluwarsa.'
        );
      }
    };

    verifyEmail();
  }, [token]);

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
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            
            {/* Loading State */}
            {status === 'loading' && (
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Memverifikasi Email...</h2>
                <p className="text-gray-500">Mohon tunggu sebentar.</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Email Terverifikasi! ✅</h2>
                <p className="text-gray-600">{message}</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Langkah Selanjutnya</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Email Anda sudah diverifikasi. Admin akan mereview dan mengaktifkan akun Anda.
                        Anda akan bisa login setelah akun diapprove.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Ke Halaman Login</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Verifikasi Gagal</h2>
                <p className="text-gray-600">{message}</p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-left">
                  <div className="flex items-start space-x-3">
                    <RefreshCw className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Apa yang bisa dilakukan?</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Link verifikasi mungkin sudah kedaluwarsa (24 jam). 
                        Silakan minta link verifikasi baru melalui halaman login.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-all duration-300"
                  >
                    Ke Login
                  </button>
                  <button
                    onClick={() => navigate('/registrasi')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Daftar Ulang
                  </button>
                </div>
              </div>
            )}
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

export default VerifyEmail;
