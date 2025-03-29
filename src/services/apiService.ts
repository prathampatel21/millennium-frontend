import { Order, OrderType, OrderStatus, OrderExecutionType } from '../context/OrderContext';

const API_URL = 'http://localhost:5000/api';

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

// User API
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const getUser = async (userId: number): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const updateUserBalance = async (userId: number, balance: number): Promise<void> => {
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
};

export const registerUser = async (userData: UserRegistration): Promise<User> => {
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
};

// Order API
export const getOrders = async (userId?: number): Promise<Order[]> => {
  const url = userId ? `${API_URL}/orders?userID=${userId}` : `${API_URL}/orders`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  return response.json();
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
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
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
};

// Asset API
export const getUserAssets = async (userId: number): Promise<Asset[]> => {
  const response = await fetch(`${API_URL}/assets?userID=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user assets');
  }
  
  return response.json();
};
