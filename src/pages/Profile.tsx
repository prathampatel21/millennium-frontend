
import React from 'react';
import Header from '../components/Header';
import ProfileInfo from '../components/ProfileInfo';
import OrderTable from '../components/OrderTable';
import { useOrders } from '../context/OrderContext';

const Profile = () => {
  const { getCompletedOrders } = useOrders();
  const completedOrders = getCompletedOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">
              Manage your account and view your trading history
            </p>
          </div>
          
          <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div>
              <ProfileInfo />
            </div>
            
            <div>
              <div className="glass rounded-xl p-6 h-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Completed Orders</h2>
                
                {completedOrders.length > 0 ? (
                  <OrderTable 
                    orders={completedOrders.slice(0, 5)} 
                    showFilters={false} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No completed orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
