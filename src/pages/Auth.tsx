
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import SignInForm from '@/components/auth/SignInForm';
import RegistrationForm from '@/components/auth/RegistrationForm';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    console.log("Auth: Component mounted, starting auth check");
    
    // Function to check authentication state
    const checkAuthState = async () => {
      try {
        console.log("Auth: Checking auth session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth: Error getting session:", error);
          throw error;
        }
        
        // Only update state if component is still mounted
        if (!isMounted.current) {
          console.log("Auth: Component unmounted during auth check, stopping");
          return;
        }
        
        if (data?.session) {
          console.log("Auth: User is authenticated, checking profile");
          try {
            const profileTable = data.session.user.user_metadata?.user_type === 'founder' 
              ? 'founder_details' 
              : 'investor_details';
              
            if (!profileTable) {
              console.log("Auth: No user_type found, keeping on auth page");
              setIsAuthChecking(false);
              return;
            }
              
            const { data: profileData, error } = await supabase
              .from(profileTable)
              .select('*')
              .eq('profile_id', data.session.user.id)
              .maybeSingle();

            if (error) {
              console.error("Auth: Error fetching profile data:", error);
              throw error;
            }

            if (!isMounted.current) {
              console.log("Auth: Component unmounted during profile check, stopping");
              return;
            }

            if (!profileData) {
              console.log("Auth: Profile not complete, redirecting to profile completion");
              // Use a more direct approach for navigation
              window.location.href = '/profile';
              return;
            } else {
              console.log("Auth: Profile complete, redirecting to dashboard");
              // Use a more direct approach for navigation
              window.location.href = '/dashboard';
              return;
            }
          } catch (error) {
            if (!isMounted.current) return;
            console.error("Auth: Error checking profile:", error);
            setIsAuthChecking(false);
          }
        } else {
          if (!isMounted.current) return;
          console.log("Auth: No authenticated user");
          setIsAuthChecking(false);
        }
      } catch (error) {
        if (!isMounted.current) return;
        console.error("Auth: Authentication check error:", error);
        setIsAuthChecking(false);
      }
    };

    // Start auth check immediately
    const authCheckTimer = setTimeout(checkAuthState, 100);

    // Add multiple safety timeouts at different intervals
    const shortSafetyTimer = setTimeout(() => {
      if (isMounted.current && isAuthChecking) {
        console.log("Auth: Short safety timeout triggered");
        setIsAuthChecking(false);
      }
    }, 3000);
    
    const longSafetyTimer = setTimeout(() => {
      if (isMounted.current && isAuthChecking) {
        console.log("Auth: Long safety timeout triggered");
        setIsAuthChecking(false);
      }
    }, 8000);

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth: Auth state change event: ${event}`);
      
      if (!isMounted.current) {
        console.log("Auth: Component unmounted during state change, stopping");
        return;
      }
      
      // Only handle sign in/out events here
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth: User signed in via state change');
        // Use a more direct approach for navigation
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
      clearTimeout(authCheckTimer);
      clearTimeout(shortSafetyTimer);
      clearTimeout(longSafetyTimer);
    };
  }, [navigate]);

  const handleAuthSuccess = () => {
    console.log("Auth: Auth success handler called");
    // Use a more direct approach for navigation that works better cross-browser
    window.location.href = '/profile';
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
