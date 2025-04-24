import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import FounderRegistrationFields from "./FounderRegistrationFields";
import InvestorRegistrationFields from "./InvestorRegistrationFields";

interface RegistrationFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

const RegistrationForm = ({ loading, setLoading, onSuccess }: RegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [userType, setUserType] = useState<'founder' | 'investor'>('founder');
  
  const [firmName, setFirmName] = useState('');
  const [firmHQ, setFirmHQ] = useState('');
  const [investmentIndustries, setInvestmentIndustries] = useState('');
  const [investmentStages, setInvestmentStages] = useState('');
  const [geographicFocus, setGeographicFocus] = useState('');
  const [checkSize, setCheckSize] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [lastRoundRaised, setLastRoundRaised] = useState('');
  const [nextRaisePlanned, setNextRaisePlanned] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      
      onSuccess();
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
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
          <Select
            value={userType}
            onValueChange={(value: 'founder' | 'investor') => setUserType(value)}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="founder">Founder</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {userType === 'investor' ? (
          <InvestorRegistrationFields
            firmName={firmName}
            setFirmName={setFirmName}
            firmHQ={firmHQ}
            setFirmHQ={setFirmHQ}
            investmentIndustries={investmentIndustries}
            setInvestmentIndustries={setInvestmentIndustries}
            investmentStages={investmentStages}
            setInvestmentStages={setInvestmentStages}
            geographicFocus={geographicFocus}
            setGeographicFocus={setGeographicFocus}
            checkSize={checkSize}
            setCheckSize={setCheckSize}
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            loading={loading}
          />
        ) : (
          <FounderRegistrationFields
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyDescription={companyDescription}
            setCompanyDescription={setCompanyDescription}
            currentRevenue={currentRevenue}
            setCurrentRevenue={setCurrentRevenue}
            lastRoundRaised={lastRoundRaised}
            setLastRoundRaised={setLastRoundRaised}
            nextRaisePlanned={nextRaisePlanned}
            setNextRaisePlanned={setNextRaisePlanned}
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            loading={loading}
          />
        )}
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
};

export default RegistrationForm;
