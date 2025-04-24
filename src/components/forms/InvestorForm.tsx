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
                <Textarea
                  placeholder="Describe your investment firm..."
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
          name="firmHQ"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm HQ Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicago, IL" {...field} />
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
                <Textarea
                  placeholder="Describe your investment thesis..."
                  className="min-h-[100px]"
                  {...field}
                />
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
              <FormLabel>Investment Industries</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment industries" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Consumer">Consumer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredStages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Stages</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment stages" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Late Stage">Late Stage</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geographicFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geographic Focus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select geographic focus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="US Only">US Only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checkSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typical Check Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check size range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="$0-$50K">$0-$50K</SelectItem>
                  <SelectItem value="$50K-$250K">$50K-$250K</SelectItem>
                  <SelectItem value="$250K-$500K">$250K-$500K</SelectItem>
                  <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
                  <SelectItem value="$1M+">$1M+</SelectItem>
                </SelectContent>
              </Select>
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
          name="firmWebsiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm Website URL</FormLabel>
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
