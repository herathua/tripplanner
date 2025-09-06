import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import { updateUserProfile } from '../store/slices/authSlice';
import { userSettingsService, UserTravelGuide, UserFavoriteBlog, UserBlogPost } from '../services/userSettingsService';
import { 
  User, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  BookOpen,
  Heart,
  FileText,
  Settings,
  Trash2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface UserSettingsForm {
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserSettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'travel-guides' | 'favorite-blogs' | 'my-blogs'>('profile');

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/user/travel-guides')) {
      setActiveTab('travel-guides');
    } else if (path.includes('/user/my-blogs')) {
      setActiveTab('my-blogs');
    } else if (path.includes('/user/favorite-blogs')) {
      setActiveTab('favorite-blogs');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [travelGuides, setTravelGuides] = useState<UserTravelGuide[]>([]);
  const [favoriteBlogs, setFavoriteBlogs] = useState<UserFavoriteBlog[]>([]);
  const [userBlogs, setUserBlogs] = useState<UserBlogPost[]>([]);
  const [formData, setFormData] = useState<UserSettingsForm>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a valid image file',
        duration: 3000,
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(addNotification({
        type: 'error',
        message: 'Image size must be less than 5MB',
        duration: 3000,
      }));
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting photo upload process...');
      
      const result = await userSettingsService.uploadProfilePhoto(file);
      console.log('Upload result:', result);
      
      // Update user state with new photo URL
      dispatch(updateUserProfile({ photoURL: result.photoUrl }));
      console.log('User state updated with new photo URL');
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile photo updated successfully',
        duration: 3000,
      }));
    } catch (error) {
      console.error('Photo upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile photo';
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        message: 'New passwords do not match',
        duration: 3000,
      }));
      return;
    }

    try {
      setIsLoading(true);
      
      // Update profile information
      if (formData.displayName !== user?.displayName || formData.email !== user?.email) {
        await userSettingsService.updateProfile({
          displayName: formData.displayName,
          email: formData.email,
        });
      }

      // Update password if provided
      if (formData.newPassword && formData.currentPassword) {
        await userSettingsService.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }

      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully',
        duration: 3000,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      // Check for specific Firebase auth errors
      if (errorMessage.includes('auth/wrong-password')) {
        dispatch(addNotification({
          type: 'error',
          message: 'Current password is incorrect',
          duration: 5000,
        }));
      } else if (errorMessage.includes('auth/weak-password')) {
        dispatch(addNotification({
          type: 'error',
          message: 'New password is too weak. Please choose a stronger password.',
          duration: 5000,
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDeletePhoto = async () => {
    if (!user?.photoURL) return;

    try {
      setIsLoading(true);
      await userSettingsService.deleteProfilePhoto();
      
      // Update user state to remove photo URL
      dispatch(updateUserProfile({ photoURL: null }));
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile photo deleted successfully',
        duration: 3000,
      }));
    } catch (error) {
      console.error('Photo delete error:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete profile photo',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };


  const getUserInitials = () => {
    const name = formData.displayName || user?.email?.split('@')[0] || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Load data for each tab
  const loadTravelGuides = async () => {
    try {
      const guides = await userSettingsService.getUserTravelGuides();
      setTravelGuides(guides);
    } catch (error) {
      console.error('Failed to load travel guides:', error);
    }
  };

  const loadFavoriteBlogs = async () => {
    try {
      const favorites = await userSettingsService.getFavoriteBlogs();
      setFavoriteBlogs(favorites);
    } catch (error) {
      console.error('Failed to load favorite blogs:', error);
    }
  };

  const loadUserBlogs = async () => {
    try {
      const blogs = await userSettingsService.getUserBlogPosts();
      setUserBlogs(blogs);
    } catch (error) {
      console.error('Failed to load user blogs:', error);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'travel-guides':
        loadTravelGuides();
        break;
      case 'favorite-blogs':
        loadFavoriteBlogs();
        break;
      case 'my-blogs':
        loadUserBlogs();
        break;
    }
  }, [activeTab]);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: Settings },
    { id: 'travel-guides', label: 'My Travel Guides', icon: BookOpen },
    { id: 'my-blogs', label: 'My Blog Posts', icon: FileText },
    { id: 'favorite-blogs', label: 'Favorite Blogs', icon: Heart },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    to={tab.id === 'profile' ? '/user-settings' : `/user/${tab.id}`}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                  <p className="mt-1 text-sm text-gray-600">Update your personal information and account settings</p>
                </div>

                <div className="p-6">
                  {/* Profile Photo Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                    <div className="flex items-center space-x-6">
                      <div className="relative group">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200">
                            {getUserInitials()}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                          title="Update photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        {user?.photoURL && (
                          <button
                            onClick={handleDeletePhoto}
                            disabled={isLoading}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {user?.photoURL ? 'Click the camera icon to update your profile photo' : 'Add a profile photo to personalize your account'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 5MB.</p>
                        {isLoading && (
                          <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your display name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Password Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        <Lock className="w-5 h-5 inline mr-2" />
                        Change Password
                      </h3>
                      
                      {/* Current Password */}
                      <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'travel-guides' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">My Travel Guides</h2>
                  <p className="mt-1 text-sm text-gray-600">Manage your created travel guides</p>
                </div>
                <div className="p-6">
                  {travelGuides.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No travel guides yet</h3>
                      <p className="text-gray-600 mb-4">Start creating travel guides to help other travelers</p>
                      <Link
                        to="/guide/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        Create Travel Guide
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {travelGuides.map((guide) => (
                        <div key={guide.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className="mr-4">📍 {guide.destination}</span>
                                <span className="mr-4">👁️ {guide.views} views</span>
                                <span className="mr-4">❤️ {guide.likes} likes</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  guide.isPublished 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {guide.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Link
                                to={`/guide/${guide.id}`}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                View
                              </Link>
                              <Link
                                to={`/guide/${guide.id}/edit`}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'favorite-blogs' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Favorite Blogs</h2>
                  <p className="mt-1 text-sm text-gray-600">Blogs you've marked as favorites</p>
                </div>
                <div className="p-6">
                  {favoriteBlogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite blogs yet</h3>
                      <p className="text-gray-600 mb-4">Start exploring and favoriting travel blogs</p>
                      <Link
                        to="/blog"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        Browse Blogs
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {favoriteBlogs.map((blog) => (
                        <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{blog.excerpt}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className="mr-4">✍️ {blog.author}</span>
                                <span className="mr-4">📖 {blog.readTime} min read</span>
                                <span className="mr-4">❤️ Favorited on {new Date(blog.favoritedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-wrap mt-2">
                                {blog.tags.map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2 mb-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Link
                                to={`/blog/${blog.slug}`}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                Read
                              </Link>
                              <button
                                onClick={() => {
                                  // TODO: Implement remove from favorites
                                  console.log('Remove from favorites:', blog.id);
                                }}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'my-blogs' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">My Blog Posts</h2>
                  <p className="mt-1 text-sm text-gray-600">Manage your published blog posts</p>
                </div>
                <div className="p-6">
                  {userBlogs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                      <p className="text-gray-600 mb-4">Start sharing your travel experiences with the community</p>
                      <Link
                        to="/blog/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        Create Blog Post
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userBlogs.map((blog) => (
                        <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{blog.excerpt}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span className="mr-4">👁️ {blog.views} views</span>
                                <span className="mr-4">❤️ {blog.likes} likes</span>
                                <span className="mr-4">💬 {blog.comments} comments</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  blog.status === 'published' 
                                    ? 'bg-green-100 text-green-800'
                                    : blog.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex flex-wrap mt-2">
                                {blog.tags.map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2 mb-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Link
                                to={`/blog/${blog.slug}`}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                View
                              </Link>
                              <Link
                                to={`/blog/${blog.id}/edit`}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  // TODO: Implement delete blog post
                                  console.log('Delete blog post:', blog.id);
                                }}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
