
import React, { useEffect } from 'react';
import Header from '../components/Header';
import ProfileInfo from '../components/ProfileInfo';
import { useOrders } from '../context/OrderContext';

const Profile = () => {
  const { refreshUserData } = useOrders();

  // Ensure we get the latest data when component mounts
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account and view your trading information
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ProfileInfo />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
