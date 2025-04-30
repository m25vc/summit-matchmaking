
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
import { MultiSelectDropdown } from "@/components/ui/dropdown-menu";
import { investorFormSchema, type InvestorFormValues } from "@/schemas/profileSchemas";

// Industry options for the multi-select dropdown
const industryOptions = [
  { value: "AI", label: "AI" },
  { value: "Adtech", label: "Adtech" },
  { value: "Aerospace & Defense", label: "Aerospace & Defense" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Analytics", label: "Analytics" },
  { value: "Art / VR", label: "Art / VR" },
  { value: "Big Data", label: "Big Data" },
  { value: "Biotech", label: "Biotech" },
  { value: "Business Services", label: "Business Services" },
  { value: "Cannabis", label: "Cannabis" },
  { value: "Construction", label: "Construction" },
  { value: "Consumer", label: "Consumer" },
  { value: "Crypto", label: "Crypto" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Deep Tech", label: "Deep Tech" },
  { value: "E-Commerce & Retail", label: "E-Commerce & Retail" },
  { value: "Education", label: "Education" },
  { value: "Energy", label: "Energy" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Environment", label: "Environment" },
  { value: "Events", label: "Events" },
  { value: "Fashion & Beauty", label: "Fashion & Beauty" },
  { value: "Financial Technology", label: "Financial Technology" },
  { value: "Fitness", label: "Fitness" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Gaming", label: "Gaming" },
  { value: "Government & Politics", label: "Government & Politics" },
  { value: "Hardware", label: "Hardware" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "IoT", label: "IoT" },
  { value: "Internet of Things (IoT)", label: "Internet of Things (IoT)" },
  { value: "Legal", label: "Legal" },
  { value: "Life Sciences", label: "Life Sciences" },
  { value: "Logistics", label: "Logistics" },
  { value: "Manufacturing & Auto", label: "Manufacturing & Auto" },
  { value: "Marketing", label: "Marketing" },
  { value: "Media", label: "Media" },
  { value: "Medical Devices", label: "Medical Devices" },
  { value: "Other / Specific", label: "Other / Specific" },
  { value: "Pets", label: "Pets" },
  { value: "Pharma", label: "Pharma" },
  { value: "Physical Goods", label: "Physical Goods" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Retail", label: "Retail" },
  { value: "Robotics", label: "Robotics" },
  { value: "Security & Defense", label: "Security & Defense" },
  { value: "Social Media", label: "Social Media" },
  { value: "Sports & Entertainment", label: "Sports & Entertainment" },
  { value: "Tech", label: "Tech" },
  { value: "Transportation", label: "Transportation" },
  { value: "Travel", label: "Travel" },
];

// Stage options for the multi-select dropdown
const stageOptions = [
  { value: "Pre-Seed", label: "Pre-Seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C+", label: "Series C+" },
  { value: "Growth", label: "Growth" },
];

// Geographic focus options for the multi-select dropdown
const geoOptions = [
  { value: "Global", label: "Global" },
  { value: "Always", label: "Always" },
  { value: "Sometimes", label: "Sometimes" },
  { value: "Never", label: "Never" },
  { value: "Regional: No Coast", label: "Regional: No Coast" },
  { value: "Regional: Midwest", label: "Regional: Midwest" },
  { value: "Other / Specific", label: "Other / Specific" },
  { value: "Local: IA", label: "Local: IA" },
  { value: "Local: IL", label: "Local: IL" },
  { value: "Local: IN", label: "Local: IN" },
  { value: "Local: KS", label: "Local: KS" },
  { value: "Local: KY", label: "Local: KY" },
  { value: "Local: MI", label: "Local: MI" },
  { value: "Local: MN", label: "Local: MN" },
  { value: "Local: MO", label: "Local: MO" },
  { value: "Local: ND", label: "Local: ND" },
  { value: "Local: OH", label: "Local: OH" },
  { value: "Local: SD", label: "Local: SD" },
  { value: "Local: WI", label: "Local: WI" },
  { value: "North America", label: "North America" },
  { value: "US Only", label: "US Only" },
  { value: "West Coast", label: "West Coast" },
  { value: "East Coast", label: "East Coast" },
  { value: "Midwest", label: "Midwest" },
  { value: "Southwest", label: "Southwest" },
  { value: "Southeast", label: "Southeast" },
  { value: "Northeast", label: "Northeast" },
  { value: "Pacific Northwest", label: "Pacific Northwest" },
  { value: "Mountain West", label: "Mountain West" },
  { value: "Remote First", label: "Remote First" },
];

interface InvestorFormProps {
  defaultValues?: Partial<InvestorFormValues>;
  onSubmit: (values: InvestorFormValues) => Promise<void>;
}

export function InvestorForm({ defaultValues, onSubmit }: InvestorFormProps) {
  // Ensure default values have arrays for multi-select fields
  const initialValues = {
    ...defaultValues,
    preferredIndustries: defaultValues?.preferredIndustries || [],
    preferredStages: defaultValues?.preferredStages || [],
    geographicFocus: defaultValues?.geographicFocus || [],
  };

  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: initialValues,
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
              <FormLabel>Preferred Industries (select multiple)</FormLabel>
              <FormControl>
                <MultiSelectDropdown
                  options={industryOptions}
                  selected={field.value}
                  onChange={field.onChange}
                  buttonText="Select preferred industries"
                  disabled={form.formState.isSubmitting}
                />
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
              <FormLabel>Preferred Investment Stages (select multiple)</FormLabel>
              <FormControl>
                <MultiSelectDropdown
                  options={stageOptions}
                  selected={field.value}
                  onChange={field.onChange}
                  buttonText="Select preferred investment stages"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geographicFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geographic Focus (select multiple)</FormLabel>
              <FormControl>
                <MultiSelectDropdown
                  options={geoOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  buttonText="Select geographic focus"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
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
                    <SelectValue placeholder="Select typical check size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="< $50K">&lt; $50K</SelectItem>
                  <SelectItem value="$50K - $100K">$50K - $100K</SelectItem>
                  <SelectItem value="$100K - $250K">$100K - $250K</SelectItem>
                  <SelectItem value="$250K - $500K">$250K - $500K</SelectItem>
                  <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                  <SelectItem value="$1M - $3M">$1M - $3M</SelectItem>
                  <SelectItem value="$3M - $5M">$3M - $5M</SelectItem>
                  <SelectItem value="$5M+">$5M+</SelectItem>
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
