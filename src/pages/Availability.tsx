import DashboardLayout from '@/components/DashboardLayout';
import TimeSlotSelector from '@/components/auth/TimeSlotSelector';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [unavailableSlots, setUnavailableSlots] = useState<{[date: string]: string[]}>({});

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.availability) {
        setUnavailableSlots(user.user_metadata.availability);
      }
      setLoading(false);
    };
    fetchAvailability();
  }, []);

  const handleComplete = async (slots: {[date: string]: string[]}) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { availability: slots } });
    if (error) {
      toast.error('Failed to save unavailability');
    } else {
      toast.success('Unavailability saved successfully');
      setUnavailableSlots(slots);
    }
    setLoading(false);
  };

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="text-lg">Loading...</div></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-bold">Set Your Unavailability</h1>
        <TimeSlotSelector
          initialTimeSlots={unavailableSlots}
          onComplete={handleComplete}
          showBackButton={false}
        />
      </div>
    </DashboardLayout>
  );
} 