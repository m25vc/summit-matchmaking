
import type { Database } from '@/integrations/supabase/types';
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

interface UserListViewProps {
  user: UserWithDetails;
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null) => Promise<void>;
}

export const UserListView = ({ user, onPriorityChange }: UserListViewProps) => {
  const getPriorityStyles = () => {
    const priority = user.priority_matches?.[0]?.priority;
    
    if (!priority) return {};
    
    switch (priority) {
      case 'high':
        return {
          borderColor: 'border-green-400',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'medium':
        return {
          borderColor: 'border-yellow-400',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
      case 'low':
        return {
          borderColor: 'border-red-400',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return {};
    }
  };

  const priorityStyles = getPriorityStyles();

  return (
    <div 
      className={`p-4 rounded-lg border ${priorityStyles.borderColor || 'border-border'} ${
        priorityStyles.bgColor || 'bg-background'
      } transition-colors`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
            <Badge variant={user.user_type === 'investor' ? 'secondary' : 'default'}>
              {user.user_type === 'investor' ? 'Investor' : 'Founder'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.company_name}</p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            {user.user_type === 'investor' ? (
              <>
                <div className="text-sm">
                  <span className="font-medium">Industries:</span>{' '}
                  {user.investor_details?.preferred_industries?.join(', ')}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Stages:</span>{' '}
                  {user.investor_details?.preferred_stages?.join(', ')}
                </div>
                {user.investor_details?.firm_website_url && (
                  <a 
                    href={user.investor_details.firm_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Firm Website
                  </a>
                )}
              </>
            ) : (
              <>
                <div className="text-sm">
                  <span className="font-medium">Industry:</span>{' '}
                  {user.founder_details?.industry}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Stage:</span>{' '}
                  {user.founder_details?.company_stage}
                </div>
                {user.founder_details?.company_website_url && (
                  <a 
                    href={user.founder_details.company_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Company Website
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        <Select
          value={user.priority_matches?.[0]?.priority || ''}
          onValueChange={(value: 'high' | 'medium' | 'low' | 'remove') => {
            if (value === 'remove') {
              onPriorityChange(user.id, null);
            } else {
              onPriorityChange(user.id, value);
            }
          }}
        >
          <SelectTrigger className={`w-[140px] ${priorityStyles.textColor}`}>
            <SelectValue placeholder="Set priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high" className="text-green-700">High Priority</SelectItem>
            <SelectItem value="medium" className="text-yellow-700">Medium Priority</SelectItem>
            <SelectItem value="low" className="text-red-700">Low Priority</SelectItem>
            {user.priority_matches?.[0]?.priority && (
              <SelectItem value="remove" className="text-gray-900">Remove Match</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

