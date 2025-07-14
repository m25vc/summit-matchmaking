import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function MatchmakingGuide() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <Card className="bg-[#ffe5e8]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#8f0014]">
              <AlertCircle className="h-5 w-5 text-[#8f0014]" />
              How Matching Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-[#8f0014]">
              <p>
                As a founder, you can prioritize matches with investors who align with your goals. Simply set their priority level to indicate your interest.
              </p>
              <p>
                As an investor, you can prioritize matches with both founders and other investors. Set their priority level to indicate your interest in connecting.
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
    </DashboardLayout>
  );
} 