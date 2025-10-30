import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Smartphone, 
  QrCode, 
  RotateCcw, 
  FileText, 
  Menu, 
  X, 
  LogOut,
  User,
  Bell
} from 'lucide-react';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Beranda', path: '/user' },
    { icon: QrCode, label: 'Peminjaman', path: '/user/borrow' },
    { icon: RotateCcw, label: 'Pengembalian', path: '/user/return' },
    { icon: FileText, label: 'Laporan', path: '/user/reports' },
  ];

  const handleLogout = () => {
    // Clear all tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">IM-Balmon</span>
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-60 lg:hidden backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-gray-100 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-500 ease-out lg:translate-x-0 lg:fixed lg:inset-y-0`}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-11 h-11 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">IM-Balmon</span>
              <p className="text-xs text-green-100 font-medium">User Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-white hover:bg-opacity-20 text-white transition-all duration-200 transform hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 px-3">
            Dashboard Menu
          </div>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 relative transform hover:scale-[1.02] hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 text-green-800 shadow-lg shadow-green-100/50'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-3 rounded-xl transition-all duration-300 transform group-hover:rotate-3 ${
                  isActive 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:shadow-md'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex-1 transform transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-green-500 to-emerald-600 rounded-l-full shadow-lg animate-pulse"></div>
                )}
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-transparent group-hover:bg-gray-300'
                }`}></div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center space-x-4 mb-6 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 transform hover:rotate-3 transition-transform duration-300">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">User</p>
              <p className="text-xs text-gray-500 font-semibold">Peminjam Aktif</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full px-5 py-4 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all duration-300 group transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="p-3 rounded-xl bg-gray-200 group-hover:bg-red-100 transition-all duration-300 transform group-hover:rotate-3">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Desktop Header */}
        <div className="hidden lg:flex sticky top-0 z-30 items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;