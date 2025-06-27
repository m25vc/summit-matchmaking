import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
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

// Organize geoOptions into three groups for rendering:
const geoGlobalNational = geoOptions.filter(opt => ["Global", "National"].includes(opt.value));
const geoRegional = geoOptions.filter(opt => opt.value.startsWith("Regional"));
const geoStates = geoOptions.filter(opt =>
  !["Global", "National"].includes(opt.value) &&
  !opt.value.startsWith("Regional")
);

// For row-major order, split stageOptions into 4 nearly equal arrays for each column
const rowMajorStageCols = Array.from({ length: 4 }, (_, i) => stageOptions.filter((_, idx) => idx % 4 === i));

// For Preferred Industries, split industryOptions into up to 4 columns as evenly as possible
const industryColCount = Math.min(4, industryOptions.length);
const industryColLength = Math.ceil(industryOptions.length / industryColCount);
const industryCols = Array.from({ length: industryColCount }, (_, i) => industryOptions.slice(i * industryColLength, (i + 1) * industryColLength));

interface InvestorFormProps {
  defaultValues?: Partial<InvestorFormValues>;
  onSubmit: (values: InvestorFormValues) => Promise<void>;
  showSubmitButton?: boolean;
}

export const InvestorForm = forwardRef<HTMLFormElement, InvestorFormProps>(
  ({ defaultValues, onSubmit, showSubmitButton = true }, ref) => {
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
        <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Preferred Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" className="text-base" {...field} />
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
                    <FormLabel className="text-sm font-medium text-gray-700">LinkedIn Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/..." className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Firm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your firm name" className="text-base" {...field} />
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
                    <FormLabel className="text-sm font-medium text-gray-700">Firm Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Firm Description Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Firm Overview</h3>
            <FormField
              control={form.control}
              name="firmDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Firm Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your investment firm..."
                      className="min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <FormField
                control={form.control}
                name="firmHQ"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Firm HQ Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chicago, IL" className="text-base" {...field} />
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
                    <FormLabel className="text-sm font-medium text-gray-700">Typical Check Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
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
                    <FormLabel className="text-sm font-medium text-gray-700">Leads Deals</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
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
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Preferences</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Preferred Stages - Left Column */}
              <div>
                <FormField
                  control={form.control}
                  name="preferredStages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-3">Preferred Investment Stages</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          {rowMajorStageCols.map((col, colIdx) => (
                            <div key={colIdx} className="flex flex-col space-y-2">
                              {col.map(option => (
                                <label key={option.value} className="flex items-center space-x-2 ml-4 min-w-[120px]">
                                  <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={field.value?.includes(option.value) || false}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        field.onChange([...(field.value || []), option.value]);
                                      } else {
                                        field.onChange((field.value || []).filter((v: string) => v !== option.value));
                                      }
                                    }}
                                    disabled={form.formState.isSubmitting}
                                    className="text-base"
                                  />
                                  <span className="text-sm text-gray-700">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Models - Right Column */}
              <div>
                <FormField
                  control={form.control}
                  name="businessModels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-3">Business Models</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value="B2B"
                              checked={field.value?.includes("B2B") || false}
                              onChange={e => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), "B2B"]);
                                } else {
                                  field.onChange((field.value || []).filter((v: string) => v !== "B2B"));
                                }
                              }}
                              disabled={form.formState.isSubmitting}
                              className="text-base"
                            />
                            <span className="text-sm text-gray-700">B2B</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value="B2C"
                              checked={field.value?.includes("B2C") || false}
                              onChange={e => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), "B2C"]);
                                } else {
                                  field.onChange((field.value || []).filter((v: string) => v !== "B2C"));
                                }
                              }}
                              disabled={form.formState.isSubmitting}
                              className="text-base"
                            />
                            <span className="text-sm text-gray-700">B2C</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="preferredIndustries"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-3">Preferred Industries</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      {industryCols.map((col, colIdx) => (
                        <div key={colIdx} className="flex flex-col space-y-2">
                          {col.map(option => (
                            <label key={option.value} className="flex items-center space-x-2 ml-4 min-w-[140px]">
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={field.value?.includes(option.value) || false}
                                onChange={e => {
                                  if (e.target.checked) {
                                    field.onChange([...(field.value || []), option.value]);
                                  } else {
                                    field.onChange((field.value || []).filter((v: string) => v !== option.value));
                                  }
                                }}
                                disabled={form.formState.isSubmitting}
                                className="text-base"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Geographic Focus */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Focus</h3>
            <FormField
              control={form.control}
              name="geographicFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-3">Geographic Focus</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Global & National */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {geoGlobalNational.map(option => (
                          <label key={option.value} className="flex items-center space-x-2 ml-4 min-w-[220px]">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={field.value?.includes(option.value) || false}
                              onChange={e => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), option.value]);
                                } else {
                                  field.onChange((field.value || []).filter((v: string) => v !== option.value));
                                }
                              }}
                              disabled={form.formState.isSubmitting}
                              className="text-base"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {/* Regional */}
                      <div>
                        <div className="text-sm font-semibold text-gray-800 mb-2">Regional</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {geoRegional.map(option => (
                            <label key={option.value} className="flex items-center space-x-2 ml-4 min-w-[220px]">
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={field.value?.includes(option.value) || false}
                                onChange={e => {
                                  if (e.target.checked) {
                                    field.onChange([...(field.value || []), option.value]);
                                  } else {
                                    field.onChange((field.value || []).filter((v: string) => v !== option.value));
                                  }
                                }}
                                disabled={form.formState.isSubmitting}
                                className="text-base"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* States */}
                      <div>
                        <div className="text-sm font-semibold text-gray-800 mb-2">States</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {geoStates.map(option => (
                            <label key={option.value} className="flex items-center space-x-2 ml-4 min-w-[220px]">
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={field.value?.includes(option.value) || false}
                                onChange={e => {
                                  if (e.target.checked) {
                                    field.onChange([...(field.value || []), option.value]);
                                  } else {
                                    field.onChange((field.value || []).filter((v: string) => v !== option.value));
                                  }
                                }}
                                disabled={form.formState.isSubmitting}
                                className="text-base"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to share..."
                      className="min-h-[80px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showSubmitButton && (
            <Button type="submit" className="w-full text-base font-medium py-3">Save Profile</Button>
          )}
          {/* Hidden submit button for sticky save functionality */}
          <button type="submit" className="hidden" />
        </form>
      </Form>
    );
  }
);
