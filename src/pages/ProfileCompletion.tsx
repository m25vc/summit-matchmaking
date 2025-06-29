
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { FounderForm } from '@/components/forms/FounderForm';
import { InvestorForm } from '@/components/forms/InvestorForm';
import TimeSlotSelector from '@/components/auth/TimeSlotSelector';
import type { FounderFormValues, InvestorFormValues } from '@/schemas/profileSchemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Profile = Database['public']['Tables']['profiles']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [founderDetails, setFounderDetails] = useState<FounderDetails | null>(null);
  const [investorDetails, setInvestorDetails] = useState<InvestorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilityTimeSlots, setAvailabilityTimeSlots] = useState<{[date: string]: string[]}>({});
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error("Failed to load profile");
          return;
        }
        
        if (!profileData) {
          console.error('Profile not found');
          toast.error("Profile not found");
          navigate('/auth');
          return;
        }

        setProfile(profileData);

        // Get user metadata containing availability
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userData?.user?.user_metadata?.availability) {
          setAvailabilityTimeSlots(userData.user.user_metadata.availability);
        }

        // Load existing details if any
        if (profileData.user_type === 'founder') {
          const { data: founderData, error: founderError } = await supabase
            .from('founder_details')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle();
          
          if (founderError) {
            console.error('Error fetching founder details:', founderError);
          } else if (founderData) {
            setFounderDetails(founderData);
          }
        } else if (profileData.user_type === 'investor') {
          const { data: investorData, error: investorError } = await supabase
            .from('investor_details')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle();
          
          if (investorError) {
            console.error('Error fetching investor details:', investorError);
          } else if (investorData) {
            setInvestorDetails(investorData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const onFounderSubmit = async (values: FounderFormValues) => {
    try {
      const { error } = await supabase
        .from('founder_details')
        .upsert({
          profile_id: profile!.id,
          industry: values.industry,
          company_stage: values.companyStage,
          funding_stage: values.fundingStage,
          company_description: values.companyDescription,
          target_raise_amount: values.targetRaiseAmount ? parseInt(values.targetRaiseAmount) : null,
          company_website_url: values.companyWebsiteUrl || null,
          last_round_raised: values.lastRoundRaised || null,
          current_revenue: values.currentRevenue || null,
          next_raise_planned: values.nextRaisePlanned || null,
          linkedin_url: values.linkedinUrl || null,
          additional_notes: values.additionalNotes || null,
        });

      if (error) {
        console.error('Error updating founder details:', error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
    }
  };

  const onInvestorSubmit = async (values: InvestorFormValues) => {
    try {
      // Convert the geographicFocus array to a string if it exists and has elements
      const geographicFocusValue = values.geographicFocus && values.geographicFocus.length > 0
        ? values.geographicFocus[0] // Taking the first value from the array
        : null;

      const { error } = await supabase
        .from('investor_details')
        .upsert({
          profile_id: profile!.id,
          firm_description: values.firmDescription,
          investment_thesis: values.investmentThesis || null,
          min_investment_amount: values.minInvestmentAmount ? parseInt(values.minInvestmentAmount) : null,
          max_investment_amount: values.maxInvestmentAmount ? parseInt(values.maxInvestmentAmount) : null,
          preferred_industries: values.preferredIndustries,
          preferred_stages: values.preferredStages,
          firm_website_url: values.firmWebsiteUrl || null,
          firm_hq: values.firmHQ || null,
          geographic_focus: geographicFocusValue, // Converting array to string
          check_size: values.checkSize || null,
          linkedin_url: values.linkedinUrl || null,
          additional_notes: values.additionalNotes || null,
        });

      if (error) {
        console.error('Error updating investor details:', error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleTimeSlotComplete = async (slots: {[date: string]: string[]}) => {
    try {
      setLoading(true);
      // Store the time slots in the user's metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          availability: slots
        }
      });
      
      if (error) {
        throw error;
      }
      
      setAvailabilityTimeSlots(slots);
      toast.success("Availability updated successfully");
      setLoading(false);
      setActiveTab('profile');
    } catch (error) {
      console.error("Error saving time slots:", error);
      toast.error("Failed to save availability");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return null;
  }

  const founderDefaultValues = founderDetails ? {
    industry: founderDetails.industry,
    companyStage: founderDetails.company_stage,
    fundingStage: founderDetails.funding_stage,
    companyDescription: founderDetails.company_description,
    targetRaiseAmount: founderDetails.target_raise_amount?.toString() || '',
    companyWebsiteUrl: founderDetails.company_website_url || '',
    lastRoundRaised: founderDetails.last_round_raised || '',
    currentRevenue: founderDetails.current_revenue || '',
    nextRaisePlanned: founderDetails.next_raise_planned || '',
    linkedinUrl: founderDetails.linkedin_url || '',
    additionalNotes: founderDetails.additional_notes || '',
  } : undefined;

  const investorDefaultValues = investorDetails ? {
    firmDescription: investorDetails.firm_description,
    investmentThesis: investorDetails.investment_thesis || '',
    minInvestmentAmount: investorDetails.min_investment_amount?.toString() || '',
    maxInvestmentAmount: investorDetails.max_investment_amount?.toString() || '',
    preferredIndustries: investorDetails.preferred_industries || [],
    preferredStages: investorDetails.preferred_stages || [],
    firmWebsiteUrl: investorDetails.firm_website_url || '',
    firmHQ: investorDetails.firm_hq || '',
    geographicFocus: investorDetails.geographic_focus ? [investorDetails.geographic_focus] : [],
    checkSize: investorDetails.check_size || '',
    linkedinUrl: investorDetails.linkedin_url || '',
    additionalNotes: investorDetails.additional_notes || '',
  } : undefined;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          {founderDetails || investorDetails 
            ? "Update your profile information"
            : "Please provide additional information to complete your profile"}
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            {profile.user_type === 'founder' ? (
              <FounderForm 
                defaultValues={founderDefaultValues}
                onSubmit={onFounderSubmit} 
              />
            ) : profile.user_type === 'investor' ? (
              <InvestorForm 
                defaultValues={investorDefaultValues}
                onSubmit={onInvestorSubmit} 
              />
            ) : null}
          </TabsContent>
          
          <TabsContent value="availability">
            <TimeSlotSelector
              initialTimeSlots={availabilityTimeSlots} 
              onComplete={handleTimeSlotComplete}
              showBackButton={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
