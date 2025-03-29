
import React, { useState } from 'react';
import { User, Mail, LogOut, CheckCircle, DollarSign, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProfileInfo: React.FC = () => {
  const { balance, setBalance, holdings, refreshData } = useOrders();
  const { currentUser, isAuthenticated, login, logout, googleLogin } = useAuth();
  const [balanceInput, setBalanceInput] = useState(balance.toString());
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleBalanceSubmit = () => {
    const newBalance = parseFloat(balanceInput);
    if (!isNaN(newBalance) && newBalance >= 0) {
      setBalance(newBalance);
      setIsEditingBalance(false);
      toast.success('Account balance updated', {
        description: `New balance: $${newBalance.toFixed(2)}`,
      });
    } else {
      toast.error('Invalid balance', {
        description: 'Please enter a valid positive number',
      });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      refreshData();
    }
  };

  const handleGoogleLogin = async () => {
    const success = await googleLogin();
    if (success) {
      refreshData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto glass rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-600 text-sm mt-2">Sign in to manage your orders</p>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="email"
                type="email"
                className="pl-10"
                placeholder="your@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full mb-4">
          {currentUser?.picture ? (
            <img 
              src={currentUser.picture} 
              alt={currentUser.name} 
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{currentUser?.name}</h2>
        <p className="text-gray-500 flex items-center justify-center mt-1">
          <Mail className="h-4 w-4 mr-1" />
          {currentUser?.email}
        </p>
        <p className="text-xs text-gray-400 mt-1">User ID: {currentUser?.userID}</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Account Balance</h3>
          <div className="glass rounded-xl p-4">
            {isEditingBalance ? (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                <button
                  onClick={handleBalanceSubmit}
                  className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setBalanceInput(balance.toFixed(2));
                    setIsEditingBalance(false);
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-lg font-semibold">${balance.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsEditingBalance(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Stock Holdings</h3>
          <div className="glass rounded-xl p-4">
            {holdings.length > 0 ? (
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <div key={holding.ticker} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">{holding.ticker}</span>
                    </div>
                    <span className="text-sm">{holding.quantity} shares</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-2">No stock holdings yet</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Account Information</h3>
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Member since</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-medium">USR-{currentUser?.userID}</span>
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
            onClick={logout}
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
