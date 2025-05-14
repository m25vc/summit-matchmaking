
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { UserWithDetails } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileDialogProps {
  user: UserWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: any;
  onPriorityChange?: (user: UserWithDetails) => void;
}

export function UserProfileDialog({ 
  user, 
  open, 
  onOpenChange, 
  currentUser,
  onPriorityChange
}: UserProfileDialogProps) {
  if (!user) return null;
  
  // Check if user is part of team
  const isFounder = user?.user_type === 'founder';
  const hasTeam = isFounder && user?.founder_details?.team_id;
  const [teamName, setTeamName] = useState<string | null>(null);

  // Fetch team name if user has a team
  useEffect(() => {
    if (hasTeam && user?.founder_details?.team_id) {
      const fetchTeamName = async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('name')
          .eq('id', user.founder_details.team_id)
          .single();
          
        if (!error && data) {
          setTeamName(data.name);
        }
      };
      
      fetchTeamName();
    }
  }, [hasTeam, user?.founder_details?.team_id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user?.first_name} {user?.last_name}
          </DialogTitle>
          <DialogDescription>
            {user?.job_title} at {user?.company_name}
            {teamName && ` • Team ${teamName}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          {/* Bio Section */}
          {user.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Bio</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
          
          {/* Type-specific details */}
          {user.user_type === 'investor' ? (
            <div className="space-y-6">
              {/* Firm Description */}
              {user.investor_details?.firm_description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About the Firm</h3>
                  <p className="text-gray-700">{user.investor_details.firm_description}</p>
                </div>
              )}
              
              {/* Investment Thesis */}
              {user.investor_details?.investment_thesis && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Investment Thesis</h3>
                  <p className="text-gray-700">{user.investor_details.investment_thesis}</p>
                </div>
              )}
              
              {/* Investment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Industries */}
                {user.investor_details?.preferred_industries && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Preferred Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.investor_details.preferred_industries.map((industry, index) => (
                        <Badge key={index} variant="outline" className="bg-white">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Stages */}
                {user.investor_details?.preferred_stages && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Preferred Stages</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.investor_details.preferred_stages.map((stage, index) => (
                        <Badge key={index} variant="outline" className="bg-white">{stage}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Check Size */}
                {user.investor_details?.check_size && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Check Size</h4>
                    <p>{user.investor_details.check_size}</p>
                  </div>
                )}
                
                {/* Geographic Focus */}
                {user.investor_details?.geographic_focus && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Geographic Focus</h4>
                    <p>{user.investor_details.geographic_focus}</p>
                  </div>
                )}
                
                {/* Firm HQ */}
                {user.investor_details?.firm_hq && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Firm Headquarters</h4>
                    <p>{user.investor_details.firm_hq}</p>
                  </div>
                )}
              </div>
              
              {/* External Links */}
              <div className="flex flex-wrap gap-6 mt-4">
                {user.investor_details?.firm_website_url && (
                  <a 
                    href={user.investor_details.firm_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Firm Website
                  </a>
                )}
                {user.linkedin_url && (
                  <a 
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Company Description */}
              {user.founder_details?.company_description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About the Company</h3>
                  <p className="text-gray-700">{user.founder_details.company_description}</p>
                </div>
              )}
              
              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Industry */}
                {user.founder_details?.industry && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Industry</h4>
                    <Badge variant="outline" className="bg-white">{user.founder_details.industry}</Badge>
                  </div>
                )}
                
                {/* Stage */}
                {user.founder_details?.company_stage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Company Stage</h4>
                    <Badge variant="outline" className="bg-white">{user.founder_details.company_stage}</Badge>
                  </div>
                )}
                
                {/* Funding Stage */}
                {user.founder_details?.funding_stage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Funding Stage</h4>
                    <p>{user.founder_details.funding_stage}</p>
                  </div>
                )}
                
                {/* Target Raise */}
                {user.founder_details?.target_raise_amount && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Target Raise Amount</h4>
                    <p>${user.founder_details.target_raise_amount.toLocaleString()}</p>
                  </div>
                )}
                
                {/* Current Revenue */}
                {user.founder_details?.current_revenue && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Revenue</h4>
                    <p>{user.founder_details.current_revenue}</p>
                  </div>
                )}
                
                {/* Last Round */}
                {user.founder_details?.last_round_raised && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Last Round Raised</h4>
                    <p>{user.founder_details.last_round_raised}</p>
                  </div>
                )}
                
                {/* Next Raise */}
                {user.founder_details?.next_raise_planned && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Next Raise Planned</h4>
                    <p>{user.founder_details.next_raise_planned}</p>
                  </div>
                )}
              </div>
              
              {/* External Links */}
              <div className="flex flex-wrap gap-6 mt-4">
                {user.founder_details?.company_website_url && (
                  <a 
                    href={user.founder_details.company_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Company Website
                  </a>
                )}
                {user.linkedin_url && (
                  <a 
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Notes Section */}
          {(user.user_type === 'investor' && user.investor_details?.additional_notes) || 
           (user.user_type === 'founder' && user.founder_details?.additional_notes) ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
              <p className="text-gray-700">
                {user.user_type === 'investor' 
                  ? user.investor_details?.additional_notes 
                  : user.founder_details?.additional_notes}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
