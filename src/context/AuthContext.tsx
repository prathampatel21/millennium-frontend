
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { getUsers, registerUser } from '../services/apiService';

export interface User {
  userID: number;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fetch users from API (or mock)
      const users = await getUsers();
      const user = users.find((u: any) => u.email === email);
      
      if (user) {
        // In a real app, would verify password hash
        const userData: User = {
          userID: user.userID,
          name: user.name,
          email: user.email
        };
        
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Logged in successfully');
        return true;
      } else {
        toast.error('Invalid credentials', {
          description: 'Email or password is incorrect',
          icon: <AlertCircle className="h-4 w-4" />,
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: 'Please try again later',
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return false;
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    try {
      // Simulate successful Google login (mock data)
      const googleUser = {
        name: "Google User",
        email: "google.user@example.com",
        picture: "https://ui-avatars.com/api/?name=Google+User&background=random"
      };
      
      // Check if user exists
      const users = await getUsers();
      const existingUser = users.find((u: any) => u.email === googleUser.email);
      
      if (existingUser) {
        // User exists, log them in
        const userData: User = {
          userID: existingUser.userID,
          name: existingUser.name,
          email: existingUser.email,
          picture: googleUser.picture
        };
        
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Logged in successfully');
        return true;
      } else {
        // User doesn't exist, register them
        try {
          const newUser = await registerUser({
            name: googleUser.name,
            email: googleUser.email
          });
          
          const userData: User = {
            userID: newUser.userID,
            name: newUser.name,
            email: newUser.email,
            picture: googleUser.picture
          };
          
          setCurrentUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success('Account created successfully');
          return true;
        } catch (registrationError) {
          console.error('Google registration error:', registrationError);
          toast.error('Account creation failed', {
            description: 'Could not create account with Google',
            icon: <AlertCircle className="h-4 w-4" />,
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed', {
        description: 'Please try again later',
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const users = await getUsers();
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        toast.error('User already exists', {
          description: 'Please login instead',
          icon: <AlertCircle className="h-4 w-4" />,
        });
        return false;
      }
      
      // Register new user
      const newUser = await registerUser({
        name,
        email,
        password
      });
      
      const userData: User = {
        userID: newUser.userID,
        name: newUser.name,
        email: newUser.email
      };
      
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Account created successfully');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: 'Please try again later',
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        googleLogin,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
