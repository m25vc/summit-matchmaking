
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
  const authChecked = useRef(false);
  
  useEffect(() => {
    // Use a ref to ensure we only check auth status once
    if (authChecked.current) {
      return;
    }
    
    let mounted = true;
    authChecked.current = true;

    const checkForAuthSession = async () => {
      // Add a small delay to avoid race conditions with ProtectedRoute
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log("Auth: Checking auth session");
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
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
              
            const { data: profileData } = await supabase
              .from(profileTable)
              .select('*')
              .eq('profile_id', data.session.user.id)
              .maybeSingle();

            if (!profileData) {
              console.log("Auth: Profile not complete, redirecting to profile completion");
              navigate('/profile');
            } else {
              console.log("Auth: Profile complete, redirecting to dashboard");
              navigate('/dashboard');
            }
          } catch (error) {
            console.error("Auth: Error checking profile:", error);
            setIsAuthChecking(false);
          }
        } else {
          console.log("Auth: No authenticated user");
          setIsAuthChecking(false);
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Auth: Authentication check error:", error);
        setIsAuthChecking(false);
      }
    };

    checkForAuthSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleAuthSuccess = () => {
    // Reset auth check to allow redirect to work
    authChecked.current = false;
    navigate('/profile');
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
