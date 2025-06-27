import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { FounderForm } from '@/components/forms/FounderForm';
import { InvestorForm } from '@/components/forms/InvestorForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCog } from 'lucide-react';
import type { FounderFormValues, InvestorFormValues } from '@/schemas/profileSchemas';

type Profile = Database['public']['Tables']['profiles']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];

export default function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [founderDetails, setFounderDetails] = useState<FounderDetails | null>(null);
  const [investorDetails, setInvestorDetails] = useState<InvestorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const founderFormRef = useRef<HTMLFormElement>(null);
  const investorFormRef = useRef<HTMLFormElement>(null);

  // Move fetchProfile out of useEffect so it can be called after save
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

  useEffect(() => {
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
        setIsSaving(false);
        return;
      }

      toast.success("Profile updated successfully");
      await fetchProfile();
      setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
      setIsSaving(false);
    }
  };

  const onInvestorSubmit = async (values: InvestorFormValues) => {
    try {
      // Update the main profile with personal information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          job_title: values.jobTitle,
          email: values.email,
          company_name: values.firmName, // Using company_name field for firm name
        })
        .eq('id', profile!.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error("Failed to update profile");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('investor_details')
        .upsert({
          profile_id: profile!.id,
          firm_description: values.firmDescription,
          preferred_industries: values.preferredIndustries || [],
          preferred_stages: values.preferredStages || [],
          firm_website_url: values.firmWebsiteUrl || null,
          firm_hq: values.firmHQ || null,
          geographic_focus: (values.geographicFocus || []) as any,
          check_size: Array.isArray(values.checkSize) ? values.checkSize : [],
          linkedin_url: values.linkedinUrl || null,
          additional_notes: values.additionalNotes || null,
          leads_deals: values.leadsDeals,
          business_models: values.businessModels || [],
          industries_specific: values.industriesSpecific || '',
          revenue_criteria: values.revenueCriteria || '',
          geography_specific: values.geographySpecific || '',
          check_size_specific: values.checkSizeSpecific || '',
        });

      if (error) {
        console.error('Error updating investor details:', error);
        toast.error("Failed to update profile");
        setIsSaving(false);
        return;
      }

      toast.success("Profile updated successfully");
      await fetchProfile();
      setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      // Trigger form submission based on user type
      if (profile?.user_type === 'founder' && founderFormRef.current) {
        const submitButton = founderFormRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      } else if (profile?.user_type === 'investor' && investorFormRef.current) {
        const submitButton = investorFormRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
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
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    jobTitle: profile.job_title || '',
    email: profile.email || '',
    firmName: profile.company_name || '',
    firmDescription: investorDetails.firm_description,
    preferredIndustries: investorDetails.preferred_industries || [],
    preferredStages: investorDetails.preferred_stages || [],
    firmWebsiteUrl: investorDetails.firm_website_url || '',
    firmHQ: investorDetails.firm_hq || '',
    geographicFocus: Array.isArray(investorDetails.geographic_focus) ? investorDetails.geographic_focus : [],
    checkSize: Array.isArray(investorDetails.check_size) ? investorDetails.check_size : [],
    linkedinUrl: investorDetails.linkedin_url || '',
    additionalNotes: investorDetails.additional_notes || '',
    leadsDeals: (investorDetails as any)['leads_deals'] || 'Sometimes',
    businessModels: ((investorDetails as any)['business_models'] || []) as ('B2B' | 'B2C')[],
    industriesSpecific: (investorDetails as any)['industries_specific'] || '',
    revenueCriteria: (investorDetails as any)['revenue_criteria'] || '',
    geographySpecific: (investorDetails as any)['geography_specific'] || '',
    checkSizeSpecific: (investorDetails as any)['check_size_specific'] || '',
  } : {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    jobTitle: profile.job_title || '',
    email: profile.email || '',
    firmName: profile.company_name || '',
    checkSize: [],
  };

  // Debug logging
  console.log('investorDetails:', investorDetails);
  console.log('investorDefaultValues:', investorDefaultValues);
  console.log('investorDefaultValues.businessModels:', investorDefaultValues.businessModels);

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Profile' : 'Profile'}
          </h1>
          {!isEditing && (
            <button
              className="inline-flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors shadow-sm"
              onClick={() => setIsEditing(true)}
              title="Edit Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {isEditing && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
        {isEditing ? (
          <>
            {profile.user_type === 'founder' ? (
              <FounderForm
                defaultValues={founderDefaultValues}
                showSubmitButton={false}
                onSubmit={async (values) => {
                  await onFounderSubmit(values);
                }}
                setIsSaving={setIsSaving}
                ref={founderFormRef}
              />
            ) : profile.user_type === 'investor' && investorDetails ? (
              <InvestorForm
                key={`investor-form-${isEditing}-${(investorDetails as any).profile_id}`}
                defaultValues={investorDefaultValues}
                showSubmitButton={false}
                onSubmit={async (values) => {
                  await onInvestorSubmit(values);
                }}
                setIsSaving={setIsSaving}
                ref={investorFormRef}
              />
            ) : null}
          </>
        ) : (
          <>
            {profile && (
              <>
                {/* Founder view: keep old layout */}
                {profile.user_type === 'founder' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-24 sm:flex-shrink-0">Name:</span>
                          <span className="text-base text-gray-900 sm:ml-4">{profile.first_name} {profile.last_name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-24 sm:flex-shrink-0">Email:</span>
                          <span className="text-base text-gray-900 sm:ml-4">{profile.email}</span>
                        </div>
                      </div>
                    </div>
                    {/* Founder Details Section */}
                    {profile.user_type === 'founder' && founderDetails && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
                        <div className="space-y-3">
                          {founderDetails.industry && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Industry:</span>
                              <span className="text-base text-gray-900 sm:ml-4">{founderDetails.industry}</span>
                            </div>
                          )}
                          {founderDetails.company_stage && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Company Stage:</span>
                              <span className="text-base text-gray-900 sm:ml-4">{founderDetails.company_stage}</span>
                            </div>
                          )}
                          {founderDetails.funding_stage && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Funding Stage:</span>
                              <span className="text-base text-gray-900 sm:ml-4">{founderDetails.funding_stage}</span>
                            </div>
                          )}
                          {founderDetails.target_raise_amount && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Target Raise Amount:</span>
                              <span className="text-base text-gray-900 sm:ml-4">${founderDetails.target_raise_amount}K</span>
                            </div>
                          )}
                          {founderDetails.company_website_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Company Website:</span>
                              <a href={founderDetails.company_website_url} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:text-blue-800 sm:ml-4">
                                {founderDetails.company_website_url}
                              </a>
                            </div>
                          )}
                          {founderDetails.linkedin_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">LinkedIn:</span>
                              <a href={founderDetails.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:text-blue-800 sm:ml-4">
                                {founderDetails.linkedin_url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Investor view: only render new grouped layout */}
                {profile.user_type === 'investor' && investorDetails && (
                  <div className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Personal Information
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-medium text-gray-500">First Name</div>
                            <div className="text-base text-gray-900 font-medium">{profile.first_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Last Name</div>
                            <div className="text-base text-gray-900 font-medium">{profile.last_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Job Title</div>
                            <div className="text-base text-gray-900 font-medium">{profile.job_title}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Email</div>
                            <div className="text-base text-gray-900 font-medium">{profile.email}</div>
                          </div>
                        </div>
                        {investorDetails.linkedin_url && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-500">LinkedIn Profile</div>
                            <a href={investorDetails.linkedin_url} target="_blank" rel="noopener noreferrer" 
                               className="text-base text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                              {investorDetails.linkedin_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Firm Overview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Firm Overview
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">Firm Name</div>
                            <div className="text-lg text-gray-900 font-semibold">{profile.company_name}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">Firm Website</div>
                            {investorDetails.firm_website_url ? (
                              <a href={investorDetails.firm_website_url} target="_blank" rel="noopener noreferrer" 
                                 className="text-base text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                                {investorDetails.firm_website_url}
                              </a>
                            ) : <span className="text-gray-400 italic">Not specified</span>}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">Firm HQ Location</div>
                            <div className="text-base text-gray-900">{investorDetails.firm_hq || <span className="text-gray-400 italic">Not specified</span>}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">Typical Check Size</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.check_size) && investorDetails.check_size.length > 0 ? 
                                investorDetails.check_size.map((size, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {size}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-3">Leads Deals</div>
                          <div className="text-base text-gray-900 leading-relaxed">
                            {investorDetails.leads_deals || <span className="text-gray-400 italic">Not specified</span>}
                          </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-3">Firm Description</div>
                          <div className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-4">
                            {investorDetails.firm_description || <span className="text-gray-400 italic">No description provided</span>}
                          </div>
                        </div>
                        {investorDetails.check_size_specific && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-500 mb-3">Specific Check Size Requirements</div>
                            <div className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-4">
                              {investorDetails.check_size_specific}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Investment Preferences */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Investment Preferences
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          {/* Preferred Stages */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">Preferred Investment Stages</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.preferred_stages) && investorDetails.preferred_stages.length > 0 ? 
                                investorDetails.preferred_stages.map((stage, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    {stage}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                          {/* Revenue Criteria */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">Revenue Criteria</div>
                            <div className="text-base text-gray-900 bg-gray-50 rounded-lg p-3 min-h-[80px]">
                              {investorDetails.revenue_criteria || <span className="text-gray-400 italic">Not specified</span>}
                            </div>
                          </div>
                          {/* Business Models */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">Business Models</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.business_models) && investorDetails.business_models.length > 0 ? 
                                investorDetails.business_models.map((model, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    {model}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                        </div>
                        {/* Preferred Industries */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <div className="text-sm font-medium text-gray-500 mb-4">Preferred Industries</div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(investorDetails.preferred_industries) && investorDetails.preferred_industries.length > 0 ? 
                              investorDetails.preferred_industries.map((industry, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                  {industry}
                                </span>
                              )) : 
                              <span className="text-gray-400 italic">Not specified</span>
                            }
                          </div>
                        </div>
                        {/* Other Industry Inclusion/Exclusion */}
                        {investorDetails.industries_specific && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-500 mb-3">Other Industry Inclusion / Exclusion</div>
                            <div className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-4">
                              {investorDetails.industries_specific}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Geographic Focus */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Geographic Focus
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Global & National */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">Global & National</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.geographic_focus) && investorDetails.geographic_focus.filter((v: string) => ["Global", "National"].includes(v)).length > 0 ? 
                                investorDetails.geographic_focus.filter((v: string) => ["Global", "National"].includes(v)).map((location, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {location}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                          {/* Regional */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">Regional</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.geographic_focus) && investorDetails.geographic_focus.filter((v: string) => v.startsWith("Regional")).length > 0 ? 
                                investorDetails.geographic_focus.filter((v: string) => v.startsWith("Regional")).map((region, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {region}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                          {/* US States */}
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-3">US States</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(investorDetails.geographic_focus) && investorDetails.geographic_focus.filter((v: string) => !["Global", "National"].includes(v) && !v.startsWith("Regional")).length > 0 ? 
                                investorDetails.geographic_focus.filter((v: string) => !["Global", "National"].includes(v) && !v.startsWith("Regional")).map((state, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {state}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">Not specified</span>
                              }
                            </div>
                          </div>
                        </div>
                        {/* Other Geographic Focus */}
                        {investorDetails.geography_specific && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-500 mb-3">Other Geographic Focus</div>
                            <div className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-4">
                              {investorDetails.geography_specific}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(investorDetails.additional_notes || '').trim() && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Additional Information
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-lg p-6">
                            {investorDetails.additional_notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
