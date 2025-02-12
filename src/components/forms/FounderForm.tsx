
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

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  );
}
