import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(username, password);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md px-6 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">LOGIN</h1>
      
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="relative">
          <div className="absolute text-gray-400 left-3 top-3">
            <User size={18} />
          </div>
          <input
            type="text"
            placeholder="Username"
            className={`w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 focus:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border border-red-500' : 'border border-transparent'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
        </div>
        
        <div className="relative">
          <div className="absolute text-gray-400 left-3 top-3">
            <Lock size={18} />
          </div>
          <input
            type="password"
            placeholder="Password"
            className={`w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 focus:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border border-red-500' : 'border border-transparent'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full py-3 font-medium text-white transition-all duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login Now
        </button>
      </form>
      
      <div className="w-full mt-8">
        <div className="flex items-center mb-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm font-medium text-gray-500">Login with Others</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>
        
        <div className="space-y-3">
          <button className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-md hover:bg-gray-50">
            <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_24dp.png" alt="Google" className="w-5 h-5 mr-2" />
            <span className="text-sm text-gray-700">Login with Google</span>
          </button>
          
          <button className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-md hover:bg-gray-50">
            <svg className="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
            </svg>
            <span className="text-sm text-gray-700">Login with Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;