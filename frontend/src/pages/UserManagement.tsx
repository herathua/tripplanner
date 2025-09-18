import React, { useState } from 'react';
import { useAppSelector } from '../store';
import ProfileSettings from '../components/user/ProfileSettings';
import UserTrips from '../components/user/UserTrips';
import UserGuides from '../components/user/UserGuides';
import { useUserProfile } from '../hooks/useUserProfile';

type UserManagementTab = 'profile' | 'trips' | 'guides';

const UserManagement: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<UserManagementTab>('profile');
  const { profile } = useUserProfile(user);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your user management dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as UserManagementTab, name: 'Profile Settings', icon: '👤' },
    { id: 'trips' as UserManagementTab, name: 'My Trips', icon: '✈️' },
    { id: 'guides' as UserManagementTab, name: 'My Guides', icon: '📖' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} />;
      case 'trips':
        return <UserTrips user={user} />;
      case 'guides':
        return <UserGuides user={user} />;
      default:
        return <ProfileSettings user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile, trips, guides, and blog posts
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.displayName || 'User'}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {profile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile?.displayName || user?.displayName || 'User'}
                </h3>
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
            <div className="bg-white rounded-lg shadow-sm">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
