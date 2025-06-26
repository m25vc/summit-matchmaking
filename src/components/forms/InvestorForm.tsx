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
  { value: "All", label: "All" },
  { value: "Advertising", label: "Advertising" },
  { value: "Aerospace & Defense", label: "Aerospace & Defense" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "AI", label: "AI" },
  { value: "Alcohol, Marijuana and Tobacco", label: "Alcohol, Marijuana and Tobacco" },
  { value: "Analytics", label: "Analytics" },
  { value: "AR / VR", label: "AR / VR" },
  { value: "Big Data", label: "Big Data" },
  { value: "Biotech", label: "Biotech" },
  { value: "Business Services", label: "Business Services" },
  { value: "Cleantech", label: "Cleantech" },
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
  { value: "eSports", label: "eSports" },
  { value: "Events", label: "Events" },
  { value: "Fashion & Beauty", label: "Fashion & Beauty" },
  { value: "Finance & Banking", label: "Finance & Banking" },
  { value: "Fitness", label: "Fitness" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Gambling", label: "Gambling" },
  { value: "Government & Politics", label: "Government & Politics" },
  { value: "Hardware", label: "Hardware" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Insurance", label: "Insurance" },
  { value: "Internet of Things (IoT)", label: "Internet of Things (IoT)" },
  { value: "Legal", label: "Legal" },
  { value: "Life Sciences", label: "Life Sciences" },
  { value: "Logistics", label: "Logistics" },
  { value: "Manufacturing & Auto", label: "Manufacturing & Auto" },
  { value: "Marketing", label: "Marketing" },
  { value: "Materials", label: "Materials" },
  { value: "Media & Telecommunications", label: "Media & Telecommunications" },
  { value: "Medical Devices", label: "Medical Devices" },
  { value: "Other", label: "Other" },
  { value: "Pets", label: "Pets" },
  { value: "Pharma", label: "Pharma" },
  { value: "Physical Sciences", label: "Physical Sciences" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Retail", label: "Retail" },
  { value: "Robotics", label: "Robotics" },
  { value: "Security & Defense", label: "Security & Defense" },
  { value: "Social Media", label: "Social Media" },
  { value: "Sports & Entertainment", label: "Sports & Entertainment" },
  { value: "Toys", label: "Toys" },
  { value: "Transportation", label: "Transportation" },
  { value: "Travel", label: "Travel" },
];

// Stage options for the multi-select dropdown
const stageOptions = [
  { value: "Pre-Seed", label: "Pre-Seed" },
  { value: "Seed", label: "Seed" },
  { value: "Seed+", label: "Seed+" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C+", label: "Series C+" },
  { value: "Growth", label: "Growth" },
];

// Geographic focus options for the multi-select dropdown
const geoOptions = [
  { value: "Global", label: "Global" },
  { value: "National", label: "National" },
  { value: "Regional: Midwest", label: "Regional: Midwest" },
  { value: "Regional: Mid-Atlantic", label: "Regional: Mid-Atlantic" },
  { value: "Regional: Northeast", label: "Regional: Northeast" },
  { value: "Regional: Northwest", label: "Regional: Northwest" },
  { value: "Regional: Southeast", label: "Regional: Southeast" },
  { value: "Regional: Southwest", label: "Regional: Southwest" },
  { value: "Regional: West", label: "Regional: West" },
  { value: "Alabama - AL", label: "Alabama - AL" },
  { value: "Alaska - AK", label: "Alaska - AK" },
  { value: "Arizona - AZ", label: "Arizona - AZ" },
  { value: "Arkansas - AR", label: "Arkansas - AR" },
  { value: "California - CA", label: "California - CA" },
  { value: "Colorado - CO", label: "Colorado - CO" },
  { value: "Connecticut - CT", label: "Connecticut - CT" },
  { value: "Delaware - DE", label: "Delaware - DE" },
  { value: "District of Columbia - DC", label: "District of Columbia - DC" },
  { value: "Florida - FL", label: "Florida - FL" },
  { value: "Georgia - GA", label: "Georgia - GA" },
  { value: "Hawaii - HI", label: "Hawaii - HI" },
  { value: "Idaho - ID", label: "Idaho - ID" },
  { value: "Illinois - IL", label: "Illinois - IL" },
  { value: "Indiana - IN", label: "Indiana - IN" },
  { value: "Iowa - IA", label: "Iowa - IA" },
  { value: "Kansas - KS", label: "Kansas - KS" },
  { value: "Kentucky - KY", label: "Kentucky - KY" },
  { value: "Louisiana - LA", label: "Louisiana - LA" },
  { value: "Maine - ME", label: "Maine - ME" },
  { value: "Maryland - MD", label: "Maryland - MD" },
  { value: "Massachusetts - MA", label: "Massachusetts - MA" },
  { value: "Michigan - MI", label: "Michigan - MI" },
  { value: "Minnesota - MN", label: "Minnesota - MN" },
  { value: "Mississippi - MS", label: "Mississippi - MS" },
  { value: "Missouri - MO", label: "Missouri - MO" },
  { value: "Montana - MT", label: "Montana - MT" },
  { value: "Nebraska - NE", label: "Nebraska - NE" },
  { value: "Nevada - NV", label: "Nevada - NV" },
  { value: "New Hampshire - NH", label: "New Hampshire - NH" },
  { value: "New Jersey - NJ", label: "New Jersey - NJ" },
  { value: "New Mexico - NM", label: "New Mexico - NM" },
  { value: "New York - NY", label: "New York - NY" },
  { value: "North Carolina - NC", label: "North Carolina - NC" },
  { value: "North Dakota - ND", label: "North Dakota - ND" },
  { value: "Ohio - OH", label: "Ohio - OH" },
  { value: "Oklahoma - OK", label: "Oklahoma - OK" },
  { value: "Oregon - OR", label: "Oregon - OR" },
  { value: "Pennsylvania - PA", label: "Pennsylvania - PA" },
  { value: "Rhode Island - RI", label: "Rhode Island - RI" },
  { value: "South Carolina - SC", label: "South Carolina - SC" },
  { value: "South Dakota - SD", label: "South Dakota - SD" },
  { value: "Tennessee - TN", label: "Tennessee - TN" },
  { value: "Texas - TX", label: "Texas - TX" },
  { value: "Utah - UT", label: "Utah - UT" },
  { value: "Vermont - VT", label: "Vermont - VT" },
  { value: "Virginia - VA", label: "Virginia - VA" },
  { value: "Washington - WA", label: "Washington - WA" },
  { value: "West Virginia - WV", label: "West Virginia - WV" },
  { value: "Wisconsin - WI", label: "Wisconsin - WI" },
  { value: "Wyoming - WY", label: "Wyoming - WY" },
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
                  <SelectItem value="<50K">&lt;$50K</SelectItem>
                  <SelectItem value="50K - 100K">$50K - $100K</SelectItem>
                  <SelectItem value="100K - 250K">$100K - $250K</SelectItem>
                  <SelectItem value="250K - 500K">$250K - $500K</SelectItem>
                  <SelectItem value="500K - 1M">$500K - $1M</SelectItem>
                  <SelectItem value="1M - 3M">$1M - $3M</SelectItem>
                  <SelectItem value="3M - 7M">$3M - $7M</SelectItem>
                  <SelectItem value="7M+">$7M+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leadsDeals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leads Deals</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Always">Always</SelectItem>
                  <SelectItem value="Sometimes">Sometimes</SelectItem>
                  <SelectItem value="Never">Never</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessModels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Models</FormLabel>
              <MultiSelectDropdown
                options={[
                  { value: "B2B", label: "B2B" },
                  { value: "B2C", label: "B2C" }
                ]}
                selected={field.value || []}
                onChange={field.onChange}
                buttonText="Select business models"
                disabled={form.formState.isSubmitting}
              />
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
