import { User } from 'firebase/auth';

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordUpdateResponse {
  success: boolean;
  error?: string;
  message?: string;
  requiresFirebaseUpdate?: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password update request
   */
  static validatePasswordUpdate(request: PasswordUpdateRequest): PasswordValidationResult {
    const errors: string[] = [];

    if (!request.currentPassword) {
      errors.push('Current password is required');
    }

    if (!request.newPassword) {
      errors.push('New password is required');
    }

    if (!request.confirmPassword) {
      errors.push('Password confirmation is required');
    }

    if (request.newPassword && request.confirmPassword && request.newPassword !== request.confirmPassword) {
      errors.push('New password and confirmation do not match');
    }

    if (request.newPassword) {
      const strengthValidation = this.validatePasswordStrength(request.newPassword);
      if (!strengthValidation.isValid) {
        errors.push(...strengthValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update password via backend API
   */
  static async updatePassword(request: PasswordUpdateRequest, user: User): Promise<PasswordUpdateResponse> {
    try {
      // First validate the request
      const validation = this.validatePasswordUpdate(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      const response = await fetch(`${this.API_BASE_URL}/users/password/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return data as PasswordUpdateResponse;

    } catch (error: any) {
      console.error('Error updating password:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password. Please try again.'
      };
    }
  }

  /**
   * Update password using Firebase Auth
   */
  static async updatePasswordWithFirebase(newPassword: string, user: User): Promise<PasswordUpdateResponse> {
    try {
      // Note: Firebase requires re-authentication for password updates
      // This is a simplified version - in production, you'd need to implement
      // proper re-authentication flow
      
      await user.updatePassword(newPassword);
      
      return {
        success: true,
        message: 'Password updated successfully'
      };

    } catch (error: any) {
      console.error('Firebase password update error:', error);
      
      let errorMessage = 'Failed to update password';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Please log out and log back in before changing your password';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Failed to update password';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get password strength indicator
   */
  static getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } {
    if (!password) {
      return { strength: 'weak', score: 0 };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;
    
    // Additional complexity
    if (password.length >= 16) score += 1;
    if (/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;

    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'medium', score };
    return { strength: 'strong', score };
  }
}
