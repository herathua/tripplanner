import { supabase } from '../config/supabase';
import { User } from 'firebase/auth';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
}

export class ImageUploadService {
  /**
   * Upload image to Supabase storage with fallback options
   */
  static async uploadProfileImage(file: File, user: User): Promise<ImageUploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select a valid image file' };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: 'Image size must be less than 5MB' };
      }

      // Try Supabase storage first
      const supabaseResult = await this.uploadToSupabase(file, user);
      if (supabaseResult.success) {
        return supabaseResult;
      }

      // If Supabase fails, use a placeholder avatar instead of base64
      // Base64 URLs are too long for Firebase photoURL field
      const placeholderUrl = this.generatePlaceholderAvatar(user);
      return { success: true, url: placeholderUrl };
    } catch (error: any) {
      console.error('Image upload error:', error);
      return { success: false, error: error.message || 'Upload failed' };
    }
  }

  /**
   * Update user profile photo in backend database
   */
  static async updateUserProfilePhoto(user: User, photoUrl: string): Promise<ProfileUpdateResult> {
    try {
      // Import userService dynamically to avoid circular imports
      const { userService } = await import('./userService');
      
      // First, get the user from backend to get their ID
      const backendUser = await userService.getUserByFirebaseUid(user.uid);
      
      if (!backendUser.id) {
        return { success: false, error: 'User not found in backend database' };
      }
      
      const updatedUser = await userService.updateUser(backendUser.id, {
        ...backendUser,
        photoUrl: photoUrl
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Backend profile update error:', error);
      return { success: false, error: error.message || 'Failed to update profile in backend' };
    }
  }

  /**
   * Update user display name in backend database
   */
  static async updateUserDisplayName(user: User, displayName: string): Promise<ProfileUpdateResult> {
    try {
      // Import userService dynamically to avoid circular imports
      const { userService } = await import('./userService');
      
      // First, get the user from backend to get their ID
      const backendUser = await userService.getUserByFirebaseUid(user.uid);
      
      if (!backendUser.id) {
        return { success: false, error: 'User not found in backend database' };
      }
      
      // Update only the display name using the specific update endpoint
      const updatedUser = await userService.updateUser(backendUser.id, {
        ...backendUser,
        displayName: displayName
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Backend display name update error:', error);
      return { success: false, error: error.message || 'Failed to update display name in backend' };
    }
  }

  /**
   * Get user profile from backend database
   */
  static async getUserProfile(user: User): Promise<{ displayName?: string; photoUrl?: string; role?: string } | null> {
    try {
      // Import userService dynamically to avoid circular imports
      const { userService } = await import('./userService');
      
      const backendUser = await userService.getUserByFirebaseUid(user.uid);
      
      return {
        displayName: backendUser.displayName,
        photoUrl: backendUser.photoUrl,
        role: backendUser.role
      };
    } catch (error: any) {
      console.error('Backend profile fetch error:', error);
      return null;
    }
  }

  /**
   * Upload to Supabase storage
   */
  private static async uploadToSupabase(file: File, user: User): Promise<ImageUploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos') // Use your existing profile-photos bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // Check if it's an RLS policy error
        if (uploadError.message.includes('row-level security policy') || 
            uploadError.message.includes('RLS') ||
            uploadError.message.includes('permission denied')) {
          console.warn('Supabase upload failed due to RLS policy:', uploadError.message);
          return { success: false, error: 'Storage access denied' };
        }
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert file to base64 data URL as fallback
   */
  private static async convertToBase64(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({ success: true, url: result });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to convert image to base64' });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate a placeholder avatar URL
   */
  static generatePlaceholderAvatar(user: User): string {
    const initial = user.displayName?.charAt(0) || user.email?.charAt(0) || 'U';
    const colors = [
      '4F46E5', // Indigo
      '059669', // Emerald
      'DC2626', // Red
      'D97706', // Amber
      '7C3AED', // Violet
      'DB2777', // Pink
      '0891B2', // Cyan
      '16A34A', // Green
      'EA580C', // Orange
      '9333EA'  // Purple
    ];
    
    // Use user ID to consistently assign the same color to the same user
    const userId = user.uid;
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    // Create a more sophisticated placeholder with gradient
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${color}&color=ffffff&size=200&bold=true&format=png`;
  }

  /**
   * Check if Supabase storage is properly configured
   */
  static async checkSupabaseStorage(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Supabase storage check failed:', error);
        return false;
      }
      
      const guidesBucket = data?.find(bucket => bucket.name === 'guides');
      return !!guidesBucket;
    } catch (error) {
      console.error('Supabase storage check error:', error);
      return false;
    }
  }
}
