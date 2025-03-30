
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Define API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, getUsername } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyUserInMySQL = async () => {
      if (!user) {
        setVerifying(false);
        return;
      }
      
      try {
        const username = getUsername();
        if (!username) {
          setVerifying(false);
          return;
        }
        
        console.log('Verifying user in MySQL database:', username);
        
        try {
          // Try to get user balance - this will fail if user doesn't exist
          const response = await axios.get(`${API_BASE_URL}/users/${username}/balance`);
          console.log('User verification response:', response.data);
          setAuthorized(true);
        } catch (error) {
          console.log('User not found in MySQL, creating new user with default balance of 20');
          
          // User doesn't exist in MySQL, create a new user with default balance of 20
          const createResponse = await axios.post(`${API_BASE_URL}/users`, {
            username: username,
            initial_balance: 20
          });
          
          console.log('Created new user in MySQL:', createResponse.data);
          toast.success('Welcome! Your account has been created with $20 starting balance', {
            duration: 5000
          });
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Error verifying/creating user in MySQL database:', error);
        setAuthorized(false);
      } finally {
        setVerifying(false);
      }
    };
    
    if (!isLoading) {
      verifyUserInMySQL();
    }
  }, [user, isLoading, getUsername]);

  if (isLoading || verifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !authorized) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
