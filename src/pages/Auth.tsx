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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
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
  
  useEffect(() => {
    const checkForAuthSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          // User is authenticated, check if profile is complete
          try {
            const profileTable = data.session.user.user_metadata.user_type === 'founder' 
              ? 'founder_details' 
              : 'investor_details';
              
            const { data: profileData } = await supabase
              .from(profileTable)
              .select('*')
              .eq('profile_id', data.session.user.id)
              .maybeSingle();

            if (!profileData) {
              navigate('/profile');
            } else {
              navigate('/dashboard');
            }
          } catch (error) {
            console.error("Error checking profile:", error);
            setIsAuthChecking(false);
          }
        } else {
          setIsAuthChecking(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthChecking(false);
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
        
        const { data: profileData } = await supabase
          .from(data.user.user_metadata.user_type === 'founder' ? 'founder_details' : 'investor_details')
          .select('*')
          .eq('profile_id', data.user.id)
          .maybeSingle();

        if (!profileData) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  if (isAuthChecking) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
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
