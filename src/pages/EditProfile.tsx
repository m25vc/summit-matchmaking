import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { FounderForm } from '@/components/forms/FounderForm';
import { InvestorForm } from '@/components/forms/InvestorForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCog } from 'lucide-react';

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
      // navigate('/dashboard'); // Removed to stay on profile page
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
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
        return;
      }

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
      // navigate('/dashboard'); // Removed to stay on profile page
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update profile");
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
  } : {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    firmName: profile.company_name || '',
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        {isEditing ? (
          <>
            {profile.user_type === 'founder' ? (
              <FounderForm
                defaultValues={founderDefaultValues}
                onSubmit={async (values) => {
                  await onFounderSubmit(values);
                  setIsEditing(false);
                }}
              />
            ) : profile.user_type === 'investor' ? (
              <InvestorForm
                defaultValues={investorDefaultValues}
                onSubmit={async (values) => {
                  await onInvestorSubmit(values);
                  setIsEditing(false);
                }}
              />
            ) : null}
            <button
              className="mt-6 inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-base font-medium text-gray-700 transition-colors"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
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

                    {investorDetails.investment_thesis && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Thesis</h3>
                        <p className="text-base text-gray-900 leading-relaxed">{investorDetails.investment_thesis}</p>
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
            <button
              className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium text-white transition-colors shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              <UserCog className="h-5 w-5 mr-2" />
              Edit Profile
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
