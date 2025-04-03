
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import GlobeTrades from '../components/GlobeTrades';
import { BarChart3, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-16">
        <section className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Advanced Trading Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Trade with precision and <span className="text-primary">confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience seamless order management with our intuitive trading platform,
              designed to help you execute trades efficiently and track performance in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create-order"
                className="btn-primary flex items-center group"
              >
                Create Your First Order
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/orders"
                className="btn-secondary"
              >
                View Orders
              </Link>
            </div>
          </div>
        </section>
        
        {/* 3D Globe Visualization */}
        <section className="container mx-auto px-4 md:px-6 py-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Trading Activity</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch real-time trades happening around the world
            </p>
          </div>
          <GlobeTrades />
        </section>
        
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform offers everything you need for efficient and effective trading operations
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                <p className="text-gray-600">
                  Monitor your orders in real-time with instant status updates and detailed performance metrics.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Orders</h3>
                <p className="text-gray-600">
                  Create sophisticated trading strategies with our advanced order types and execution options.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Trading</h3>
                <p className="text-gray-600">
                  Trade with confidence on our secure platform with robust protection for your account and transactions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
