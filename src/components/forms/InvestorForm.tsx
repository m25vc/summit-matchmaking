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
              <FormLabel>Preferred Industries</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred industries" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="Adtech">Adtech</SelectItem>
                  <SelectItem value="Aerospace & Defense">Aerospace & Defense</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Art / VR">Art / VR</SelectItem>
                  <SelectItem value="Big Data">Big Data</SelectItem>
                  <SelectItem value="Biotech">Biotech</SelectItem>
                  <SelectItem value="Business Services">Business Services</SelectItem>
                  <SelectItem value="Cannabis">Cannabis</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Consumer">Consumer</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Deep Tech">Deep Tech</SelectItem>
                  <SelectItem value="E-Commerce & Retail">E-Commerce & Retail</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Fashion & Beauty">Fashion & Beauty</SelectItem>
                  <SelectItem value="Financial Technology">Financial Technology</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Government & Politics">Government & Politics</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Hospitality">Hospitality</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="Internet of Things (IoT)">Internet of Things (IoT)</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Manufacturing & Auto">Manufacturing & Auto</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Medical Devices">Medical Devices</SelectItem>
                  <SelectItem value="Other / Specific">Other / Specific</SelectItem>
                  <SelectItem value="Pets">Pets</SelectItem>
                  <SelectItem value="Pharma">Pharma</SelectItem>
                  <SelectItem value="Physical Goods">Physical Goods</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Robotics">Robotics</SelectItem>
                  <SelectItem value="Security & Defense">Security & Defense</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Sports & Entertainment">Sports & Entertainment</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
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
              <FormLabel>Preferred Investment Stages</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred investment stages" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C+">Series C+</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
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
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Always">Always</SelectItem>
                  <SelectItem value="Sometimes">Sometimes</SelectItem>
                  <SelectItem value="Never">Never</SelectItem>
                  <SelectItem value="Regional: No Coast">Regional: No Coast</SelectItem>
                  <SelectItem value="Regional: Midwest">Regional: Midwest</SelectItem>
                  <SelectItem value="Other / Specific">Other / Specific</SelectItem>
                  <SelectItem value="Local: IA">Local: IA</SelectItem>
                  <SelectItem value="Local: IL">Local: IL</SelectItem>
                  <SelectItem value="Local: IN">Local: IN</SelectItem>
                  <SelectItem value="Local: KS">Local: KS</SelectItem>
                  <SelectItem value="Local: KY">Local: KY</SelectItem>
                  <SelectItem value="Local: MI">Local: MI</SelectItem>
                  <SelectItem value="Local: MN">Local: MN</SelectItem>
                  <SelectItem value="Local: MO">Local: MO</SelectItem>
                  <SelectItem value="Local: ND">Local: ND</SelectItem>
                  <SelectItem value="Local: OH">Local: OH</SelectItem>
                  <SelectItem value="Local: SD">Local: SD</SelectItem>
                  <SelectItem value="Local: WI">Local: WI</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="US Only">US Only</SelectItem>
                  <SelectItem value="West Coast">West Coast</SelectItem>
                  <SelectItem value="East Coast">East Coast</SelectItem>
                  <SelectItem value="Midwest">Midwest</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="Southeast">Southeast</SelectItem>
                  <SelectItem value="Northeast">Northeast</SelectItem>
                  <SelectItem value="Pacific Northwest">Pacific Northwest</SelectItem>
                  <SelectItem value="Mountain West">Mountain West</SelectItem>
                  <SelectItem value="Remote First">Remote First</SelectItem>
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
