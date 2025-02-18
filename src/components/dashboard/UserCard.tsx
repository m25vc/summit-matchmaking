
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';
import { Badge } from "@/components/ui/badge";

type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type PriorityMatch = Database['public']['Tables']['priority_matches']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};

interface UserCardProps {
  user: UserWithDetails;
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null) => Promise<void>;
}

export const UserCard = ({ user, onPriorityChange }: UserCardProps) => {
  return (
    <Card key={user.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{user.first_name} {user.last_name}</CardTitle>
            <p className="text-sm text-gray-500">{user.company_name}</p>
          </div>
          <Badge variant={user.user_type === 'investor' ? 'secondary' : 'default'}>
            {user.user_type === 'investor' ? 'Investor' : 'Founder'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.user_type === 'investor' ? (
            <>
              <p>{user.investor_details?.firm_description}</p>
              {user.investor_details?.preferred_industries && (
                <p className="text-sm">
                  <strong>Industries:</strong> {user.investor_details.preferred_industries.join(', ')}
                </p>
              )}
              {user.investor_details?.preferred_stages && (
                <p className="text-sm">
                  <strong>Stages:</strong> {user.investor_details.preferred_stages.join(', ')}
                </p>
              )}
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
              <p>{user.founder_details?.company_description}</p>
              <p className="text-sm">
                <strong>Industry:</strong> {user.founder_details?.industry}
              </p>
              <p className="text-sm">
                <strong>Stage:</strong> {user.founder_details?.company_stage}
              </p>
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
          <div className="pt-4">
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
              <SelectTrigger>
                <SelectValue placeholder="Set priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                {user.priority_matches?.[0]?.priority && (
                  <SelectItem value="remove" className="text-red-600">Remove Match</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
