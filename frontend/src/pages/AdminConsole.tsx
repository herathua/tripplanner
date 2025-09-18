import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { adminService, AdminStats, SystemLog } from '../services/adminService';
import { userService, User, UserRole } from '../services/userService';
import { addNotification } from '../store/slices/uiSlice';
import { useAppDispatch } from '../store';

type AdminTab = 'dashboard' | 'users' | 'logs' | 'settings';

const AdminConsole: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, logsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllUsers(),
        adminService.getSystemLogs(50)
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load admin data',
        duration: 3000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      dispatch(addNotification({
        type: 'success',
        message: 'User role updated successfully',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update user role',
        duration: 3000,
      }));
    }
  };

  const handleStatusToggle = async (userId: number, active: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, active);
      setUsers(users.map(u => u.id === userId ? { ...u, active } : u));
      dispatch(addNotification({
        type: 'success',
        message: `User ${active ? 'activated' : 'deactivated'} successfully`,
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update user status',
        duration: 3000,
      }));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      dispatch(addNotification({
        type: 'success',
        message: 'User deleted successfully',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete user',
        duration: 3000,
      }));
    }
  };


  const tabs = [
    { id: 'dashboard' as AdminTab, name: 'Dashboard', icon: '📊' },
    { id: 'users' as AdminTab, name: 'User Management', icon: '👥' },
    { id: 'logs' as AdminTab, name: 'System Logs', icon: '📋' },
    { id: 'settings' as AdminTab, name: 'Settings', icon: '⚙️' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">✈️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalTrips || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Blog Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalBlogPosts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
          <div className="space-y-3">
            {stats?.userRoleDistribution && Object.entries(stats.userRoleDistribution).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">{role}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.level === 'ERROR' ? 'bg-red-500' : 
                  log.level === 'WARN' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-sm text-gray-600">{log.message}</span>
                <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.photoUrl ? (
                      <img className="h-10 w-10 rounded-full" src={user.photoUrl} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={user.role || 'USER'}
                    onChange={(e) => handleRoleChange(user.id!, e.target.value as UserRole)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                  
                  <button
                    onClick={() => handleStatusToggle(user.id!, !user.active)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUser(user.id!)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
        <button
          onClick={() => adminService.getSystemLogs(100).then(setLogs)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Load More
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li key={log.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    log.level === 'ERROR' ? 'bg-red-500' : 
                    log.level === 'WARN' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <p className="text-sm text-gray-500">
                      {log.action && `${log.action} • `}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' : 
                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {log.level}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
          <p className="text-sm text-gray-600 mb-4">
            Export user data for backup or analysis purposes. The exported file will contain user information in CSV format.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                dispatch(addNotification({
                  type: 'info',
                  message: 'Data export feature is temporarily disabled',
                  duration: 3000,
                }));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export User Data
            </button>
            <span className="text-sm text-gray-500">
              {users.length} users will be exported
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'logs':
        return renderLogs();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
        <p className="mt-2 text-gray-600">
          Manage users, monitor system activity, and configure settings
        </p>
      </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Admin Info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-medium text-white">👑</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminConsole;
