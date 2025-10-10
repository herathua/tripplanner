import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { ImageUploadService } from '../../services/imageUploadService';
import { PasswordService, PasswordUpdateRequest } from '../../services/passwordService';
import { EmailVerificationService } from '../../services/emailVerificationService';
import CurrencySelector from './CurrencySelector';

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong'; score: number }>({ strength: 'weak', score: 0 });
  const [passwordRequirements, setPasswordRequirements] = useState<{
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
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

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general errors when user starts typing
    if (passwordErrors.length > 0) {
      setPasswordErrors([]);
    }

    // Clear field-specific errors
    setFieldErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    // Validate password strength and requirements for new password
    if (name === 'newPassword') {
      const strength = PasswordService.getPasswordStrength(value);
      setPasswordStrength(strength);
      
      // Update password requirements checklist
      setPasswordRequirements({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value),
      });
    }

    // Validate password confirmation
    if (name === 'confirmPassword' && formData.newPassword) {
      if (value && value !== formData.newPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }

    // Validate current password (basic check)
    if (name === 'currentPassword' && value.length > 0 && value.length < 6) {
      setFieldErrors(prev => ({
        ...prev,
        currentPassword: 'Password seems too short'
      }));
    }
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
    
    // Clear previous errors
    setPasswordErrors([]);
    setFieldErrors({});
    
    // Create password update request
    const passwordRequest: PasswordUpdateRequest = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    };

    // Validate the request
    const validation = PasswordService.validatePasswordUpdate(passwordRequest);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      
      // Set field-specific errors
      const newFieldErrors: typeof fieldErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('Current password')) {
          newFieldErrors.currentPassword = error;
        } else if (error.includes('New password') || error.includes('Password must')) {
          newFieldErrors.newPassword = error;
        } else if (error.includes('confirmation') || error.includes('match')) {
          newFieldErrors.confirmPassword = error;
        }
      });
      setFieldErrors(newFieldErrors);
      
      dispatch(addNotification({
        type: 'error',
        message: 'Please fix the following errors: ' + validation.errors.join(', '),
        duration: 5000,
      }));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // First validate with backend
      const backendResult = await PasswordService.updatePassword(passwordRequest, user);
      
      if (!backendResult.success) {
        const errorMessage = backendResult.error || 'Backend validation failed';
        setPasswordErrors([errorMessage]);
        
        // Try to identify which field the error relates to
        if (errorMessage.toLowerCase().includes('current') || errorMessage.toLowerCase().includes('incorrect')) {
          setFieldErrors({ currentPassword: errorMessage });
        } else if (errorMessage.toLowerCase().includes('weak') || errorMessage.toLowerCase().includes('strength')) {
          setFieldErrors({ newPassword: errorMessage });
        }
        
        dispatch(addNotification({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        }));
        return;
      }

      // If backend validation passes, try Firebase update
      const firebaseResult = await PasswordService.updatePasswordWithFirebase(formData.newPassword, user);
      
      if (firebaseResult.success) {
        // Clear form on success
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setPasswordStrength({ strength: 'weak', score: 0 });
        setPasswordRequirements({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        });
        
        dispatch(addNotification({
          type: 'success',
          message: 'Password updated successfully! Please log out and log back in to ensure security.',
          duration: 5000,
        }));
      } else {
        const errorMessage = firebaseResult.error || 'Failed to update password';
        setPasswordErrors([errorMessage]);
        
        // Handle specific Firebase errors
        if (errorMessage.includes('requires-recent-login')) {
          setFieldErrors({ currentPassword: 'Please log out and log back in before changing your password' });
        } else if (errorMessage.includes('weak-password')) {
          setFieldErrors({ newPassword: 'Password is too weak. Please choose a stronger password' });
        }
        
        dispatch(addNotification({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        }));
      }

    } catch (error: any) {
      console.error('Error updating password:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setPasswordErrors([errorMessage]);
      dispatch(addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      }));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendEmailVerification = async () => {
    setIsSendingVerification(true);
    
    try {
      const result = await EmailVerificationService.sendVerificationEmail(user);
      
      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: result.message || 'Verification email sent successfully!',
          duration: 5000,
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: result.error || 'Failed to send verification email',
          duration: 5000,
        }));
      }
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to send verification email. Please try again.',
        duration: 5000,
      }));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleRefreshEmailStatus = async () => {
    try {
      // Reload the user to get updated email verification status
      await user.reload();
      
      // Update backend with the latest Firebase status
      const backendResult = await EmailVerificationService.updateBackendEmailVerificationStatus(user, user.emailVerified);
      
      if (backendResult.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Email verification status updated',
          duration: 3000,
        }));
        
        // Trigger a page refresh to show updated status
        window.location.reload();
      } else {
        console.warn('Failed to update backend email verification status:', backendResult.error);
      }
    } catch (error: any) {
      console.error('Error refreshing email status:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to refresh email verification status',
        duration: 3000,
      }));
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
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">
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
                  Email cannot be changed.
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
            
            {/* Display general validation errors */}
            {passwordErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
                  onChange={handlePasswordInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    fieldErrors.currentPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your current password"
                  aria-invalid={fieldErrors.currentPassword ? 'true' : 'false'}
                  aria-describedby={fieldErrors.currentPassword ? 'currentPassword-error' : undefined}
                />
                {fieldErrors.currentPassword && (
                  <p id="currentPassword-error" className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.currentPassword}
                  </p>
                )}
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
                  onChange={handlePasswordInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    fieldErrors.newPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Enter your new password"
                  aria-invalid={fieldErrors.newPassword ? 'true' : 'false'}
                  aria-describedby={fieldErrors.newPassword ? 'newPassword-error' : undefined}
                />
                
                {/* Password Requirements Checklist */}
                {formData.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600 mb-2">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-3 h-3 mr-2 ${passwordRequirements.length ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.length ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-3 h-3 mr-2 ${passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.uppercase ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-3 h-3 mr-2 ${passwordRequirements.lowercase ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.lowercase ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-3 h-3 mr-2 ${passwordRequirements.number ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.number ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                        One number
                      </div>
                      <div className={`flex items-center text-xs ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-3 h-3 mr-2 ${passwordRequirements.special ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {passwordRequirements.special ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                        One special character
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 'weak' ? 'bg-red-500' :
                            passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 'weak' ? 'text-red-600' :
                        passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
                
                {fieldErrors.newPassword && (
                  <p id="newPassword-error" className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.newPassword}
                  </p>
                )}
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
                  onChange={handlePasswordInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    fieldErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="Confirm your new password"
                  aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {formData.newPassword === formData.confirmPassword ? (
                      <p className="text-xs text-green-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
                
                {fieldErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 flex items-center" role="alert">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isUpdatingPassword || passwordErrors.length > 0 || Object.values(fieldErrors).some(error => error)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Currency Preferences */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Preferences</h3>
          <CurrencySelector />
        </div>

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
                <div className="flex items-center space-x-2">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Not Verified
                    </span>
                  )}
                  {!user.emailVerified && (
                    <button
                      onClick={handleSendEmailVerification}
                      disabled={isSendingVerification}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isSendingVerification ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                  <button
                    onClick={handleRefreshEmailStatus}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                {!user.emailVerified && (
                  <p className="mt-2 text-xs text-gray-500">
                    Click "Verify Email" to send a verification link to your email address.
                  </p>
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
