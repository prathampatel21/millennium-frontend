
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'Buy',
    price: '',
    size: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
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
    
    // Clear error when user types
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
    
    setIsSubmitting(true);
    
    try {
      // Add new order
      addOrder({
        ticker: formData.ticker.toUpperCase(),
        type: formData.type as 'Buy' | 'Sell',
        price: Number(formData.price),
        size: Number(formData.size),
      });
      
      toast.success('Order submitted successfully', {
        description: `${formData.type} order for ${formData.size} ${formData.ticker.toUpperCase()} at $${formData.price}`,
        icon: <CheckCircle className="h-4 w-4" />,
      });
      
      // Reset form
      setFormData({
        ticker: '',
        type: 'Buy',
        price: '',
        size: '',
      });
      
      // Navigate to orders page after short delay
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      toast.error('Failed to submit order', {
        description: 'Please try again later',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass rounded-2xl p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD)
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
