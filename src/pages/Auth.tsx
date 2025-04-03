
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    // Redirect to profile if already logged in
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (isSignUp && !formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    return true;
  };

  // Check if username already exists
  const checkUsernameExists = async (username: string) => {
    try {
      // First check if the username exists in supabase
      const { data, error } = await supabase.rpc('get_user_balance', {
        p_username: username
      });
      
      if (!error) {
        // If no error, then the username exists
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        // Check if username already exists
        const usernameExists = await checkUsernameExists(formData.username);
        if (usernameExists) {
          toast.error('Username already taken', {
            description: 'Please choose another username',
            icon: <AlertTriangle className="h-4 w-4" />
          });
          setIsSubmitting(false);
          return;
        }

        await signUp(formData.email, formData.password, formData.username);
        setIsVerificationSent(true);
      } else {
        await signIn(formData.email, formData.password);
        navigate('/profile');
      }
    } catch (error) {
      // Errors are handled in the auth functions
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account created!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please check your email to verify your account.
          </p>
          <div className="mt-8 glass rounded-lg py-8 px-4 shadow sm:px-10">
            <p className="text-center text-gray-600 mb-4">
              Once verified, you can sign in with your credentials.
            </p>
            <button
              onClick={() => {
                setIsVerificationSent(false);
                setIsSignUp(false);
              }}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go to Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass rounded-lg py-8 px-4 shadow sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="py-2 pl-10 block w-full shadow-sm rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="py-2 pl-10 block w-full shadow-sm rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="py-2 pl-10 block w-full shadow-sm rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                    placeholder="johndoe"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Sign up' : 'Sign in'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
