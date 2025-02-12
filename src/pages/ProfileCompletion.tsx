
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type FounderDetails = Database['public']['Tables']['founder_details']['Row'];
type InvestorDetails = Database['public']['Tables']['investor_details']['Row'];

const founderFormSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
  companyDescription: z.string().min(10, "Please provide a longer description"),
  targetRaiseAmount: z.string().optional(),
  pitchDeckUrl: z.string().url().optional().or(z.literal("")),
});

const investorFormSchema = z.object({
  firmDescription: z.string().min(10, "Please provide a longer description"),
  investmentThesis: z.string().optional(),
  minInvestmentAmount: z.string().optional(),
  maxInvestmentAmount: z.string().optional(),
  preferredIndustries: z.string().min(1, "Please specify preferred industries"),
  preferredStages: z.string().min(1, "Please specify preferred stages"),
});

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const founderForm = useForm<z.infer<typeof founderFormSchema>>({
    resolver: zodResolver(founderFormSchema),
  });

  const investorForm = useForm<z.infer<typeof investorFormSchema>>({
    resolver: zodResolver(investorFormSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(data);

        // Fetch existing details if any
        if (data?.user_type === 'founder') {
          const { data: founderData } = await supabase
            .from('founder_details')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (founderData) {
            founderForm.reset({
              industry: founderData.industry,
              companyStage: founderData.company_stage,
              fundingStage: founderData.funding_stage,
              companyDescription: founderData.company_description,
              targetRaiseAmount: founderData.target_raise_amount?.toString() || '',
              pitchDeckUrl: founderData.pitch_deck_url || '',
            });
          }
        } else {
          const { data: investorData } = await supabase
            .from('investor_details')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (investorData) {
            investorForm.reset({
              firmDescription: investorData.firm_description,
              investmentThesis: investorData.investment_thesis || '',
              minInvestmentAmount: investorData.min_investment_amount?.toString() || '',
              maxInvestmentAmount: investorData.max_investment_amount?.toString() || '',
              preferredIndustries: (investorData.preferred_industries || []).join(', '),
              preferredStages: (investorData.preferred_stages || []).join(', '),
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onFounderSubmit = async (values: z.infer<typeof founderFormSchema>) => {
    try {
      const { error } = await supabase
        .from('founder_details')
        .upsert({
          profile_id: profile!.id,
          industry: values.industry,
          company_stage: values.companyStage,
          funding_stage: values.fundingStage,
          company_description: values.companyDescription,
          target_raise_amount: values.targetRaiseAmount ? parseInt(values.targetRaiseAmount) : null,
          pitch_deck_url: values.pitchDeckUrl || null,
        });

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Error:', error);
    }
  };

  const onInvestorSubmit = async (values: z.infer<typeof investorFormSchema>) => {
    try {
      const { error } = await supabase
        .from('investor_details')
        .upsert({
          profile_id: profile!.id,
          firm_description: values.firmDescription,
          investment_thesis: values.investmentThesis || null,
          min_investment_amount: values.minInvestmentAmount ? parseInt(values.minInvestmentAmount) : null,
          max_investment_amount: values.maxInvestmentAmount ? parseInt(values.maxInvestmentAmount) : null,
          preferred_industries: values.preferredIndustries.split(',').map(s => s.trim()),
          preferred_stages: values.preferredStages.split(',').map(s => s.trim()),
        });

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to update profile");
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        
        {profile?.user_type === 'founder' ? (
          <Form {...founderForm}>
            <form onSubmit={founderForm.handleSubmit(onFounderSubmit)} className="space-y-4">
              <FormField
                control={founderForm.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SaaS, Fintech, Healthcare" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={founderForm.control}
                name="companyStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Stage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pre-seed, Seed, Series A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={founderForm.control}
                name="fundingStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Stage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pre-seed, Seed, Series A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={founderForm.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your company..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={founderForm.control}
                name="targetRaiseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Raise Amount (in thousands)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1000 for $1M" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={founderForm.control}
                name="pitchDeckUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch Deck URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        ) : (
          <Form {...investorForm}>
            <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)} className="space-y-4">
              <FormField
                control={investorForm.control}
                name="firmDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your investment firm..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="investmentThesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Thesis</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your investment thesis..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="minInvestmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Investment Amount (in thousands)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 50 for $50k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="maxInvestmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Investment Amount (in thousands)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 500 for $500k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="preferredIndustries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Industries (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="SaaS, Fintech, Healthcare" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={investorForm.control}
                name="preferredStages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Stages (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pre-seed, Seed, Series A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        )}
      </div>
    </DashboardLayout>
  );
}
