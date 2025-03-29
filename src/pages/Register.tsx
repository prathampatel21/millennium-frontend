
import React from 'react';
import Header from '@/components/Header';
import RegisterForm from '@/components/RegisterForm';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
};

export default Register;
