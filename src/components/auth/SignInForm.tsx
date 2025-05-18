
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import TimeSlotSelector from "./TimeSlotSelector";

interface SignInFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

const SignInForm = ({ loading, setLoading, onSuccess }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showTimeSlotSelector, setShowTimeSlotSelector] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<{[date: string]: string[]}>({});
  const isProcessing = useRef(false);
  
  // Clean up auth state to prevent conflicts
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log("Auth: All auth state cleaned up");
  };
  
  // Run cleanup on component mount for a fresher state
  useEffect(() => {
    console.log("Auth: SignInForm mounted, cleaning up any stale auth state");
    // Add a small timeout to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      cleanupAuthState();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're already showing the time slot selector, return
    if (showTimeSlotSelector) return;
    
    // Prevent multiple submissions
    if (isProcessing.current) {
      console.log("Auth: Sign-in already in progress, ignoring duplicate submit");
      return;
    }
    
    isProcessing.current = true;
    setLoading(true);
    setSubmitAttempted(true);

    try {
      console.log("Auth: Cleaning up existing auth state");
      cleanupAuthState();
      
      // Try global sign out to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.log("Auth: Pre-signin signout attempt failed, continuing", signOutError);
        // Continue with sign-in even if this fails
      }
      
      console.log("Auth: Attempting to sign in with email");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Auth: Sign-in error", error);
        throw error;
      }
      
      if (!data?.session) {
        console.error("Auth: No session returned after successful sign-in");
        throw new Error("No session returned. Please try again.");
      }
      
      console.log("Auth: Sign-in successful, session created", data.session.user.id);
      
      // Verify the session was stored properly
      const checkSession = await supabase.auth.getSession();
      if (!checkSession.data?.session) {
        console.warn("Auth: Session verification failed, trying to store manually");
        // Session might not be stored properly, let's try to remedy this
        try {
          await supabase.auth.setSession(data.session);
          console.log("Auth: Session manually set");
        } catch (sessionError) {
          console.error("Auth: Failed to manually set session", sessionError);
          // Continue anyway, the onSuccess might force a redirect which will refresh auth state
        }
      }
      
      setLoading(false);
      isProcessing.current = false;
      
      // Show time slot selector instead of redirecting
      setShowTimeSlotSelector(true);
    } catch (error) {
      console.error("Auth: Error in sign-in process", error);
      isProcessing.current = false;
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Please check your email and confirm your account before signing in.");
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
      
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  const handleTimeSlotComplete = async (slots: {[date: string]: string[]}) => {
    setSelectedTimeSlots(slots);
    setLoading(true);
    
    try {
      // Store the time slots in the user's metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          availability: slots
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Time slots saved successfully!");
      
      // Add a small delay to ensure state updates complete
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      console.error("Error saving time slots:", error);
      toast.error("Failed to save time slots. Please try again.");
      setLoading(false);
    }
  };

  // Go back to sign in form
  const handleBackToSignIn = () => {
    setShowTimeSlotSelector(false);
  };
  
  if (showTimeSlotSelector) {
    return (
      <TimeSlotSelector 
        onComplete={handleTimeSlotComplete} 
        onBack={handleBackToSignIn}
      />
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
