
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface SignInFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

const SignInForm = ({ loading, setLoading, onSuccess }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitAttempted(true);
    
    // Set a timeout to prevent infinite loading state
    timeoutRef.current = setTimeout(() => {
      console.log("Auth: Sign-in attempt timed out after 8 seconds");
      setLoading(false);
      setSubmitAttempted(false);
      toast.error("Sign in is taking longer than expected. Please try again.");
    }, 8000);

    try {
      console.log("Auth: Attempting to sign in with email");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Auth: Sign-in error", error);
        throw error;
      }
      
      console.log("Auth: Sign-in successful, session created");
      
      // Clear the timeout since we got a successful response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Add a small delay before executing onSuccess to ensure auth state is updated
      setTimeout(() => {
        console.log("Auth: Executing onSuccess callback");
        onSuccess();
      }, 500);
    } catch (error) {
      console.error("Auth: Error in sign-in process", error);
      toast.error(error.message || "Failed to sign in");
      
      // Clear the timeout and reset loading state since we already handled the error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

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
