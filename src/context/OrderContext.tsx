import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

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
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<boolean>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getCompletedOrders: () => Order[];
  refreshUserData: () => Promise<void>;
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
  const { user, getUsername } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalanceState] = useState<number>(0);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const username = getUsername();
      if (!username) {
        setLoading(false);
        return;
      }
      
      console.log('Fetching user data for:', username);
      
      // Fetch balance from MySQL
      const balanceResponse = await axios.get(`${API_BASE_URL}/users/${username}/balance`);
      
      if (balanceResponse.data && typeof balanceResponse.data.balance === 'number') {
        console.log('Retrieved user balance:', balanceResponse.data.balance);
        setBalanceState(balanceResponse.data.balance);
      }
      
      // Fetch order history from MySQL
      const orderHistoryResponse = await axios.get(`${API_BASE_URL}/users/${username}/orders/history`);
      
      if (orderHistoryResponse.data && Array.isArray(orderHistoryResponse.data.orders)) {
        console.log('Retrieved user order history:', orderHistoryResponse.data.orders);
        
        const mappedOrders = orderHistoryResponse.data.orders.map((order: any) => ({
          id: order.order_id.toString(),
          ticker: order.ticker || '',
          type: (order.order_type === 'buy' ? 'Buy' : 'Sell') as OrderType,
          executionType: 'Market' as OrderExecutionType,
          price: order.price || 0,
          size: order.shares || 0,
          status: order.status === 'completed' ? 'Completed' : 'In-Progress' as OrderStatus,
          timestamp: new Date(order.created_at || Date.now()),
        }));
        
        setOrders(mappedOrders);
      }
      
      // Fetch portfolio data from MySQL
      const portfolioResponse = await axios.get(`${API_BASE_URL}/users/${username}/portfolio`);
      
      if (portfolioResponse.data?.user_summary?.holdings && Array.isArray(portfolioResponse.data.user_summary.holdings)) {
        console.log('Retrieved user holdings:', portfolioResponse.data.user_summary.holdings);
        
        const mappedHoldings = portfolioResponse.data.user_summary.holdings.map((holding: any) => ({
          ticker: holding.ticker || '',
          quantity: holding.shares || 0,
        }));
        
        setHoldings(mappedHoldings);
      }
      
    } catch (error) {
      console.error('Error fetching user data in OrderContext:', error);
      toast.error('Failed to load user data', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setLoading(false);
    }
  }, [user, getUsername]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

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

  const addOrder = async (newOrder: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<boolean> => {
    if (!validateOrder(newOrder)) {
      return false;
    }
    
    try {
      const username = getUsername();
      if (!username) {
        toast.error('User information not available');
        return false;
      }
      
      // Create parent order in MySQL database
      const orderResponse = await axios.post(`${API_BASE_URL}/orders/parent`, {
        ticker: newOrder.ticker,
        shares: newOrder.size,
        type: newOrder.type.toLowerCase(),
        amount: newOrder.price * newOrder.size,
        username: username
      });
      
      console.log('Order created in MySQL:', orderResponse.data);
      
      // Refresh user data to get updated orders and balance
      await refreshUserData();
      
      toast.success('Order placed successfully', {
        description: `${newOrder.type} order for ${newOrder.size} ${newOrder.ticker} at $${newOrder.price.toFixed(2)}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order', {
        description: 'Please try again later',
      });
      return false;
    }
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

  const setBalance = async (newBalance: number) => {
    setBalanceState(newBalance);
  };

  if (loading && user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        refreshUserData,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
