
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">
              Register to start trading on our platform
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
