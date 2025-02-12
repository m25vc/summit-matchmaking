
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileHeaderProps {
  profile: Profile | null;
  onCreateTestUsers: () => Promise<void>;
}

export const ProfileHeader = ({ profile, onCreateTestUsers }: ProfileHeaderProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}!</CardTitle>
      </CardHeader>
      <CardContent>
        {!profile?.first_name && (
          <Button onClick={() => window.location.href = '/profile'}>
            Complete Your Profile
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onCreateTestUsers}
          className="ml-4"
        >
          Create Test Users
        </Button>
      </CardContent>
    </Card>
  );
};
