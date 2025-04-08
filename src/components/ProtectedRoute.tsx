
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, getUsername } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyUserInSupabase = async () => {
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
        
        console.log('Verifying user in Supabase database:', username);
        
        try {
          // Try to get user balance - this will fail if user doesn't exist
          const { data, error } = await supabase.rpc('get_user_balance', {
            p_username: username
          });
          
          if (error) {
            console.error('Supabase DB error:', error);
            
            // Handle both permission errors and missing table/view errors
            if (error.code === '42501' || error.code === '42P01') {
              console.log('Database permission issues or missing tables detected, but user is authenticated');
              toast.warning('Database configuration issues detected', {
                description: 'Some features may be limited. The application will continue to work with reduced functionality.',
                duration: 5000,
              });
              setAuthorized(true);
              setVerifying(false);
              return;
            }
            
            throw error;
          }
          
          console.log('User verification response:', data);
          setAuthorized(true);
        } catch (error: any) {
          // If we reach here, user doesn't exist in Supabase or there was another error
          console.log('User not found in Supabase or database error, creating new user with default balance of 20');
          
          try {
            // User doesn't exist in Supabase, create a new user with default balance of 20
            const { error: createError } = await supabase.rpc('create_user', {
              p_username: username,
              initial_balance: 20
            });
            
            if (createError) {
              // Handle both permission errors and missing table/view errors
              if (createError.code === '42501' || createError.code === '42P01') {
                console.log('Database permission or structure issues detected, but user is authenticated');
                toast.warning('Database configuration issues detected', {
                  description: 'Some features may be limited. The application will continue to work with reduced functionality.',
                  duration: 5000,
                });
                setAuthorized(true);
                setVerifying(false);
                return;
              }
              
              throw createError;
            }
            
            console.log('Created new user in Supabase');
            toast.success('Welcome! Your account has been created with $20 starting balance', {
              duration: 5000
            });
            setAuthorized(true);
          } catch (createError: any) {
            console.error('Error creating user in Supabase:', createError);
            
            // Still allow access if there are database permission or structure issues
            if (createError.code === '42501' || createError.code === '42P01') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
              toast.error('Failed to create user account', {
                description: 'Please try again later or contact support.',
                duration: 5000
              });
            }
          }
        }
      } catch (error: any) {
        console.error('Error verifying/creating user in Supabase database:', error);
        
        // If the user is authenticated but has database issues, still let them in
        // but with a warning toast
        if (user) {
          toast.warning('Database connection issues', {
            description: 'You are logged in but database access is limited. The application will continue to work with reduced functionality.',
            duration: 5000
          });
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } finally {
        setVerifying(false);
      }
    };
    
    if (!isLoading) {
      verifyUserInSupabase();
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
