import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, register, loginWithGoogle, resetPassword, clearError } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Plane, MapPin } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        type: 'error',
        message: error,
        duration: 5000,
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !validatePassword(value)) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    
    // Validate inputs
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        message: 'Passwords do not match',
        duration: 5000,
      }));
      return;
    }

    try {
      if (isLogin) {
        await dispatch(login({ email, password })).unwrap();
      } else {
        await dispatch(register({ email, password })).unwrap();
      }
      navigate('/home');
    } catch (error) {
      // Error is handled by the error effect
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      navigate('/home');
    } catch (error) {
      // Error is handled by the error effect
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(resetEmail)) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please enter a valid email address',
        duration: 5000,
      }));
      return;
    }

    try {
      await dispatch(resetPassword(resetEmail)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Password reset email sent! Check your inbox.',
        duration: 5000,
      }));
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      // Error is handled by the error effect
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-royal-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-royal-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="p-3 bg-royal-blue rounded-xl shadow-lg">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-sky-blue rounded-xl shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue your journey' : 'Start planning your next adventure'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {!showForgotPassword ? (
            <>
              {/* Login/Register Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all duration-200 ${
                        emailError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all duration-200 ${
                        passwordError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Register only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot Password Link (Login only) */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-royal-blue hover:text-royal-blue/80 font-medium transition-colors duration-200"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-royal-blue to-royal-blue/90 hover:from-royal-blue/90 hover:to-royal-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <div className="mt-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <img
                      className="h-5 w-5"
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google logo"
                    />
                    <span className="ml-2">Continue with Google</span>
                  </button>
                </div>
              </div>

              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmailError('');
                      setPasswordError('');
                    }}
                    className="font-medium text-royal-blue hover:text-royal-blue/80 transition-colors duration-200"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* Forgot Password Form */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h3>
                <p className="text-gray-600">Enter your email to receive a password reset link</p>
              </div>

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-royal-blue to-royal-blue/90 hover:from-royal-blue/90 hover:to-royal-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;