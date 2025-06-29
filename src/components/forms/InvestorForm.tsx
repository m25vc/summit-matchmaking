import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect } from "react";
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
import { toast } from "sonner";

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

// For row-major order, split stageOptions into rows of 3 for left-to-right reading
const stageRows = [];
for (let i = 0; i < stageOptions.length; i += 3) {
  stageRows.push(stageOptions.slice(i, i + 3));
}

// For Preferred Industries, split industryOptions into up to 4 columns as evenly as possible
const industryColCount = Math.min(4, industryOptions.length);
const industryColLength = Math.ceil(industryOptions.length / industryColCount);
const industryCols = Array.from({ length: industryColCount }, (_, i) => industryOptions.slice(i * industryColLength, (i + 1) * industryColLength));

interface InvestorFormProps {
  defaultValues?: Partial<InvestorFormValues>;
  onSubmit: (values: InvestorFormValues) => Promise<void>;
  showSubmitButton?: boolean;
  setIsSaving?: (saving: boolean) => void;
}

export const InvestorForm = forwardRef<HTMLFormElement, InvestorFormProps>(
  ({ defaultValues, onSubmit, showSubmitButton = true, setIsSaving }, ref) => {
    // Ensure default values have arrays for multi-select fields
    const initialValues = {
      ...defaultValues,
      preferredIndustries: defaultValues?.preferredIndustries || [],
      preferredStages: defaultValues?.preferredStages || [],
      geographicFocus: defaultValues?.geographicFocus || [],
      businessModels: defaultValues?.businessModels || [],
    };

    const form = useForm<InvestorFormValues>({
      resolver: zodResolver(investorFormSchema),
      defaultValues: initialValues,
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

    // Debug logging
    console.log('InvestorForm defaultValues:', defaultValues);
    console.log('InvestorForm initialValues:', initialValues);
    console.log('InvestorForm current values:', form.getValues());

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(
            onSubmit,
            (errors) => {
              if (typeof setIsSaving === 'function') setIsSaving(false);
              toast.error("Please fix the errors in the form before saving.");
            }
          )}
          className="space-y-6"
        >
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
                      <Input placeholder="Enter your first name" className="text-sm" {...field} />
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
                      <Input placeholder="Enter your last name" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your job title" className="text-sm" {...field} />
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
                      <Input type="email" placeholder="Enter your email address" className="text-sm" {...field} />
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
                      <Input placeholder="https://linkedin.com/in/..." className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Firm Overview Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Firm Overview</h3>
            
            {/* Row 1: Firm Name & URL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FormField
                control={form.control}
                name="firmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Firm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your firm name" className="text-sm" {...field} />
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
                      <Input placeholder="https://..." className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Firm Description + Firm HQ & Leads Deals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FormField
                control={form.control}
                name="firmDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Firm Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your investment firm..."
                        className="min-h-[120px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-start space-y-4">
                <FormField
                  control={form.control}
                  name="firmHQ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Firm HQ Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chicago, IL" className="text-sm" {...field} />
                      </FormControl>
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
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="text-sm">
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

            {/* Row 3: Typical Check Size + Specific Check Size */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="checkSize"
                render={({ field }) => {
                  // Define the options
                  const checkSizeOptions = [
                    '<$50K',
                    '$50K - $100K',
                    '$100K - $250K',
                    '$250K - $500K',
                    '$500K - $1M',
                    '$1M - $3M',
                    '$3M - $7M',
                    '$7M+',
                  ];
                  // Arrange in 4 columns horizontally (2 rows of 4)
                  const colCount = 4;
                  const rowCount = Math.ceil(checkSizeOptions.length / colCount);
                  const checkSizeRows = Array.from({ length: rowCount }, (_, rowIdx) =>
                    checkSizeOptions.slice(rowIdx * colCount, (rowIdx + 1) * colCount)
                  );
                  const currentValue = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Typical Check Size</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-1">
                          {checkSizeRows.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex gap-2">
                              {row.map(option => (
                                <label key={option} className="flex items-center space-x-1 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    value={option}
                                    checked={currentValue.includes(option)}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        field.onChange([...currentValue, option]);
                                      } else {
                                        field.onChange(currentValue.filter((v: string) => v !== option));
                                      }
                                    }}
                                    className="text-sm flex-shrink-0"
                                  />
                                  <span className="text-xs text-gray-700 whitespace-nowrap">{option}</span>
                                </label>
                              ))}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="checkSizeSpecific"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Specific Check Size</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Specify any specific check size requirements..."
                        className="min-h-[80px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Preferences</h3>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 justify-between">
              {/* Preferred Stages - Left Column */}
              <div>
                <FormField
                  control={form.control}
                  name="preferredStages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-3">Preferred Investment Stages</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          {stageRows.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex gap-4">
                              {row.map(option => (
                                <label key={option.value} className="flex items-center space-x-2 min-w-[120px]">
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
                                    className="text-sm"
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

              {/* Revenue Criteria - Middle Column */}
              <div className="xl:ml-8">
                <FormField
                  control={form.control}
                  name="revenueCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Revenue Criteria</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Specify your revenue criteria..."
                          className="min-h-[60px] text-sm"
                          {...field}
                        />
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
                  render={({ field }) => {
                    // Ensure field.value is always an array
                    const currentValue = Array.isArray(field.value) ? field.value : [];
                    
                    // Debug logging for business models
                    console.log('businessModels field.value:', field.value);
                    console.log('businessModels currentValue:', currentValue);
                    console.log('businessModels includes B2B:', currentValue.includes("B2B"));
                    console.log('businessModels includes B2C:', currentValue.includes("B2C"));
                    
                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 mb-3">Business Models</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value="B2B"
                                checked={currentValue.includes("B2B")}
                                onChange={e => {
                                  console.log('B2B checkbox changed:', e.target.checked);
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, "B2B"]);
                                  } else {
                                    field.onChange(currentValue.filter((v: string) => v !== "B2B"));
                                  }
                                }}
                                disabled={form.formState.isSubmitting}
                                className="text-sm"
                              />
                              <span className="text-sm text-gray-700">B2B</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value="B2C"
                                checked={currentValue.includes("B2C")}
                                onChange={e => {
                                  console.log('B2C checkbox changed:', e.target.checked);
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, "B2C"]);
                                  } else {
                                    field.onChange(currentValue.filter((v: string) => v !== "B2C"));
                                  }
                                }}
                                disabled={form.formState.isSubmitting}
                                className="text-sm"
                              />
                              <span className="text-sm text-gray-700">B2C</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
                                className="text-sm"
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
            
            <FormField
              control={form.control}
              name="industriesSpecific"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm font-medium text-gray-700">Other Industry Inclusion / Exclusion</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify any specific industries you include or exclude..."
                      className="min-h-[80px] text-sm"
                      {...field}
                    />
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
                  {/* <FormLabel className="text-sm font-medium text-gray-700 mb-3">Geographic Focus</FormLabel> */}
                  <FormControl>
                    <div className="space-y-4">
                      {/* Global & National */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Global & National</h4>
                        <div className="flex flex-wrap gap-2">
                          {geoGlobalNational.map(option => (
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
                                className="text-sm"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Regional */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Regional</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {geoRegional.map(option => (
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
                                className="text-sm"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* US States */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">US States</h4>
                        {(() => {
                          const colCount = 4;
                          const colLength = Math.ceil(geoStates.length / colCount);
                          const stateCols = Array.from({ length: colCount }, (_, i) => geoStates.slice(i * colLength, (i + 1) * colLength));
                          return (
                            <div className="flex gap-8">
                              {stateCols.map((col, colIdx) => (
                                <div key={colIdx} className="flex-1 flex flex-col space-y-2">
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
                                        className="text-sm"
                                      />
                                      <span className="text-sm text-gray-700">{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="geographySpecific"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm font-medium text-gray-700">Other Geographic Focus</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify any other geographic focus areas..."
                      className="min-h-[80px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Additional Information to Share with Other Participants</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information you want to share with other participants..."
                      className="min-h-[80px] text-sm"
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
