import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { TokenManager, setupAutoRefresh } from './services/api'; // 🔥 Import new utilities
import API_CONFIG from './config/api'; // 🔥 Import API config

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import ManagerLayout from './layouts/ManagerLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Devices from './pages/admin/devices/Devices';
import AddDevice from './pages/admin/devices/AddDevice';
import EditDevice from './pages/admin/devices/EditDevice';
import ViewDevice from './pages/admin/devices/ViewDevice';
import AddDeviceChild from './pages/admin/devices/AddDeviceChild';
import EditDeviceChild from './pages/admin/devices/EditDeviceChild';
import ViewDeviceChild from './pages/admin/devices/ViewDeviceChild';
import UsageReports from './pages/admin/UsageReports';
import ViewLoanDetail from './pages/admin/ViewLoanDetail';
import ReturnReports from './pages/admin/ReturnReports';
import ConditionChangeRequests from './pages/admin/ConditionChangeRequests';
import Statistics from './pages/admin/Statistics';
import UsersList from "./pages/admin/users/UsersList";
import AddUser from "./pages/admin/users/AddUser";
import EditUser from "./pages/admin/users/EditUser";
import UserDetail from "./pages/admin/users/UserDetail";
import PendingUsers from './pages/admin/users/PendingUser';
import Employees from './pages/admin/employees/Employees';
import AddEmployee from './pages/admin/employees/AddEmployee';
import EditEmployee from './pages/admin/employees/EditEmployee';
import ViewEmployee from './pages/admin/employees/ViewEmployee';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerDevices from './pages/manager/Devices';
import ViewDeviceManager from './pages/manager/ViewDeviceManager';
import ViewDeviceChildManager from './pages/manager/ViewDeviceChildManager';
import ManagerUsageReports from './pages/manager/UsageReports';
import ViewLoanDetailManager from './pages/manager/ViewLoanDetailManager';
import ManagerConditionApprovals from './pages/manager/ConditionApprovals';
import ManagerStatistics from './pages/manager/Statistics';
import ManagerUsers from './pages/manager/Users';
import ManagerUserApprovals from './pages/manager/UserApprovals';
import ManagerEmployees from './pages/manager/Employees';
import ManagerViewEmployee from './pages/manager/ViewEmployee';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import BorrowPage from './pages/user/Borrow';
import DeviceGroupsPage from './pages/user/DeviceGroup';
import BorrowGroupPage from './pages/user/BorrowGroup';
import ReturnPage from './pages/user/Return';
import ReportsPage from './pages/user/Reports';

// Existing Pages
import Login from './pages/login';
//import HomeAdmin from './pages/HomeAdmin';
//import HomeUser from './pages/HomeUser';
//import PenggunaanPerangkat from './pages/penggunaanperangkat';
//import PerangkatScan from './pages/perangkatscan';
import Registrasi from './pages/registrasi';
//import RiwayatPerangkat from './pages/riwayatperangkat';
//import AdminInfo from './pages/AdminInfo';

// Configure axios defaults - using API_CONFIG (reads from env variable)
axios.defaults.baseURL = API_CONFIG.BASE_URL;

// Protected Route Component with auto-refresh
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const token = TokenManager.getAccessToken(); // 🔥 Use TokenManager

  React.useEffect(() => {
    // 🔥 Setup auto-refresh when component mounts
    if (token) {
      setupAutoRefresh();
    }

    // Cleanup interval on unmount
    return () => {
      if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
      }
    };
  }, [token]);

  React.useEffect(() => {
    const verifyToken = async () => {
      if (!token || TokenManager.isTokenExpired()) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Token invalid, clear storage
        TokenManager.clearTokens();
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component with auto-refresh
const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(null);
  const token = TokenManager.getAccessToken(); // 🔥 Use TokenManager

  React.useEffect(() => {
    // 🔥 Setup auto-refresh when component mounts
    if (token) {
      setupAutoRefresh();
    }

    // Cleanup interval on unmount
    return () => {
      if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
      }
    };
  }, [token]);

  React.useEffect(() => {
    const verifyAdminToken = async () => {
      if (!token || TokenManager.isTokenExpired()) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const userResponse = await axios.get('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (userResponse.status === 200) {
          setIsAuthenticated(true);
          
          // Check user roles
          const rolesResponse = await axios.get('/api/v1/users/me/roles', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          const rolesData = rolesResponse.data;
          const userRoles = rolesData.roles || [];
          
          // Check if user has admin or pimpinan role
          const hasAdminAccess = userRoles.some(role => 
            role.name === 'admin' || role.name === 'pimpinan'
          );
          
          setIsAdmin(hasAdminAccess);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Token invalid, clear storage
        TokenManager.clearTokens();
        setIsAuthenticated(false);
      }
    };

    verifyAdminToken();
  }, [token]);

  if (isAuthenticated === null || (isAuthenticated && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Manager Route Component with auto-refresh
const ManagerRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [isManager, setIsManager] = React.useState(null);
  const token = TokenManager.getAccessToken(); // 🔥 Use TokenManager

  React.useEffect(() => {
    // 🔥 Setup auto-refresh when component mounts
    if (token) {
      setupAutoRefresh();
    }

    // Cleanup interval on unmount
    return () => {
      if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
      }
    };
  }, [token]);

  React.useEffect(() => {
    const verifyManagerToken = async () => {
      if (!token || TokenManager.isTokenExpired()) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const userResponse = await axios.get('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (userResponse.status === 200) {
          setIsAuthenticated(true);
          
          // Check user roles
          const rolesResponse = await axios.get('/api/v1/users/me/roles', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          const rolesData = rolesResponse.data;
          const userRoles = rolesData.roles || [];
          
          // Check if user has manager role
          const hasManagerAccess = userRoles.some(role => 
            role.name === 'manager' || role.name === 'pimpinan' || role.name === 'admin'
          );
          
          setIsManager(hasManagerAccess);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Token invalid, clear storage
        TokenManager.clearTokens();
        setIsAuthenticated(false);
      }
    };

    verifyManagerToken();
  }, [token]);

  if (isAuthenticated === null || (isAuthenticated && isManager === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isManager) {
    return <Navigate to="/user" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registrasi />} />
          <Route path="/registrasi" element={<Registrasi />} />
          {/*<Route path="/admin-info" element={<AdminInfo />} />*/}
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/add" element={<AddDevice />} />
            <Route path="devices/:id/edit" element={<EditDevice />} />
            <Route path="devices/:id/view" element={<ViewDevice />} />
            <Route path="devices/add-child" element={<AddDeviceChild />} />
            <Route path="devices/:id/edit-child" element={<EditDeviceChild />} />
            <Route path="devices/:id/view-child" element={<ViewDeviceChild />} />
            <Route path="loans/:id" element={<ViewLoanDetail />} />
            <Route path="usage-reports" element={<UsageReports />} />
            <Route path="condition-request" element={<ConditionChangeRequests />} />
            <Route path="return-reports" element={<ReturnReports />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="users/pending" element={<PendingUsers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employees/:id/edit" element={<EditEmployee />} />
            <Route path="employees/:id/view" element={<ViewEmployee />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={
            <ManagerRoute>
              <ManagerLayout />
            </ManagerRoute>
          }>
            <Route index element={<ManagerDashboard />} />
            <Route path="devices" element={<ManagerDevices />} />
            <Route path="devices/:id/view" element={<ViewDeviceManager />} />
            <Route path="devices/:id/view-child" element={<ViewDeviceChildManager />} />
            <Route path="usage-reports" element={<ManagerUsageReports />} />
            <Route path="loans/:id" element={<ViewLoanDetailManager />} />
            <Route path="condition-approvals" element={<ManagerConditionApprovals />} />
            <Route path="statistics" element={<ManagerStatistics />} />
            <Route path="users" element={<ManagerUsers />} />
            <Route path="user-approvals" element={<ManagerUserApprovals />} />
            <Route path="employees" element={<ManagerEmployees />} />
            <Route path="employees/:id/view" element={<ManagerViewEmployee />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="borrow" element={<BorrowPage />} />
            <Route path="device-group" element={<DeviceGroupsPage />} />
            <Route path="borrow-group" element={<BorrowGroupPage />} />
            <Route path="return" element={<ReturnPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Existing Protected Routes 
          <Route path="/homeadmin" element={
            <ProtectedRoute>
              <HomeAdmin />
            </ProtectedRoute>
          } />
          <Route path="/homeuser" element={
            <ProtectedRoute>
              <HomeUser />
            </ProtectedRoute>
          } />
          <Route path="/PenggunaanPerangkat" element={
            <ProtectedRoute>
              <PenggunaanPerangkat />
            </ProtectedRoute>
          } />
          <Route path="/perangkatscan" element={
            <ProtectedRoute>
              <PerangkatScan />
            </ProtectedRoute>
          } />
          <Route path="/RiwayatPerangkat" element={
            <ProtectedRoute>
              <RiwayatPerangkat />
            </ProtectedRoute>
          } /> */}

          {/* Default redirect - always go to login for security */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;