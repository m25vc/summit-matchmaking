
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { FounderForm } from '@/components/forms/FounderForm';
import { InvestorForm } from '@/components/forms/InvestorForm';
import type { FounderFormValues, InvestorFormValues } from '@/schemas/profileSchemas';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

        if (profileError) throw profileError;
        
        if (!profileData) {
          toast.error("Profile not found");
          navigate('/auth');
          return;
        }

        setProfile(profileData);

        // Load existing details if any
        if (profileData.user_type === 'founder') {
          const { data } = await supabase
            .from('founder_details')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle();
          
          if (data) {
            // Pre-fill the form if data exists
            form.reset({
              industry: data.industry,
              companyStage: data.company_stage,
              fundingStage: data.funding_stage,
              companyDescription: data.company_description,
              targetRaiseAmount: data.target_raise_amount?.toString() || '',
              pitchDeckUrl: data.pitch_deck_url || '',
            });
          }
        } else {
          const { data } = await supabase
            .from('investor_details')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle();
          
          if (data) {
            // Pre-fill the form if data exists
            form.reset({
              firmDescription: data.firm_description,
              investmentThesis: data.investment_thesis || '',
              minInvestmentAmount: data.min_investment_amount?.toString() || '',
              maxInvestmentAmount: data.max_investment_amount?.toString() || '',
              preferredIndustries: (data.preferred_industries || []).join(', '),
              preferredStages: (data.preferred_stages || []).join(', '),
            });
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
          pitch_deck_url: values.pitchDeckUrl || null,
        });

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Error:', error);
    }
  };

  const onInvestorSubmit = async (values: InvestorFormValues) => {
    try {
      const { error } = await supabase
        .from('investor_details')
        .upsert({
          profile_id: profile!.id,
          firm_description: values.firmDescription,
          investment_thesis: values.investmentThesis || null,
          min_investment_amount: values.minInvestmentAmount ? parseInt(values.minInvestmentAmount) : null,
          max_investment_amount: values.maxInvestmentAmount ? parseInt(values.maxInvestmentAmount) : null,
          preferred_industries: values.preferredIndustries.split(',').map(s => s.trim()),
          preferred_stages: values.preferredStages.split(',').map(s => s.trim()),
        });

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Error:', error);
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          Please provide additional information to complete your profile
        </p>
        
        {profile.user_type === 'founder' ? (
          <FounderForm onSubmit={onFounderSubmit} />
        ) : (
          <InvestorForm onSubmit={onInvestorSubmit} />
        )}
      </div>
    </DashboardLayout>
  );
}
