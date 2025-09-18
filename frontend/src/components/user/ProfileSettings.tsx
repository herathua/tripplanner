import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { ImageUploadService } from '../../services/imageUploadService';

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(user.photoURL);

  // Load profile data from backend on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileData = await ImageUploadService.getUserProfile(user);
        if (profileData) {
          // Update form data with backend data
          setFormData(prev => ({
            ...prev,
            displayName: profileData.displayName || user.displayName || '',
          }));
          
          // Use backend photo URL if available, otherwise fallback to Firebase
          if (profileData.photoUrl) {
            setProfileImage(profileData.photoUrl);
          }
        } else {
          // If backend profile doesn't exist, use Firebase data as fallback
          console.log('No backend profile found, using Firebase data as fallback');
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Continue with Firebase data as fallback
        console.log('Using Firebase data as fallback due to error');
      }
    };

    loadProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Step 1: Upload image to Supabase storage
      const result = await ImageUploadService.uploadProfileImage(file, user);
      
      if (result.success && result.url) {
        // Step 2: Update backend database with photo URL
        const updateResult = await ImageUploadService.updateUserProfilePhoto(user, result.url);
        
        if (updateResult.success) {
          // Step 3: Update frontend to show new photo
          setProfileImage(result.url);
          
          // Step 4: Reload profile data from backend to ensure consistency
          try {
            const updatedProfile = await ImageUploadService.getUserProfile(user);
            if (updatedProfile) {
              setFormData(prev => ({
                ...prev,
                displayName: updatedProfile.displayName || user.displayName || '',
              }));
              if (updatedProfile.photoUrl) {
                setProfileImage(updatedProfile.photoUrl);
              }
            }
            
            // Trigger profile refresh in MainLayout
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          } catch (error) {
            console.warn('Failed to reload profile data:', error);
            // Continue with the local update
          }
          
          // Check if it's a placeholder avatar
          if (result.url.includes('ui-avatars.com')) {
            dispatch(addNotification({
              type: 'info',
              message: 'Profile updated with personalized avatar (storage not available)',
              duration: 5000,
            }));
          } else {
            dispatch(addNotification({
              type: 'success',
              message: 'Profile image updated successfully',
              duration: 3000,
            }));
          }
        } else {
          throw new Error(updateResult.error || 'Failed to update profile in backend');
        }
      } else {
        // If upload failed completely, use a placeholder avatar
        const placeholderUrl = ImageUploadService.generatePlaceholderAvatar(user);
        
        // Still try to update backend with placeholder URL
        const updateResult = await ImageUploadService.updateUserProfilePhoto(user, placeholderUrl);
        
        if (updateResult.success) {
          setProfileImage(placeholderUrl);
          
          dispatch(addNotification({
            type: 'warning',
            message: 'Profile updated with personalized avatar (upload failed)',
            duration: 5000,
          }));
        } else {
          throw new Error(updateResult.error || 'Failed to update profile');
        }
      }
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update profile image. Please try again.',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update display name in backend database
      const updateResult = await ImageUploadService.updateUserDisplayName(user, formData.displayName);
      
      if (updateResult.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Profile updated successfully',
          duration: 3000,
        }));
        
        // Trigger profile refresh in MainLayout
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        throw new Error(updateResult.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update profile',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        message: 'New passwords do not match',
        duration: 3000,
      }));
      return;
    }

    if (formData.newPassword.length < 6) {
      dispatch(addNotification({
        type: 'error',
        message: 'Password must be at least 6 characters',
        duration: 3000,
      }));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Note: Firebase doesn't allow updating password without re-authentication
      // This would require implementing re-authentication flow
      dispatch(addNotification({
        type: 'info',
        message: 'Password update requires re-authentication. Please use the forgot password feature.',
        duration: 5000,
      }));
    } catch (error: any) {
      console.error('Error updating password:', error);
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update password',
        duration: 3000,
      }));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Image Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-600">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : 'Change Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
                <br />
                <span className="text-xs text-gray-400">
                  If storage is not configured, a personalized avatar will be generated automatically.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>

        {/* Password Section */}
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>

        {/* Account Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{user.uid}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Not Verified
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.providerData[0]?.providerId || 'Email/Password'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.metadata.lastSignInTime ? 
                  new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                  'Unknown'
                }
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
