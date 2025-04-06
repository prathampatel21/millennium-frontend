
import React, { useState, useEffect } from 'react';
import { User, Mail, LogOut, DollarSign, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';

// Define API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

const ProfileInfo: React.FC = () => {
  const { user, getUsername, signOut } = useAuth();
  const { balance, setBalance, holdings, refreshUserData } = useOrders();
  const [balanceInput, setBalanceInput] = useState(balance.toString());
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update balance input when the actual balance changes
  useEffect(() => {
    setBalanceInput(balance.toFixed(2));
  }, [balance]);

  // Fetch the latest data when component mounts
  useEffect(() => {
    const fetchLatestData = async () => {
      await refreshUserData();
    };
    
    fetchLatestData();
  }, [refreshUserData]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleBalanceSubmit = async () => {
    const newBalance = parseFloat(balanceInput);
    if (!isNaN(newBalance) && newBalance >= 0) {
      setIsSubmitting(true);
      try {
        const username = getUsername();
        if (!username) {
          throw new Error('Username not available');
        }
        
        // Update balance in MySQL backend
        const response = await axios.put(`${API_BASE_URL}/users/${username}/balance`, {
          balance: newBalance
        });
        
        if (response.data) {
          // Convert the new_balance to a number regardless of whether it's a string or number
          const updatedBalance = parseFloat(response.data.new_balance);
          
          if (!isNaN(updatedBalance)) {
            // Update balance through OrderContext
            await setBalance(updatedBalance);
            
            toast.success('Account balance updated', {
              description: `New balance: $${updatedBalance.toFixed(2)}`,
            });
            
            // Refresh user data to ensure all data is in sync
            await refreshUserData();
            setIsEditingBalance(false);
          } else {
            throw new Error('Invalid balance value received from server');
          }
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        toast.error('Failed to update balance', {
          description: 'Please try again later',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Invalid balance', {
        description: 'Please enter a valid positive number',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - User Info and Account Balance */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full mb-4">
              <User className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{getUsername() || 'User'}</h2>
            <p className="text-gray-500 flex items-center justify-center mt-1">
              <Mail className="h-4 w-4 mr-1" />
              {user?.email}
            </p>
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
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      onClick={handleBalanceSubmit}
                      className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Saving
                        </span>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setBalanceInput(balance.toFixed(2));
                        setIsEditingBalance(false);
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
                      disabled={isSubmitting}
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
          </div>
        </div>

        {/* Account Information */}
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Account Information</h3>
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Member since</span>
                  <span className="text-sm font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">User ID</span>
                  <span className="text-sm font-medium">{user?.id ? user.id.substring(0, 8) : 'Unknown'}</span>
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
      </div>
      
      {/* Center/Right Column - Stock Holdings (replacing Recently Completed Orders) */}
      <div className="lg:col-span-2">
        <Card className="shadow-md animate-fade-in">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Stock Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {holdings.length > 0 ? (
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <div key={holding.ticker} className="glass rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{holding.ticker}</h4>
                        <p className="text-sm text-gray-500">Stock</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{holding.quantity}</p>
                      <p className="text-sm text-gray-500">Shares</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-1">No stock holdings yet</p>
                <p className="text-sm text-gray-400">
                  Your purchased stocks will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInfo;
