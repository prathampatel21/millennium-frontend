
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Header from '../components/Header';
import OrderTable from '../components/OrderTable';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '../context/OrderContext';

const API_BASE_URL = 'http://127.0.0.1:5000';

const OrderHistory = () => {
  const { refreshUserData } = useOrders();
  const { getUsername } = useAuth();
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch order history data when component mounts
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const username = getUsername();
        if (!username) {
          toast.error('User information not available');
          setLoading(false);
          return;
        }
        
        console.log('Fetching order history for user:', username);
        const response = await axios.get(`${API_BASE_URL}/users/${username}/orders/history`);
        
        if (response.data && Array.isArray(response.data.orders)) {
          console.log('Retrieved user order history:', response.data.orders);
          
          const mappedOrders = response.data.orders.map((order: any) => ({
            id: order.order_id?.toString() || '',
            ticker: order.ticker || '',
            type: (order.order_type === 'buy' ? 'Buy' : 'Sell'),
            executionType: 'Market',
            price: parseFloat(order.price) || 0,
            size: parseInt(order.shares) || 0,
            status: 'Completed', // Order history only shows completed orders
            timestamp: new Date(order.created_at || Date.now()),
          }));
          
          setCompletedOrders(mappedOrders);
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
        toast.error('Failed to load order history data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderHistory();
    refreshUserData();
  }, [getUsername, refreshUserData]);
  
  const exportOrders = () => {
    // Mock export functionality
    console.log('Exporting orders:', completedOrders);
    const element = document.createElement('a');
    const file = new Blob(
      [JSON.stringify(completedOrders, null, 2)], 
      { type: 'application/json' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `order-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(element);
    element.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-1">
                View your completed orders and transaction history
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <button
                onClick={exportOrders}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6 mb-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Completed Orders</h2>
              
              <div className="mt-3 sm:mt-0 flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {format(new Date(), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <OrderTable 
              orders={completedOrders} 
              title="Completed Orders" 
              showFilters={false} 
            />
          </div>
          
          {completedOrders.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold mt-1">{completedOrders.length}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Buy Orders</p>
                  <p className="text-2xl font-bold mt-1 text-trade-green">
                    {completedOrders.filter(order => order.type === 'Buy').length}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Sell Orders</p>
                  <p className="text-2xl font-bold mt-1 text-trade-red">
                    {completedOrders.filter(order => order.type === 'Sell').length}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Average Order Size</p>
                  <p className="text-2xl font-bold mt-1">
                    {completedOrders.length > 0
                      ? (completedOrders.reduce((sum, order) => sum + order.size, 0) / completedOrders.length).toFixed(2)
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;
