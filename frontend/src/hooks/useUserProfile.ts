import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ImageUploadService } from '../services/imageUploadService';

interface UserProfile {
  displayName?: string;
  photoUrl?: string;
  role?: string;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const backendProfile = await ImageUploadService.getUserProfile(user);
        setProfile(backendProfile);
      } catch (error) {
        console.warn('Failed to load backend profile:', error);
        // Fallback to Firebase data
        setProfile({
          displayName: user.displayName || undefined,
          photoUrl: user.photoURL || undefined
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const backendProfile = await ImageUploadService.getUserProfile(user);
      setProfile(backendProfile);
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    refreshProfile
  };
};
