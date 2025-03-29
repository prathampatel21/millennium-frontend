
import React, { useState, useEffect } from 'react';
import { User, Mail, LogOut, CheckCircle, DollarSign, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Input } from '@/components/ui/input';
import { getUser } from '../services/apiService';

const ProfileInfo: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { balance, setBalance, holdings, userId, refreshData } = useOrders();
  const [balanceInput, setBalanceInput] = useState(balance.toString());
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    joinedDate: new Date(),
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUser(userId);
        setUserData({
          name: user.name,
          email: user.email,
          joinedDate: new Date(2023, 5, 15), // Hardcoded for demo
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [userId]);

  // Update balance input when the actual balance changes
  useEffect(() => {
    setBalanceInput(balance.toFixed(2));
  }, [balance]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success('Logged out successfully', {
      icon: <CheckCircle className="h-4 w-4" />,
    });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    refreshData();
    toast.success('Logged in successfully', {
      icon: <CheckCircle className="h-4 w-4" />,
    });
  };

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
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <span 
                className="text-primary cursor-pointer hover:underline"
                onClick={() => navigate('/register')}
              >
                Register here
              </span>
            </p>
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
        <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
        <p className="text-gray-500 flex items-center justify-center mt-1">
          <Mail className="h-4 w-4 mr-1" />
          {userData.email}
        </p>
        <p className="text-xs text-gray-400 mt-1">User ID: {userId}</p>
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
                {userData.joinedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-medium">USR-{userId}</span>
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
