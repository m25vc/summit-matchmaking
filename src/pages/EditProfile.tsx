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
          check_size: values.checkSize || null,
          linkedin_url: values.linkedinUrl || null,
          additional_notes: values.additionalNotes || null,
          leads_deals: values.leadsDeals,
          business_models: values.businessModels || [],
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
    email: profile.email || '',
    firmName: profile.company_name || '',
    firmDescription: investorDetails.firm_description,
    preferredIndustries: investorDetails.preferred_industries || [],
    preferredStages: investorDetails.preferred_stages || [],
    firmWebsiteUrl: investorDetails.firm_website_url || '',
    firmHQ: investorDetails.firm_hq || '',
    geographicFocus: Array.isArray(investorDetails.geographic_focus) ? investorDetails.geographic_focus : [],
    checkSize: typeof investorDetails.check_size === 'string' ? investorDetails.check_size : '',
    linkedinUrl: investorDetails.linkedin_url || '',
    additionalNotes: investorDetails.additional_notes || '',
    leadsDeals: (investorDetails as any)['leads_deals'] || 'Sometimes',
    businessModels: ((investorDetails as any)['business_models'] || []) as ('B2B' | 'B2C')[],
  } : {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    firmName: profile.company_name || '',
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

                {/* Investor Details Section */}
                {profile.user_type === 'investor' && investorDetails && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Information</h2>
                    <div className="space-y-3">
                      {investorDetails.firm_hq && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Firm HQ:</span>
                          <span className="text-base text-gray-900 sm:ml-4">{investorDetails.firm_hq}</span>
                        </div>
                      )}
                      {investorDetails.check_size && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Typical Check Size:</span>
                          <span className="text-base text-gray-900 sm:ml-4">{investorDetails.check_size}</span>
                        </div>
                      )}
                      {investorDetails.firm_website_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">Firm Website:</span>
                          <a href={investorDetails.firm_website_url} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:text-blue-800 sm:ml-4">
                            {investorDetails.firm_website_url}
                          </a>
                        </div>
                      )}
                      {investorDetails.linkedin_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm font-medium text-gray-700 sm:w-40 sm:flex-shrink-0">LinkedIn:</span>
                          <a href={investorDetails.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:text-blue-800 sm:ml-4">
                            {investorDetails.linkedin_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full-width sections for longer content */}
            {profile && (
              <div className="space-y-6">
                {/* Founder Details - Full Width */}
                {profile.user_type === 'founder' && founderDetails && (
                  <>
                    {founderDetails.company_description && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Description</h3>
                        <p className="text-base text-gray-900 leading-relaxed">{founderDetails.company_description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {founderDetails.last_round_raised && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Funding</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-700">Last Round:</span>
                              <span className="text-base text-gray-900">{founderDetails.last_round_raised}</span>
                            </div>
                            {founderDetails.current_revenue && (
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Current Revenue:</span>
                                <span className="text-base text-gray-900">{founderDetails.current_revenue}</span>
                              </div>
                            )}
                            {founderDetails.next_raise_planned && (
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Next Raise:</span>
                                <span className="text-base text-gray-900">{founderDetails.next_raise_planned}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {founderDetails.additional_notes && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2 lg:col-span-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                          <p className="text-base text-gray-900 leading-relaxed">{founderDetails.additional_notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Investor Details - Full Width */}
                {profile.user_type === 'investor' && investorDetails && (
                  <>
                    {investorDetails.firm_description && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Firm Description</h3>
                        <p className="text-base text-gray-900 leading-relaxed">{investorDetails.firm_description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {investorDetails.preferred_industries && investorDetails.preferred_industries.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Industries</h3>
                          <div className="flex flex-wrap gap-2">
                            {investorDetails.preferred_industries.map((industry, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {investorDetails.preferred_stages && investorDetails.preferred_stages.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Stages</h3>
                          <div className="flex flex-wrap gap-2">
                            {investorDetails.preferred_stages.map((stage, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {stage}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {investorDetails.geographic_focus && investorDetails.geographic_focus.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Geographic Focus</h3>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(investorDetails.geographic_focus) ? 
                              investorDetails.geographic_focus.map((geo, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                  {geo}
                                </span>
                              )) : (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                  {investorDetails.geographic_focus}
                                </span>
                              )
                            }
                          </div>
                        </div>
                      )}
                    </div>

                    {investorDetails.additional_notes && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                        <p className="text-base text-gray-900 leading-relaxed">{investorDetails.additional_notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
