import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { addOrder, balance } = useOrders();
  const { getUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'Buy',
    executionType: 'Market',
    price: '',
    size: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    }
    
    if (formData.executionType === 'Limit' && !formData.price) {
      newErrors.price = 'Limit price is required';
    } else if (formData.executionType === 'Limit' && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.size) {
      newErrors.size = 'Order size is required';
    } else if (isNaN(Number(formData.size)) || Number(formData.size) <= 0) {
      newErrors.size = 'Order size must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let orderPrice = Number(formData.price);
    if (formData.executionType === 'Market') {
      const marketPrices: Record<string, number> = {
        'AAPL': 174.79,
        'MSFT': 416.38,
        'NVDA': 950.02,
        'AMZN': 178.25,
        'TSLA': 177.56,
        'GOOG': 170.63,
        'META': 480.28,
      };
      
      const ticker = formData.ticker.toUpperCase();
      orderPrice = marketPrices[ticker] || (100 + Math.random() * 200);
    }
    
    setIsSubmitting(true);
    
    try {
      const username = getUsername();
      if (!username) {
        throw new Error('User not authenticated');
      }
      
      const amount = orderPrice * Number(formData.size);
      
      const orderResponse = await axios.post(`${API_BASE_URL}/orders/parent`, {
        ticker: formData.ticker.toUpperCase(),
        shares: Number(formData.size),
        type: formData.type.toLowerCase(),
        amount: amount,
        username: username
      });
      
      const parentOrderId = orderResponse.data.order_id;
      console.log('Created parent order with ID:', parentOrderId);
      
      const portfolioResponse = await axios.get(`${API_BASE_URL}/users/${username}/portfolio`);
      
      const orderSuccess = await addOrder({
        ticker: formData.ticker.toUpperCase(),
        type: formData.type as 'Buy' | 'Sell',
        executionType: formData.executionType as 'Market' | 'Limit',
        price: orderPrice,
        size: Number(formData.size),
      });
      
      if (orderSuccess) {
        toast.success('Order submitted successfully', {
          description: `${formData.type} ${formData.executionType} order for ${formData.size} ${formData.ticker.toUpperCase()} at $${orderPrice.toFixed(2)}`,
          icon: <CheckCircle className="h-4 w-4" />,
        });
        
        setFormData({
          ticker: '',
          type: 'Buy',
          executionType: 'Market',
          price: '',
          size: '',
        });
        
        setTimeout(() => {
          navigate('/orders');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      let errorMessage = 'Please try again later';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      
      toast.error('Failed to submit order', {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass rounded-2xl p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          Available balance: <span className="font-medium ml-1">${balance.toFixed(2)}</span>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">
            Ticker Symbol
          </label>
          <input
            id="ticker"
            name="ticker"
            type="text"
            placeholder="e.g. AAPL"
            value={formData.ticker}
            onChange={handleChange}
            className={`form-input ${errors.ticker ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
            disabled={isSubmitting}
          />
          {errors.ticker && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.ticker}
            </p>
          )}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Order Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
            disabled={isSubmitting}
          >
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="executionType" className="block text-sm font-medium text-gray-700">
            Execution Type
          </label>
          <select
            id="executionType"
            name="executionType"
            value={formData.executionType}
            onChange={handleChange}
            className="form-input"
            disabled={isSubmitting}
          >
            <option value="Market">Market Order</option>
            <option value="Limit">Limit Order</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.executionType === 'Market' 
              ? 'Market orders execute immediately at the current market price' 
              : 'Limit orders execute only at the specified price or better'}
          </p>
        </div>
        
        {formData.executionType === 'Limit' && (
          <div className="space-y-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Limit Price (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                className={`form-input pl-8 ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.price}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-1">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Order Size (Quantity)
          </label>
          <input
            id="size"
            name="size"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={formData.size}
            onChange={handleChange}
            className={`form-input ${errors.size ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
            disabled={isSubmitting}
          />
          {errors.size && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.size}
            </p>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <>
                Submit Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
