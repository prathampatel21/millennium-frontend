
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
        
        // Verify user exists in MySQL
        await axios.get(`http://127.0.0.1:5000/users/${username}/balance`);
        setAuthorized(true);
      } catch (error) {
        console.error('Error verifying user in MySQL database:', error);
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
