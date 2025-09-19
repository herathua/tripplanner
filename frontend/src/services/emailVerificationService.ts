import { User } from 'firebase/auth';
import { 
  sendEmailVerificationToUser, 
  verifyEmailWithCode, 
  checkEmailVerificationCode 
} from '../config/firebase';

export interface EmailVerificationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface EmailVerificationCodeResponse {
  success: boolean;
  error?: string;
  info?: any;
}

export class EmailVerificationService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  /**
   * Send email verification to the current user
   */
  static async sendVerificationEmail(user: User): Promise<EmailVerificationResponse> {
    try {
      // Check if user is already verified
      if (user.emailVerified) {
        return {
          success: false,
          error: 'Email is already verified'
        };
      }

      // Send verification email via Firebase
      await sendEmailVerificationToUser(user);
      
      return {
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      };

    } catch (error: any) {
      console.error('Error sending verification email:', error);
      
      let errorMessage = 'Failed to send verification email';
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many verification emails sent. Please wait before requesting another.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found. Please log in again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Failed to send verification email';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verify email with action code from email link
   */
  static async verifyEmailWithActionCode(code: string): Promise<EmailVerificationResponse> {
    try {
      await verifyEmailWithCode(code);
      
      return {
        success: true,
        message: 'Email verified successfully!'
      };

    } catch (error: any) {
      console.error('Error verifying email:', error);
      
      let errorMessage = 'Failed to verify email';
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          errorMessage = 'Invalid or expired verification code.';
          break;
        case 'auth/expired-action-code':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found.';
          break;
        default:
          errorMessage = error.message || 'Failed to verify email';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Check if an action code is valid before applying it
   */
  static async checkActionCode(code: string): Promise<EmailVerificationCodeResponse> {
    try {
      const info = await checkEmailVerificationCode(code);
      
      return {
        success: true,
        info
      };

    } catch (error: any) {
      console.error('Error checking action code:', error);
      
      let errorMessage = 'Invalid verification code';
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          errorMessage = 'Invalid verification code';
          break;
        case 'auth/expired-action-code':
          errorMessage = 'Verification code has expired';
          break;
        default:
          errorMessage = error.message || 'Invalid verification code';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update email verification status in backend
   */
  static async updateBackendEmailVerificationStatus(user: User, isVerified: boolean): Promise<EmailVerificationResponse> {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(`${this.API_BASE_URL}/users/email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          emailVerified: isVerified
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: 'Email verification status updated successfully'
      };

    } catch (error: any) {
      console.error('Error updating backend email verification status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update email verification status'
      };
    }
  }

  /**
   * Get email verification status from backend
   */
  static async getEmailVerificationStatus(user: User): Promise<{ isVerified: boolean; error?: string }> {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(`${this.API_BASE_URL}/users/email-verification`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        return {
          isVerified: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        isVerified: data.emailVerified || false
      };

    } catch (error: any) {
      console.error('Error getting email verification status:', error);
      return {
        isVerified: false,
        error: error.message || 'Failed to get email verification status'
      };
    }
  }
}

