
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { founderFormSchema, type FounderFormValues } from "@/schemas/profileSchemas";

interface FounderFormProps {
  defaultValues?: Partial<FounderFormValues>;
  onSubmit: (values: FounderFormValues) => Promise<void>;
}

export function FounderForm({ defaultValues, onSubmit }: FounderFormProps) {
  const form = useForm<FounderFormValues>({
    resolver: zodResolver(founderFormSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  );
}
