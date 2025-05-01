
import type { Database } from '@/integrations/supabase/types';
import type { PriorityMatch } from '@/hooks/useAdminData';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];
export type FounderDetails = Database['public']['Tables']['founder_details']['Row'];

export type UserWithDetails = Profile & {
  investor_details?: InvestorDetails;
  founder_details?: FounderDetails;
  priority_matches?: PriorityMatch[];
};
