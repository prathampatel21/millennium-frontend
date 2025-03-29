
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { 
  getUser, 
  getOrders, 
  createOrder as apiCreateOrder, 
  updateOrderStatus as apiUpdateOrderStatus,
  getUserAssets,
  updateUserBalance as apiUpdateUserBalance
} from '../services/apiService';

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
  userId: number;
  refreshData: () => Promise<void>;
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
  // Default user ID (in a real app, this would come from authentication)
  const [userId] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<number>(10000);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user data
      const userData = await getUser(userId);
      setBalance(userData.account_balance);
      
      // Fetch user's orders
      const ordersData = await getOrders(userId);
      setOrders(ordersData.map(order => ({
        ...order,
        timestamp: new Date(order.timestamp)
      })));
      
      // Fetch user's assets
      const assetsData = await getUserAssets(userId);
      setHoldings(assetsData.map(asset => ({
        ticker: asset.ticker,
        quantity: asset.quantity
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data', {
        description: 'Please check your connection to the backend server',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [userId]);

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
    // Validate the order first
    if (!validateOrder(newOrder)) {
      return false;
    }
    
    // Create a temporary order to show in UI immediately
    const tempOrder: Order = {
      ...newOrder,
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      status: 'Processing',
    };
    
    setOrders((prevOrders) => [tempOrder, ...prevOrders]);
    
    // Send order to API
    apiCreateOrder({
      ticker: newOrder.ticker,
      size: newOrder.size,
      type: newOrder.type,
      executionType: newOrder.executionType,
      price: newOrder.price,
      userID: userId
    })
      .then(createdOrder => {
        // Update local orders with the server response
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === tempOrder.id 
              ? { ...createdOrder, timestamp: new Date(createdOrder.timestamp) } 
              : order
          )
        );
        
        // Simulate order progress after adding
        setTimeout(() => {
          updateOrderStatus(createdOrder.id, 'In-Progress');
          
          // Simulate order completion
          setTimeout(() => {
            updateOrderStatus(createdOrder.id, 'Completed');
          }, 8000);
        }, 3000);
      })
      .catch(error => {
        console.error('Error creating order:', error);
        toast.error('Failed to create order', {
          description: error.message || 'Please try again later',
          icon: <AlertCircle className="h-4 w-4" />,
        });
        
        // Remove the temporary order on error
        setOrders(prevOrders => prevOrders.filter(order => order.id !== tempOrder.id));
        return false;
      });
    
    return true;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    // Update the UI immediately
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
    
    // Update on the server
    apiUpdateOrderStatus(id, status)
      .then(() => {
        // If completed, refresh all data to ensure consistency
        if (status === 'Completed') {
          refreshData();
        }
      })
      .catch(error => {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status', {
          description: 'Please try again later',
          icon: <AlertCircle className="h-4 w-4" />,
        });
      });
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getCompletedOrders = () => {
    return orders.filter((order) => order.status === 'Completed');
  };

  const handleSetBalance = async (newBalance: number) => {
    // Update UI immediately
    setBalance(newBalance);
    
    try {
      // Update on the server
      await apiUpdateUserBalance(userId, newBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance', {
        description: 'Please try again later',
        icon: <AlertCircle className="h-4 w-4" />,
      });
      
      // Revert on error
      refreshData();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        balance,
        setBalance: handleSetBalance,
        holdings,
        addOrder,
        updateOrderStatus,
        getOrdersByStatus,
        getCompletedOrders,
        userId,
        refreshData,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
