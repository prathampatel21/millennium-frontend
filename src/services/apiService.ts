
import { Order, OrderType, OrderStatus, OrderExecutionType } from '../context/OrderContext';

// Check if we're in a development environment with backend access
const isBackendAvailable = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isBackendAvailable ? 'http://localhost:5000/api' : '';

// Mock data for when backend is unavailable
const mockUsers = [
  {
    userID: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    account_balance: 10000
  }
];

let mockUserCounter = 2; // Start counter for new user IDs

// User interfaces
export interface User {
  userID: number;
  name: string;
  email: string;
  account_balance: number;
}

// Asset interface
export interface Asset {
  assetID: number;
  userID: number;
  ticker: string;
  quantity: number;
}

// User registration interface
export interface UserRegistration {
  name: string;
  email: string;
  password?: string;
  picture?: string;
}

// Utility function to handle API calls with fallback to mock data
const apiCall = async (url: string, options?: RequestInit) => {
  if (!isBackendAvailable) {
    // If backend is not available, return mock data
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => resolve({ ok: true }), 500);
    });
  }
  
  // If backend is available, make the actual request
  return fetch(url, options);
};

// User API
export const getUsers = async (): Promise<User[]> => {
  try {
    if (!isBackendAvailable) {
      return [...mockUsers];
    }
    
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [...mockUsers];
  }
};

export const getUser = async (userId: number): Promise<User> => {
  try {
    if (!isBackendAvailable) {
      const user = mockUsers.find(u => u.userID === userId);
      if (user) return { ...user };
      throw new Error('User not found');
    }
    
    const response = await fetch(`${API_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserBalance = async (userId: number, balance: number): Promise<void> => {
  try {
    if (!isBackendAvailable) {
      const userIndex = mockUsers.findIndex(u => u.userID === userId);
      if (userIndex >= 0) {
        mockUsers[userIndex].account_balance = balance;
        return;
      }
      throw new Error('User not found');
    }
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_balance: balance }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user balance');
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
};

export const registerUser = async (userData: UserRegistration): Promise<User> => {
  try {
    if (!isBackendAvailable) {
      // Check if user with this email already exists
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }
      
      // Create a new mock user
      const newUser = {
        userID: mockUserCounter++,
        name: userData.name,
        email: userData.email,
        account_balance: 10000
      };
      
      mockUsers.push(newUser);
      return { ...newUser };
    }
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        account_balance: 10000 // Default balance for new users
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register user');
    }
    
    return response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Order API
export const getOrders = async (userId?: number): Promise<Order[]> => {
  try {
    if (!isBackendAvailable) {
      // Return empty orders array for mock implementation
      return [];
    }
    
    const url = userId ? `${API_URL}/orders?userID=${userId}` : `${API_URL}/orders`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export interface CreateOrderPayload {
  ticker: string;
  size: number;
  type: OrderType;
  executionType: OrderExecutionType;
  price: number;
  userID: number;
}

export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
  try {
    if (!isBackendAvailable) {
      // Just return a mock order for now
      return {
        id: Math.floor(Math.random() * 1000),
        ticker: orderData.ticker,
        size: orderData.size,
        status: 'Processing',
        type: orderData.type,
        executionType: orderData.executionType,
        price: orderData.price,
        timestamp: new Date().toISOString(),
        userID: orderData.userID
      };
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    if (!isBackendAvailable) {
      // No-op for mock implementation
      return;
    }
    
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Asset API
export const getUserAssets = async (userId: number): Promise<Asset[]> => {
  try {
    if (!isBackendAvailable) {
      // Return mock assets
      return [
        { assetID: 1, userID: userId, ticker: 'AAPL', quantity: 10 },
        { assetID: 2, userID: userId, ticker: 'TSLA', quantity: 5 },
        { assetID: 3, userID: userId, ticker: 'MSFT', quantity: 8 }
      ];
    }
    
    const response = await fetch(`${API_URL}/assets?userID=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user assets');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};
