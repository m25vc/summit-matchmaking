
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("ProtectedRoute: User is authenticated");
          setUser(session.user);
        } else {
          console.log("ProtectedRoute: No authenticated user found");
          setUser(null);
        }
      } catch (error) {
        console.error("ProtectedRoute: Error checking session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth listener only for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`ProtectedRoute: Auth state change: ${event}`);
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Initial check
    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-lg bg-white shadow-sm w-full max-w-md">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: Redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
