
import React from 'react';
import Header from '../components/Header';
import OrderTable from '../components/OrderTable';
import { useOrders } from '../context/OrderContext';
import { Layers, ClipboardCheck, Clock } from 'lucide-react';

const OrderStatus = () => {
  const { orders } = useOrders();
  
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
