import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export type OrderType = 'Buy' | 'Sell';
export type OrderStatus = 'Processing' | 'In-Progress' | 'Completed';
export type OrderExecutionType = 'Market' | 'Limit';

export interface Order {
  id: string;
  ticker: string;
  type: OrderType;
  executionType: OrderExecutionType;
  price: number;
  size: number;
  status: OrderStatus;
  timestamp: Date;
}

interface StockHolding {
  ticker: string;
  quantity: number;
}

interface OrderContextType {
  orders: Order[];
  balance: number;
  setBalance: (balance: number) => void;
  holdings: StockHolding[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => boolean;
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
      executionType: 'Market',
      price: 174.79,
      size: 10,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
    {
      id: '2',
      ticker: 'AMZN',
      type: 'Sell',
      executionType: 'Limit',
      price: 178.25,
      size: 5,
      status: 'In-Progress',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '3',
      ticker: 'MSFT',
      type: 'Buy',
      executionType: 'Market',
      price: 416.38,
      size: 3,
      status: 'Processing',
      timestamp: new Date(), // Now
    },
    {
      id: '4',
      ticker: 'NVDA',
      type: 'Buy',
      executionType: 'Market',
      price: 950.02,
      size: 2,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '5',
      ticker: 'TSLA',
      type: 'Sell',
      executionType: 'Limit',
      price: 177.56,
      size: 15,
      status: 'Completed',
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  ]);

  const [balance, setBalanceState] = useState<number>(10000);
  const [holdings, setHoldings] = useState<StockHolding[]>([
    { ticker: 'AAPL', quantity: 10 },
    { ticker: 'MSFT', quantity: 3 },
    { ticker: 'NVDA', quantity: 2 },
    { ticker: 'TSLA', quantity: 15 },
  ]);

  const updateHoldings = (ticker: string, quantity: number, isBuy: boolean) => {
    setHoldings((prevHoldings) => {
      const existingHolding = prevHoldings.find(h => h.ticker === ticker);
      
      if (existingHolding) {
        return prevHoldings.map(h => 
          h.ticker === ticker 
            ? { ...h, quantity: isBuy ? h.quantity + quantity : h.quantity - quantity } 
            : h
        ).filter(h => h.quantity > 0);
      } else if (isBuy) {
        return [...prevHoldings, { ticker, quantity }];
      }
      
      return prevHoldings;
    });
  };

  const validateOrder = (newOrder: Omit<Order, 'id' | 'timestamp' | 'status'>): boolean => {
    const totalCost = newOrder.price * newOrder.size;
    
    if (newOrder.type === 'Buy' && totalCost > balance) {
      toast.error('Insufficient funds', {
        description: `You need $${totalCost.toFixed(2)} but only have $${balance.toFixed(2)}`,
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return false;
    }
    
    if (newOrder.type === 'Sell') {
      const stockHolding = holdings.find(h => h.ticker === newOrder.ticker);
      if (!stockHolding || stockHolding.quantity < newOrder.size) {
        toast.error('Insufficient holdings', {
          description: `You don't have enough ${newOrder.ticker} shares to sell`,
          icon: <AlertCircle className="h-4 w-4" />,
        });
        return false;
      }
    }
    
    return true;
  };

  const addOrder = (newOrder: Omit<Order, 'id' | 'timestamp' | 'status'>): boolean => {
    if (!validateOrder(newOrder)) {
      return false;
    }
    
    const order: Order = {
      ...newOrder,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      status: 'Processing',
    };
    
    setOrders((prevOrders) => [order, ...prevOrders]);
    
    if (order.type === 'Buy') {
      setBalanceState(prev => prev - (order.price * order.size));
    }
    
    setTimeout(() => {
      updateOrderStatus(order.id, 'In-Progress');
      
      setTimeout(() => {
        updateOrderStatus(order.id, 'Completed');
        
        if (order.type === 'Buy') {
          updateHoldings(order.ticker, order.size, true);
        } else if (order.type === 'Sell') {
          updateHoldings(order.ticker, order.size, false);
          setBalanceState(prev => prev + (order.price * order.size));
        }
      }, 8000);
    }, 3000);
    
    return true;
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

  const setBalance = (newBalance: number) => {
    setBalanceState(newBalance);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        balance,
        setBalance,
        holdings,
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
