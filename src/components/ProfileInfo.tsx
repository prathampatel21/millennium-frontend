
import React, { useState } from 'react';
import { User, Mail, LogOut, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  joinedDate: new Date(2023, 5, 15),
  profileImage: null,
};

const ProfileInfo: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success('Logged out successfully', {
      icon: <CheckCircle className="h-4 w-4" />,
    });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success('Logged in successfully', {
      icon: <CheckCircle className="h-4 w-4" />,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-600 text-sm mt-2">Sign in to manage your orders</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              defaultValue="john.doe@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              defaultValue="password"
            />
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleLogin}
              className="btn-primary w-full"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full mb-4">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{mockUser.name}</h2>
        <p className="text-gray-500 flex items-center justify-center mt-1">
          <Mail className="h-4 w-4 mr-1" />
          {mockUser.email}
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Account Information</h3>
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Member since</span>
              <span className="text-sm font-medium">
                {mockUser.joinedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-medium">USR-{Math.random().toString(36).substring(2, 10)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Preferences</h3>
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email notifications</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle"
                  className="appearance-none w-10 h-5 rounded-full bg-gray-200 checked:bg-primary focus:outline-none transition duration-200 cursor-pointer"
                  defaultChecked
                />
                <label
                  htmlFor="toggle"
                  className="absolute block w-4 h-4 bg-white rounded-full shadow inset-y-0.5 left-0.5 focus-within:outline-none transition-transform duration-200 ease-in-out checked:transform translate-x-5 cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
