import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectDropdown } from "@/components/ui/dropdown-menu";

// Industry options
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

// Stage options
const stageOptions = [
  { value: "Pre-Seed", label: "Pre-Seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C+", label: "Series C+" },
  { value: "Growth", label: "Growth" },
];

// Geographic focus options
const geoOptions = [
  { value: "Global", label: "Global" },
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

interface InvestorRegistrationFieldsProps {
  firmName: string;
  setFirmName: (value: string) => void;
  firmHQ: string;
  setFirmHQ: (value: string) => void;
  investmentIndustries: string[];
  setInvestmentIndustries: (value: string[]) => void;
  investmentStages: string[];
  setInvestmentStages: (value: string[]) => void;
  geographicFocus: string[];
  setGeographicFocus: (value: string[]) => void;
  checkSize: string;
  setCheckSize: (value: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
  loading: boolean;
}

const InvestorRegistrationFields = ({
  firmName,
  setFirmName,
  firmHQ,
  setFirmHQ,
  investmentIndustries,
  setInvestmentIndustries,
  investmentStages,
  setInvestmentStages,
  geographicFocus,
  setGeographicFocus,
  checkSize,
  setCheckSize,
  linkedinUrl,
  setLinkedinUrl,
  websiteUrl,
  setWebsiteUrl,
  loading
}: InvestorRegistrationFieldsProps) => {
  return (
    <>
      <div>
        <label htmlFor="firmName" className="block text-sm font-medium text-gray-700">
          Firm Name
        </label>
        <Input
          id="firmName"
          type="text"
          required
          placeholder="Firm Name"
          value={firmName}
          onChange={(e) => setFirmName(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="firmHQ" className="block text-sm font-medium text-gray-700">
          Firm HQ
        </label>
        <Input
          id="firmHQ"
          type="text"
          placeholder="e.g. Chicago, IL"
          value={firmHQ}
          onChange={(e) => setFirmHQ(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="investmentIndustries" className="block text-sm font-medium text-gray-700">
          Investment Industries (select multiple)
        </label>
        <MultiSelectDropdown 
          options={industryOptions}
          selected={investmentIndustries || []} 
          onChange={setInvestmentIndustries}
          buttonText="Select industries"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="investmentStages" className="block text-sm font-medium text-gray-700">
          Investment Stages (select multiple)
        </label>
        <MultiSelectDropdown 
          options={stageOptions}
          selected={investmentStages || []} 
          onChange={setInvestmentStages}
          buttonText="Select stages"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="geographicFocus" className="block text-sm font-medium text-gray-700">
          Geographic Focus (select multiple)
        </label>
        <MultiSelectDropdown 
          options={geoOptions}
          selected={geographicFocus || []} 
          onChange={setGeographicFocus}
          buttonText="Select geographic focus"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="checkSize" className="block text-sm font-medium text-gray-700">
          Typical Check Size
        </label>
        <Select
          value={checkSize}
          onValueChange={setCheckSize}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select typical check size" />
          </SelectTrigger>
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
      </div>

      <div>
        <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
          LinkedIn Profile URL
        </label>
        <Input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder="https://..."
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={loading}
        />
      </div>
    </>
  );
};

export default InvestorRegistrationFields;
