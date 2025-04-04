
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import OrderForm from '../components/OrderForm';
import StockCarousel from '../components/StockCarousel';
import { ArrowLeft } from 'lucide-react';

const CreateOrder = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              
              <div className="mt-6 text-center">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  New Transaction
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-3">Create Order</h1>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                  Fill in the details below to create a new trading order
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <StockCarousel />
            </div>
            
            <OrderForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateOrder;
