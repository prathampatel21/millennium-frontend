import React, { useEffect, useState, useCallback } from 'react';
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
  
  const fetchOrderStatus = useCallback(async () => {
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
          const orderId = order.order_id?.toString() || order.parent_order_id?.toString() || '';
          let price = 0;
          let shares = 0;
          
          if (order.price !== undefined && order.price !== null) {
            price = typeof order.price === 'number' ? order.price : parseFloat(String(order.price)) || 0;
          } else if (order.amount !== undefined && order.amount !== null && order.shares && order.shares > 0) {
            price = typeof order.amount === 'number' 
              ? order.amount / order.shares 
              : parseFloat(String(order.amount)) / parseInt(String(order.shares)) || 0;
          }
          
          if (order.shares !== undefined && order.shares !== null) {
            shares = typeof order.shares === 'number' ? order.shares : parseInt(String(order.shares)) || 0;
          }
          
          return {
            id: orderId,
            ticker: order.ticker || '',
            type: (order.order_type === 'buy' ? 'Buy' : 'Sell'),
            executionType: 'Market',
            price: price,
            size: shares,
            status: order.status === 'completed' ? 'Completed' : (order.status === 'processing' ? 'Processing' : 'In-Progress'),
            timestamp: new Date(order.created_at || order.order_time || Date.now()),
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
  }, [getUsername]);
  
  useEffect(() => {
    fetchOrderStatus();
    refreshUserData();
    
    const intervalId = setInterval(() => {
      fetchOrderStatus();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [getUsername, refreshUserData, fetchOrderStatus]);
  
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
            <OrderTable 
              orders={orders} 
              title="All Orders" 
              key="all-orders" 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatus;
