import apiClient from '../config/api';
import { updateUserProfile, auth } from '../config/firebase';
import { supabase } from '../config/supabase';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

export interface UserProfileUpdate {
  displayName?: string;
  email?: string;
  photoUrl?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface UserTravelGuide {
  id: string;
  title: string;
  description: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  views: number;
  likes: number;
}

export interface UserFavoriteBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  createdAt: string;
  favoritedAt: string;
  readTime: number;
  tags: string[];
}

export interface UserBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
}

class UserSettingsService {
  // Profile Management
  async updateProfile(profileData: UserProfileUpdate): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Update Firebase Auth profile
      const firebaseUpdates: { displayName?: string; photoURL?: string } = {};
      if (profileData.displayName) {
        firebaseUpdates.displayName = profileData.displayName;
      }
      if (profileData.photoUrl) {
        firebaseUpdates.photoURL = profileData.photoUrl;
      }
      
      if (Object.keys(firebaseUpdates).length > 0) {
        await updateUserProfile(user, firebaseUpdates);
      }
      
      // Also update backend database
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(passwordData: PasswordChange): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Re-authenticate user with current password
      const credential = await signInWithEmailAndPassword(auth, user.email!, passwordData.currentPassword);
      
      // Update password
      await updatePassword(credential.user, passwordData.newPassword);
      
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Starting photo upload for user:', user.uid);
      
      // Try Supabase upload first
      try {
        const fileName = `profile-photos/${user.uid}/${Date.now()}-${file.name}`;
        console.log('Uploading to Supabase:', fileName);
        
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        console.log('Supabase upload successful:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        const photoUrl = urlData.publicUrl;
        console.log('Photo uploaded successfully to Supabase, URL:', photoUrl);
        
        // Update Firebase Auth profile
        await updateUserProfile(user, { photoURL: photoUrl });
        console.log('Firebase Auth profile updated');
        
        // Update backend database
        try {
          await apiClient.put('/users/profile', { photoUrl });
          console.log('Backend profile updated');
        } catch (error) {
          console.warn('Failed to update backend profile photo:', error);
        }
        
        return { photoUrl };
        
      } catch (supabaseError) {
        console.warn('Supabase upload failed, using backend fallback:', supabaseError);
        
        // Fallback: Upload to backend instead
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await apiClient.post('/files/upload-profile-photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          const photoUrl = response.data;
          console.log('Photo uploaded successfully via backend fallback, URL:', photoUrl);
          
          // Update Firebase Auth profile (skip if URL is too long)
          try {
            await updateUserProfile(user, { photoURL: photoUrl });
            console.log('Firebase Auth profile updated');
          } catch (firebaseError) {
            console.warn('Firebase Auth update failed (URL too long), continuing with backend only:', firebaseError);
          }
          
          return { photoUrl };
          
        } catch (backendError) {
          console.warn('Backend upload also failed, using base64 fallback:', backendError);
          
          // Final fallback: Convert to base64 and store only in backend
          const base64Photo = await this.convertFileToBase64(file);
          const photoUrl = `data:${file.type};base64,${base64Photo}`;
          
          // Update backend database only (skip Firebase Auth due to URL length limit)
          try {
            await apiClient.put('/users/profile', { photoUrl });
            console.log('Backend profile updated with base64 data');
          } catch (error) {
            console.warn('Failed to update backend profile photo:', error);
          }
          
          return { photoUrl };
        }
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async deleteProfilePhoto(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Try to delete from Supabase if photo URL exists
      if (user.photoURL && user.photoURL.includes('supabase')) {
        try {
          // Extract file path from Supabase URL
          const url = new URL(user.photoURL);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          
          const { error } = await supabase.storage
            .from('profile-photos')
            .remove([`profile-photos/${user.uid}/${fileName}`]);
          
          if (error) {
            console.warn('Failed to delete from Supabase:', error);
          } else {
            console.log('Profile photo deleted from Supabase');
          }
        } catch (supabaseError) {
          console.warn('Supabase delete failed:', supabaseError);
        }
      }
      
      // Update backend database
      try {
        await apiClient.put('/users/profile', { photoUrl: null });
        console.log('Backend profile updated');
      } catch (error) {
        console.warn('Failed to update backend profile photo:', error);
      }
      
      // Update Firebase Auth profile to remove photo
      await updateUserProfile(user, { photoURL: undefined });
      console.log('Firebase Auth profile updated');
      
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  }

  // Travel Guides Management
  async getUserTravelGuides(): Promise<UserTravelGuide[]> {
    try {
      // Travel guides functionality not implemented in backend yet
      console.log('Travel guides endpoint not available, returning empty array');
      return [];
    } catch (error) {
      console.log('Travel guides endpoint not available, returning empty array');
      // Return empty array if endpoint doesn't exist
      return [];
    }
  }

  async deleteTravelGuide(_guideId: string): Promise<void> {
    try {
      // Travel guides functionality not implemented in backend yet
      console.log('Delete travel guide endpoint not available');
      throw new Error('Delete travel guide feature not available yet');
    } catch (error) {
      console.log('Delete travel guide endpoint not available');
      throw new Error('Delete travel guide feature not available yet');
    }
  }

  async updateTravelGuideStatus(_guideId: string, _isPublished: boolean): Promise<void> {
    try {
      // Travel guides functionality not implemented in backend yet
      console.log('Update travel guide status endpoint not available');
      throw new Error('Update travel guide status feature not available yet');
    } catch (error) {
      console.log('Update travel guide status endpoint not available');
      throw new Error('Update travel guide status feature not available yet');
    }
  }

  // Favorite Blogs Management
  async getFavoriteBlogs(): Promise<UserFavoriteBlog[]> {
    try {
      // Favorite blogs functionality not implemented in backend yet
      console.log('Favorite blogs endpoint not available, returning empty array');
      return [];
    } catch (error) {
      console.log('Favorite blogs endpoint not available, returning empty array');
      return [];
    }
  }

  async removeFavoriteBlog(_blogId: string): Promise<void> {
    try {
      // Favorite blogs functionality not implemented in backend yet
      console.log('Remove favorite blog endpoint not available');
      throw new Error('Remove favorite blog feature not available yet');
    } catch (error) {
      console.log('Remove favorite blog endpoint not available');
      throw new Error('Remove favorite blog feature not available yet');
    }
  }

  // Blog Posts Management
  async getUserBlogPosts(): Promise<UserBlogPost[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated');
        return [];
      }
      
      const response = await apiClient.get(`/blog-posts/user/${user.uid}`);
      // Convert backend BlogPost format to frontend UserBlogPost format
      const blogPosts = response.data.content || response.data;
      return Array.isArray(blogPosts) ? blogPosts.map(this.convertBlogPostToUserBlogPost) : [];
    } catch (error) {
      console.log('User blog posts endpoint not available, returning empty array');
      return [];
    }
  }

  async deleteBlogPost(postId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const response = await apiClient.delete(`/blog-posts/${postId}?firebaseUid=${user.uid}`);
      return response.data;
    } catch (error) {
      console.log('Delete blog post endpoint not available');
      throw new Error('Delete blog post feature not available yet');
    }
  }

  async updateBlogPostStatus(postId: string, status: 'draft' | 'published' | 'archived'): Promise<void> {
    try {
      const response = await apiClient.patch(`/users/blog-posts/${postId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.log('Update blog post status endpoint not available');
      throw new Error('Update blog post status feature not available yet');
    }
  }

  // Account Management
  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete('/users/account');
    return response.data;
  }

  async exportUserData(): Promise<Blob> {
    const response = await apiClient.get('/users/export-data', {
      responseType: 'blob',
    });
    return response.data;
  }

  // Statistics
  async getUserStats(): Promise<{
    totalTravelGuides: number;
    totalBlogPosts: number;
    totalFavorites: number;
    totalViews: number;
    totalLikes: number;
  }> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }

  // Helper method to convert backend BlogPost to frontend UserBlogPost
  private convertBlogPostToUserBlogPost(blogPost: any): UserBlogPost {
    return {
      id: blogPost.id.toString(),
      title: blogPost.title || '',
      slug: blogPost.publicSlug || '',
      excerpt: blogPost.excerpt || '',
      content: blogPost.content || '',
      status: blogPost.status?.toLowerCase() || 'draft',
      createdAt: blogPost.createdAt || new Date().toISOString(),
      updatedAt: blogPost.updatedAt || new Date().toISOString(),
      publishedAt: blogPost.publishedAt || undefined,
      views: blogPost.viewCount || 0,
      likes: blogPost.likeCount || 0,
      comments: blogPost.commentCount || 0,
      tags: blogPost.tags || []
    };
  }
}

export const userSettingsService = new UserSettingsService();
export default userSettingsService;
