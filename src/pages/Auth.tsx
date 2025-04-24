
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import SignInForm from '@/components/auth/SignInForm';
import RegistrationForm from '@/components/auth/RegistrationForm';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    console.log("Auth: Component mounted, starting auth check");
    
    // Define a hard timeout to ensure we never get stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (isMounted.current && isAuthChecking) {
        console.log("Auth: Loading timeout triggered, forcing auth check completion");
        setIsAuthChecking(false);
      }
    }, 2000); // 2 second max wait time
    
    // Function to check authentication state
    const checkAuthState = async () => {
      // Prevent multiple auth checks if we're already redirecting
      if (redirectInProgress) {
        console.log("Auth: Redirect already in progress, skipping auth check");
        return;
      }
      
      try {
        console.log("Auth: Checking auth session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth: Error getting session:", error);
          if (isMounted.current) setIsAuthChecking(false);
          return;
        }
        
        // Only update state if component is still mounted
        if (!isMounted.current) {
          console.log("Auth: Component unmounted during auth check, stopping");
          return;
        }
        
        if (data?.session) {
          console.log("Auth: User is authenticated, checking profile");
          
          // Set redirecting flag to prevent further auth checks
          setRedirectInProgress(true);
          
          try {
            const profileTable = data.session.user.user_metadata?.user_type === 'founder' 
              ? 'founder_details' 
              : 'investor_details';
              
            if (!profileTable) {
              console.log("Auth: No user_type found, keeping on auth page");
              setIsAuthChecking(false);
              setRedirectInProgress(false);
              return;
            }
              
            const { data: profileData, error } = await supabase
              .from(profileTable)
              .select('*')
              .eq('profile_id', data.session.user.id)
              .maybeSingle();

            if (error) {
              console.error("Auth: Error fetching profile data:", error);
              if (isMounted.current) {
                setIsAuthChecking(false);
                setRedirectInProgress(false);
              }
              return;
            }

            if (!isMounted.current) {
              console.log("Auth: Component unmounted during profile check, stopping");
              return;
            }

            console.log("Auth: Profile check complete, redirecting if needed");
            if (!profileData) {
              console.log("Auth: Profile not complete, redirecting to profile completion");
              
              // Use a function to ensure we only redirect once
              const safeRedirect = () => {
                // Just to be extra safe, check again if mounted
                if (isMounted.current) {
                  // Use direct window location for more reliable navigation
                  window.location.href = '/profile';
                }
              };
              
              safeRedirect();
            } else {
              console.log("Auth: Profile complete, redirecting to dashboard");
              // Use direct window location for more reliable navigation
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error("Auth: Error checking profile:", error);
            if (isMounted.current) {
              setIsAuthChecking(false);
              setRedirectInProgress(false);
            }
          }
        } else {
          console.log("Auth: No authenticated user");
          if (isMounted.current) setIsAuthChecking(false);
        }
      } catch (error) {
        console.error("Auth: Authentication check error:", error);
        if (isMounted.current) setIsAuthChecking(false);
      }
    };

    // Start auth check immediately
    checkAuthState();

    // Add more safety timeouts at different intervals
    const shortSafetyTimer = setTimeout(() => {
      if (isMounted.current && isAuthChecking) {
        console.log("Auth: Short safety timeout triggered");
        setIsAuthChecking(false);
      }
    }, 3000);

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth: Auth state change event: ${event}`);
      
      if (!isMounted.current) {
        console.log("Auth: Component unmounted during state change, stopping");
        return;
      }
      
      // Don't process changes if we're already redirecting
      if (redirectInProgress) {
        console.log("Auth: Redirect in progress, ignoring auth state change");
        return;
      }
      
      // Only handle sign in/out events here
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth: User signed in via state change');
        // Set redirecting flag to prevent multiple redirects
        setRedirectInProgress(true);
        
        // Use direct window location for more reliable navigation
        window.location.href = '/profile';
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth: User signed out via state change');
        setIsAuthChecking(false);
      } else if (event === 'INITIAL_SESSION') {
        // Initial session event is handled by the checkAuthState function
        console.log('Auth: Initial session event received');
      }
    });

    // Cleanup function
    return () => {
      console.log("Auth: Component unmounting, cleaning up");
      isMounted.current = false;
      subscription.unsubscribe();
      clearTimeout(shortSafetyTimer);
      clearTimeout(loadingTimeout);
    };
  }, [navigate, redirectInProgress]);

  const handleAuthSuccess = () => {
    console.log("Auth: Auth success handler called");
    // Set redirecting flag to prevent multiple redirects 
    setRedirectInProgress(true);
    // Use direct window location for more reliable navigation
    window.location.href = '/dashboard';
  };

  return (
    <AuthContainer isLoading={isAuthChecking}>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
      </div>

      {isSignUp ? (
        <RegistrationForm
          loading={loading}
          setLoading={setLoading}
          onSuccess={handleAuthSuccess}
        />
      ) : (
        <SignInForm
          loading={loading}
          setLoading={setLoading}
          onSuccess={handleAuthSuccess}
        />
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </Button>
      </div>
    </AuthContainer>
  );
};

export default Auth;
