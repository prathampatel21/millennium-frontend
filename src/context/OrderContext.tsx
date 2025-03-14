
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type OrderType = 'Buy' | 'Sell';
export type OrderStatus = 'Processing' | 'In-Progress' | 'Completed';

export interface Order {
  id: string;
  ticker: string;
  type: OrderType;
  price: number;
  size: number;
  status: OrderStatus;
  timestamp: Date;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getCompletedOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      ticker: 'AAPL',
      type: 'Buy',
      price: 174.79,
      size: 10,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
    {
      id: '2',
      ticker: 'AMZN',
      type: 'Sell',
      price: 178.25,
      size: 5,
      status: 'In-Progress',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '3',
      ticker: 'MSFT',
      type: 'Buy',
      price: 416.38,
      size: 3,
      status: 'Processing',
      timestamp: new Date(), // Now
    },
    {
      id: '4',
      ticker: 'NVDA',
      type: 'Buy',
      price: 950.02,
      size: 2,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '5',
      ticker: 'TSLA',
      type: 'Sell',
      price: 177.56,
      size: 15,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  ]);

  const addOrder = (newOrder: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    const order: Order = {
      ...newOrder,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      status: 'Processing',
    };
    
    setOrders((prevOrders) => [order, ...prevOrders]);
    
    // Simulate order progress after adding
    setTimeout(() => {
      updateOrderStatus(order.id, 'In-Progress');
      
      // Simulate order completion
      setTimeout(() => {
        updateOrderStatus(order.id, 'Completed');
      }, 8000);
    }, 3000);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getCompletedOrders = () => {
    return orders.filter((order) => order.status === 'Completed');
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrdersByStatus,
        getCompletedOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
