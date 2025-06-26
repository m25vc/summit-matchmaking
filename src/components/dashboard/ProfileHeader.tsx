import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileHeaderProps {
  profile: Profile | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <div className="space-y-6">
      {!profile?.first_name && (
        <Button onClick={() => window.location.href = '/profile'}>
          Complete Your Profile
        </Button>
      )}
    </div>
  );
};
