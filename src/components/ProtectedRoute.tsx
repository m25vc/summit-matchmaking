
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true); // Assume profile is complete by default
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    
    // Add a hard timeout to ensure we never get stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("ProtectedRoute: Loading timeout triggered, forcing completion");
        setIsLoading(false);
      }
    }, 3000); // 3 second max wait time
    
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Checking session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log("ProtectedRoute: User is authenticated");
          setUser(session.user);
          
          // Only check profile if we're not already on the profile completion page
          if (location.pathname !== '/profile') {
            console.log("ProtectedRoute: Checking profile completion status");
            // Check if this is a profile page, if so we don't need to check completion
            try {
              const userType = session.user.user_metadata?.user_type || 'founder';
              const profileTable = userType === 'founder' ? 'founder_details' : 'investor_details';
              
              const { data: profileData, error } = await supabase
                .from(profileTable)
                .select('*')
                .eq('profile_id', session.user.id)
                .maybeSingle();
                
              if (error) {
                console.error("ProtectedRoute: Error checking profile:", error);
              } else {
                const isComplete = !!profileData;
                console.log(`ProtectedRoute: Profile complete: ${isComplete}`);
                setProfileComplete(isComplete);
              }
            } catch (err) {
              console.error("ProtectedRoute: Error in profile check:", err);
            }
          }
        } else {
          console.log("ProtectedRoute: No authenticated user found");
          setUser(null);
        }
      } catch (error) {
        if (!mounted) return;
        console.error("ProtectedRoute: Error checking session:", error);
        setUser(null);
      } finally {
        if (mounted) {
          // Add a small delay before setting loading to false to avoid flashing
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 100);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log(`ProtectedRoute: Auth state change: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        
        // For SIGNED_IN events, we don't want to immediately set isLoading to false
        // since the Auth page needs time to process the session first
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 300);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else {
        // For other events, we can set isLoading to false after a short delay
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 200);
      }
    });

    // Perform initial auth check
    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [location.pathname]);

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
    console.log("ProtectedRoute: No user, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we're already on the profile page, show the children
  // This prevents a redirect loop when the profile is incomplete
  if (!profileComplete && location.pathname !== '/profile') {
    console.log("ProtectedRoute: Profile incomplete, redirecting to profile completion");
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
