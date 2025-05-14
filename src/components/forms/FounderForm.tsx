
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { founderSchema, type FounderFormValues } from "@/schemas/profileSchemas";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface FounderFormProps {
  defaultValues?: Partial<FounderFormValues>;
  onSubmit: (values: FounderFormValues) => Promise<void>;
}

export function FounderForm({ 
  defaultValues, 
  onSubmit 
}: FounderFormProps) {
  const form = useForm<FounderFormValues>({
    resolver: zodResolver(founderSchema),
    defaultValues: defaultValues || {},
  });

  const [teams, setTeams] = useState<{ id: string, name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(
    defaultValues?.teamId || undefined
  );

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('profile_id', user.id);

      if (membershipError) {
        console.error('Error fetching team memberships:', membershipError);
        return;
      }

      if (!memberships || memberships.length === 0) return;

      const teamIds = memberships.map(m => m.team_id);

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return;
      }

      setTeams(teamsData);
    };

    fetchTeams();
  }, []);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your company..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="lastRoundRaised"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Most Recent Round Raised</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select most recent round" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C+">Series C+</SelectItem>
                  <SelectItem value="Not Raised Yet">Not Raised Yet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Annual Revenue Range</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="$0-$10K">$0-$10K</SelectItem>
                  <SelectItem value="$10K-$50K">$10K-$50K</SelectItem>
                  <SelectItem value="$50K-$100K">$50K-$100K</SelectItem>
                  <SelectItem value="$100K-$500K">$100K-$500K</SelectItem>
                  <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
                  <SelectItem value="$1M+">$1M+</SelectItem>
                  <SelectItem value="No Revenue Yet">No Revenue Yet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextRaisePlanned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>When Do You Plan to Raise Again?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select next raise timeline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                  <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                  <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                  <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                  <SelectItem value="No Plans">No Immediate Plans</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
          control={form.control}
          name="companyWebsiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile URL</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information you'd like to share..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {teams.length > 0 && (
          <div className="space-y-2">
            <Label>Team (Optional)</Label>
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No team</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Associate this profile with a team for group matching
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
