
import type { UserWithDetails } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import { UserProfileDialog } from './UserProfileDialog';

interface UserCardProps {
  user: UserWithDetails;
  onPriorityChange: (
    userId: string, 
    priority: 'high' | 'medium' | 'low' | null, 
    notInterested?: boolean
  ) => Promise<void>;
}

export const UserCard = ({ user, onPriorityChange }: UserCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Define colors based on priority
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
  const hasNotInterested = user.priority_matches?.[0]?.not_interested;

  // Simple function to handle priority changes
  const handlePriorityChange = (value: string) => {
    if (value === 'remove') {
      onPriorityChange(user.id, null);
    } else if (value === 'not_interested') {
      onPriorityChange(user.id, null, true);
    } else {
      onPriorityChange(user.id, value as 'high' | 'medium' | 'low');
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening dialog when clicking on the priority select or links
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('select') || 
       e.target.closest('a') || 
       e.target.closest('button'))
    ) {
      return;
    }
    
    setDialogOpen(true);
  };

  return (
    <>
      <Card 
        key={user.id}
        className={`${priorityStyles.borderColor || ''} ${
          hasNotInterested ? 'opacity-50 border-red-400' : priorityStyles.bgColor || ''
        } transition-colors cursor-pointer hover:shadow-md`}
        onClick={handleCardClick}
      >
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
                <p className="line-clamp-3">{user.investor_details?.firm_description}</p>
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Firm Website
                  </a>
                )}
              </>
            ) : (
              <>
                <p className="line-clamp-3">{user.founder_details?.company_description}</p>
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Company Website
                  </a>
                )}
              </>
            )}
            <div className="pt-4">
              <Select
                value={hasNotInterested ? 'not_interested' : 
                  user.priority_matches?.[0]?.priority || ''}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger 
                  className={`w-[140px] ${
                    hasNotInterested ? 'text-red-700' : priorityStyles.textColor
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue 
                    placeholder={hasNotInterested ? 'Not Interested' : 'Set priority'} 
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-green-700">High Priority</SelectItem>
                  <SelectItem value="medium" className="text-yellow-700">Medium Priority</SelectItem>
                  <SelectItem value="low" className="text-red-700">Low Priority</SelectItem>
                  {user.priority_matches?.[0]?.priority && (
                    <SelectItem value="remove" className="text-gray-900">Remove Match</SelectItem>
                  )}
                  <SelectItem value="not_interested" className="text-red-900">
                    Not Interested
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <UserProfileDialog 
        user={user} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}
