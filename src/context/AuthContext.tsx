
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

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
      // For now, simple check - would be replaced with real API call
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const users = await response.json();
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
      // Simulate OAuth popup and redirect
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // In a real implementation, this would open the Google OAuth URL
      window.open(
        'about:blank',
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Simulate successful Google login (mock data)
      // In a real implementation, this would come from the OAuth response
      const googleUser = {
        name: "Google User",
        email: "google.user@example.com",
        picture: "https://ui-avatars.com/api/?name=Google+User&background=random"
      };
      
      // Check if user exists in database
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const users = await response.json();
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
        const registerResponse = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: googleUser.name,
            email: googleUser.email,
            account_balance: 10000 // Default balance for new users
          }),
        });
        
        if (!registerResponse.ok) {
          throw new Error('Failed to register new user');
        }
        
        const newUser = await registerResponse.json();
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
      const checkResponse = await fetch('http://localhost:5000/api/users');
      if (!checkResponse.ok) {
        throw new Error('Failed to check for existing users');
      }
      
      const users = await checkResponse.json();
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        toast.error('User already exists', {
          description: 'Please login instead',
          icon: <AlertCircle className="h-4 w-4" />,
        });
        return false;
      }
      
      // In a real app, would hash password before sending
      const registerResponse = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          account_balance: 10000 // Default balance for new users
        }),
      });
      
      if (!registerResponse.ok) {
        throw new Error('Failed to register new user');
      }
      
      const newUser = await registerResponse.json();
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
