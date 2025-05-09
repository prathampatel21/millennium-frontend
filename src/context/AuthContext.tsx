
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import axios from 'axios';

// Define API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUsername: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create user in MySQL database
  const createUserInMySQL = async (username: string) => {
    try {
      // Create user in MySQL with default balance of 10000
      const response = await axios.post(`${API_BASE_URL}/users`, {
        username: username,
        initial_balance: 10000 // Default balance
      });
      console.log('User created in MySQL database:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user in MySQL:', error);
      
      // If error contains "Duplicate entry", user already exists which is fine
      if (error.response?.data?.error?.includes('Duplicate entry')) {
        console.log('User already exists in MySQL database');
        return null;
      }
      
      // Show a more user-friendly error message
      toast.error('Error connecting to trading database', {
        description: 'User authentication successful, but database synchronization failed. Some features may be limited.',
      });
      
      return null;
    }
  };

  // Check if user exists in MySQL database
  const checkUserInMySQL = async (username: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${username}/balance`);
      console.log('User found in MySQL database:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('User not found in MySQL database, creating new user');
        return await createUserInMySQL(username);
      }
      
      console.error('Error checking user in MySQL:', error);
      
      // Show a more user-friendly error message
      toast.error('Error connecting to trading database', {
        description: 'Authentication successful, but database connection failed. Some features may be limited.',
      });
      
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // If user just signed in, check if they exist in MySQL
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const username = session.user.user_metadata.username || session.user.email;
              await checkUserInMySQL(username);
            } catch (error) {
              console.error('Error checking/creating user in MySQL:', error);
              toast.error('Error connecting to trading database', {
                description: 'Some features may be limited',
              });
            }
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // If user is already signed in, ensure they exist in MySQL
      if (session?.user) {
        setTimeout(async () => {
          try {
            const username = session.user.user_metadata.username || session.user.email;
            await checkUserInMySQL(username);
          } catch (error) {
            console.error('Error checking/creating user in MySQL:', error);
            toast.error('Error connecting to trading database', {
              description: 'Some features may be limited',
            });
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user exists in MySQL when signing in
      const username = data.user?.user_metadata.username || email;
      await checkUserInMySQL(username);
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error('Error signing in', {
        description: error.message,
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;
      
      // Create user in MySQL database when they sign up
      await createUserInMySQL(username);
      
      toast.success('Account created successfully', {
        description: 'Your account has been created and synchronized with the trading system',
      });
    } catch (error: any) {
      toast.error('Error creating account', {
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Error signing out', {
        description: error.message,
      });
    }
  };

  const getUsername = () => {
    return user?.user_metadata?.username || user?.email || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        getUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
