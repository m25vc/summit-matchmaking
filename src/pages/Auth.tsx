
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [userType, setUserType] = useState<'founder' | 'investor'>('founder');
  const [loading, setLoading] = useState(false);
  
  // Investor fields
  const [firmName, setFirmName] = useState('');
  const [firmHQ, setFirmHQ] = useState('');
  const [investmentIndustries, setInvestmentIndustries] = useState('');
  const [investmentStages, setInvestmentStages] = useState('');
  const [geographicFocus, setGeographicFocus] = useState('');
  const [checkSize, setCheckSize] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Founder fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [lastRoundRaised, setLastRoundRaised] = useState('');
  const [nextRaisePlanned, setNextRaisePlanned] = useState('');
  
  // Check for authentication on component mount and handle redirect from OAuth
  useEffect(() => {
    // Check if there's an access token in the URL (from OAuth redirect)
    const checkForAuthSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        // Check if user needs to complete their profile
        const { data: profileData } = await supabase
          .from(data.session.user.user_metadata.user_type === 'founder' ? 'founder_details' : 'investor_details')
          .select('*')
          .eq('profile_id', data.session.user.id)
          .single();

        if (!profileData) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    };

    checkForAuthSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              job_title: jobTitle,
              user_type: userType,
              company_name: userType === 'founder' ? companyName : firmName,
              // Additional metadata based on user type
              ...(userType === 'investor' 
                ? {
                    firm_hq: firmHQ,
                    investment_industries: investmentIndustries,
                    investment_stages: investmentStages,
                    geographic_focus: geographicFocus,
                    check_size: checkSize,
                    linkedin_url: linkedinUrl,
                    website_url: websiteUrl,
                  } 
                : {
                    company_description: companyDescription,
                    current_revenue: currentRevenue,
                    last_round_raised: lastRoundRaised,
                    next_raise_planned: nextRaisePlanned,
                    linkedin_url: linkedinUrl,
                    website_url: websiteUrl,
                  }
              )
            },
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        
        if (error) throw error;
        
        // Sign in the user immediately after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        navigate('/profile');
        toast.success("Account created successfully!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if user needs to complete their profile
        const { data: profileData } = await supabase
          .from(data.user.user_metadata.user_type === 'founder' ? 'founder_details' : 'investor_details')
          .select('*')
          .eq('profile_id', data.user.id)
          .single();

        if (!profileData) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      // The user will be redirected to Google for authentication,
      // and then back to the redirectTo URL
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Error signing in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
          </div>
        </div>

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

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <Input
                    id="jobTitle"
                    type="text"
                    required
                    placeholder="Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-700">I am a:</Label>
                  <RadioGroup
                    value={userType}
                    onValueChange={(value: 'founder' | 'investor') => setUserType(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="founder" id="founder" />
                      <Label htmlFor="founder">Founder</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="investor" id="investor" />
                      <Label htmlFor="investor">Investor</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {userType === 'investor' ? (
                  <>
                    <div>
                      <label htmlFor="firmName" className="block text-sm font-medium text-gray-700">
                        Firm Name
                      </label>
                      <Input
                        id="firmName"
                        type="text"
                        required
                        placeholder="Firm Name"
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="firmHQ" className="block text-sm font-medium text-gray-700">
                        Firm HQ Location (e.g., Chicago, IL)
                      </label>
                      <Input
                        id="firmHQ"
                        type="text"
                        placeholder="Firm HQ Location"
                        value={firmHQ}
                        onChange={(e) => setFirmHQ(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="investmentIndustries" className="block text-sm font-medium text-gray-700">
                        Investment Industries
                      </label>
                      <Input
                        id="investmentIndustries"
                        type="text"
                        placeholder="e.g., SaaS, Fintech, Healthcare"
                        value={investmentIndustries}
                        onChange={(e) => setInvestmentIndustries(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="investmentStages" className="block text-sm font-medium text-gray-700">
                        Investment Stages
                      </label>
                      <Input
                        id="investmentStages"
                        type="text"
                        placeholder="e.g., Seed, Series A"
                        value={investmentStages}
                        onChange={(e) => setInvestmentStages(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="geographicFocus" className="block text-sm font-medium text-gray-700">
                        Geographic Focus
                      </label>
                      <Input
                        id="geographicFocus"
                        type="text"
                        placeholder="e.g., Midwest, Global"
                        value={geographicFocus}
                        onChange={(e) => setGeographicFocus(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="checkSize" className="block text-sm font-medium text-gray-700">
                        Typical Check Size
                      </label>
                      <Input
                        id="checkSize"
                        type="text"
                        placeholder="e.g., $50K-$500K"
                        value={checkSize}
                        onChange={(e) => setCheckSize(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        type="text"
                        required
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
                        Company Description (one line)
                      </label>
                      <Textarea
                        id="companyDescription"
                        placeholder="Brief description of your company"
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastRoundRaised" className="block text-sm font-medium text-gray-700">
                        Most Recent Round Raised
                      </label>
                      <Input
                        id="lastRoundRaised"
                        type="text"
                        placeholder="e.g., Seed, Series A"
                        value={lastRoundRaised}
                        onChange={(e) => setLastRoundRaised(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="currentRevenue" className="block text-sm font-medium text-gray-700">
                        Current Annual Revenue Range
                      </label>
                      <Input
                        id="currentRevenue"
                        type="text"
                        placeholder="e.g., $100K-$500K"
                        value={currentRevenue}
                        onChange={(e) => setCurrentRevenue(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="nextRaisePlanned" className="block text-sm font-medium text-gray-700">
                        When Do You Plan to Raise Again?
                      </label>
                      <Input
                        id="nextRaisePlanned"
                        type="text"
                        placeholder="e.g., Q4 2024"
                        value={nextRaisePlanned}
                        onChange={(e) => setNextRaisePlanned(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
