
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
      <Card>
        <CardContent className="pt-6">
          {!profile?.first_name && (
            <Button onClick={() => window.location.href = '/profile'}>
              Complete Your Profile
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            How Matching Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <p>
              {profile?.user_type === 'founder' ? (
                "As a founder, you can prioritize matches with investors who align with your goals. Simply set their priority level to indicate your interest."
              ) : (
                "As an investor, you can prioritize matches with both founders and other investors. Set their priority level to indicate your interest in connecting."
              )}
            </p>
            <p>
              When two users mutually prioritize each other, it's considered a match! You'll receive a calendar invite via email to schedule a meeting with your successful matches.
            </p>
            <p className="font-medium">
              Tip: You can mark up to 5 people as high priority to maximize your chances of meaningful connections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
