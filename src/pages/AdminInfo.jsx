import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Settings, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

const AdminInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Informasi Akun Admin
            </h1>
            <p className="text-gray-600">Detail akun administrator sistem IM-Balmon</p>
          </div>

          {/* Admin Info Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            <div className="space-y-6">
              {/* Admin Contact */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Kontak Administrator
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-900">admin@imbalmon.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Telepon</p>
                      <p className="text-gray-900">+62 21 1234 5678</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Info */}
              <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-green-600" />
                  Informasi Kantor
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Alamat</p>
                    <p className="text-gray-900">
                      Jl. Sudirman No. 123, Jakarta Pusat<br />
                      DKI Jakarta 10110, Indonesia
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Jam Operasional</p>
                      <p className="text-gray-900">Senin - Jumat: 08:00 - 17:00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-purple-600" />
                  Informasi Sistem
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Versi Sistem</p>
                    <p className="text-gray-900">IM-Balmon v2.0.1</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status Server</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Terakhir Update</p>
                    <p className="text-gray-900">15 Januari 2024</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Pengguna</p>
                    <p className="text-gray-900">156 pengguna aktif</p>
                  </div>
                </div>
              </div>

              {/* Admin Access Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Catatan Penting</h3>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      <li>• Akun admin hanya dibuat oleh sistem administrator</li>
                      <li>• Untuk mendapatkan akses admin, hubungi kontak di atas</li>
                      <li>• Registrasi mandiri hanya untuk akun pengguna (pegawai)</li>
                      <li>• Verifikasi identitas diperlukan untuk akses admin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-white/80 backdrop-blur-lg hover:bg-white text-gray-700 font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Login</span>
            </button>
            
            <button
              onClick={() => navigate('/registrasi')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Daftar sebagai Pengguna</span>
            </button>
          </div>

          {/* Contact Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Butuh bantuan? Hubungi administrator di{' '}
              <a 
                href="mailto:admin@imbalmon.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                admin@imbalmon.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default AdminInfo;