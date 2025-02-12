
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
import { investorFormSchema, type InvestorFormValues } from "@/schemas/profileSchemas";

interface InvestorFormProps {
  defaultValues?: Partial<InvestorFormValues>;
  onSubmit: (values: InvestorFormValues) => Promise<void>;
}

export function InvestorForm({ defaultValues, onSubmit }: InvestorFormProps) {
  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
  );
}
