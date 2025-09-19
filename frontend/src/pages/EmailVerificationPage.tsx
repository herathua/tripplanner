import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmailVerificationService } from '../services/emailVerificationService';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      if (mode === 'verifyEmail' && oobCode) {
        setIsVerifying(true);
        setVerificationStatus('pending');

        try {
          // First check if the code is valid
          const checkResult = await EmailVerificationService.checkActionCode(oobCode);
          
          if (checkResult.success) {
            // Apply the verification code
            const verifyResult = await EmailVerificationService.verifyEmailWithActionCode(oobCode);
            
            if (verifyResult.success) {
              setVerificationStatus('success');
              dispatch(addNotification({
                type: 'success',
                message: 'Email verified successfully! You can now use all features of the application.',
                duration: 10000,
              }));
              
              // Redirect to user management after 3 seconds
              setTimeout(() => {
                navigate('/user-management');
              }, 3000);
            } else {
              setVerificationStatus('error');
              setErrorMessage(verifyResult.error || 'Failed to verify email');
            }
          } else {
            setVerificationStatus('error');
            setErrorMessage(checkResult.error || 'Invalid verification code');
          }
        } catch (error: any) {
          console.error('Email verification error:', error);
          setVerificationStatus('error');
          setErrorMessage(error.message || 'An unexpected error occurred during verification');
        } finally {
          setIsVerifying(false);
        }
      } else {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. Please request a new verification email.');
      }
    };

    verifyEmail();
  }, [searchParams, dispatch, navigate]);

  const handleResendVerification = async () => {
    try {
      // This would typically require the user to be logged in
      // For now, redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error redirecting to login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your email address...
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'pending' && (
            <div className="text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {isVerifying ? 'Verifying your email...' : 'Processing verification...'}
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="flex justify-center">
                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Email Verified Successfully!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been verified. You will be redirected to your profile page shortly.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/user-management')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="flex justify-center">
                <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Request New Verification Email
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;

