
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import OrderTable from '../components/OrderTable';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Layers, ClipboardCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '../context/OrderContext';

const API_BASE_URL = 'http://127.0.0.1:5000';

const OrderStatus = () => {
  const { refreshUserData } = useOrders();
  const { getUsername } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchOrderStatus = async () => {
    try {
      const username = getUsername();
      if (!username) {
        toast.error('User information not available');
        setLoading(false);
        return;
      }
      
      console.log('Fetching order status for user:', username);
      const response = await axios.get(`${API_BASE_URL}/users/${username}/orders/status`);
      
      if (response.data && Array.isArray(response.data.orders)) {
        console.log('Retrieved user order status:', response.data.orders);
        
        const mappedOrders = response.data.orders.map((order: any) => {
          // Log each order to help with debugging
          console.log('Processing order:', order);
          
          // Ensure price and shares are properly parsed
          let price = 0;
          if (order.price !== undefined && order.price !== null) {
            price = typeof order.price === 'string' ? parseFloat(order.price) : order.price;
          } else if (order.execution_price !== undefined && order.execution_price !== null) {
            price = typeof order.execution_price === 'string' ? parseFloat(order.execution_price) : order.execution_price;
          }
          
          let shares = 0;
          if (order.shares !== undefined && order.shares !== null) {
            shares = typeof order.shares === 'string' ? parseInt(order.shares) : order.shares;
          } else if (order.child_shares !== undefined && order.child_shares !== null) {
            shares = typeof order.child_shares === 'string' ? parseInt(order.child_shares) : order.child_shares;
          }
          
          return {
            id: (order.order_id || order.parent_order_id || '').toString(),
            ticker: order.ticker || '',
            type: (order.order_type === 'buy' ? 'Buy' : 'Sell'),
            executionType: 'Market',
            price: price || 0,
            size: shares || 0,
            status: order.status === 'completed' ? 'Completed' : 
                    (order.status === 'processing' || order.parent_status === 'processing' ? 'Processing' : 'In-Progress'),
            timestamp: new Date(order.created_at || order.order_placement_time || Date.now()),
          };
        });
        
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      toast.error('Failed to load order status data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch order status data when component mounts
  useEffect(() => {
    fetchOrderStatus();
    refreshUserData();
    
    // Poll for updates every 10 seconds
    const intervalId = setInterval(() => {
      fetchOrderStatus();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [getUsername, refreshUserData]);
  
  const processingOrders = orders.filter(order => order.status === 'Processing');
  const inProgressOrders = orders.filter(order => order.status === 'In-Progress');
  const completedOrders = orders.filter(order => order.status === 'Completed');
  
  const getOrdersCount = (type: string) => {
    switch (type) {
      case 'processing':
        return processingOrders.length;
      case 'in-progress':
        return inProgressOrders.length;
      case 'completed':
        return completedOrders.length;
      default:
        return orders.length;
    }
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Order Status</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your active orders
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="glass rounded-xl p-5 flex items-center">
              <div className="w-12 h-12 rounded-full bg-trade-neutral/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-trade-neutral" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Processing</p>
                <h3 className="text-2xl font-bold text-gray-900">{getOrdersCount('processing')}</h3>
              </div>
            </div>
            
            <div className="glass rounded-xl p-5 flex items-center">
              <div className="w-12 h-12 rounded-full bg-trade/10 flex items-center justify-center">
                <Layers className="h-6 w-6 text-trade" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">In Progress</p>
                <h3 className="text-2xl font-bold text-gray-900">{getOrdersCount('in-progress')}</h3>
              </div>
            </div>
            
            <div className="glass rounded-xl p-5 flex items-center">
              <div className="w-12 h-12 rounded-full bg-trade-green/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-trade-green" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Completed</p>
                <h3 className="text-2xl font-bold text-gray-900">{getOrdersCount('completed')}</h3>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6 mb-10">
            <OrderTable orders={orders} title="All Orders" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatus;
