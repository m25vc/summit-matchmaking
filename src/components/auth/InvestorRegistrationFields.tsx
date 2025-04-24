import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvestorRegistrationFieldsProps {
  firmName: string;
  setFirmName: (value: string) => void;
  firmHQ: string;
  setFirmHQ: (value: string) => void;
  investmentIndustries: string;
  setInvestmentIndustries: (value: string) => void;
  investmentStages: string;
  setInvestmentStages: (value: string) => void;
  geographicFocus: string;
  setGeographicFocus: (value: string) => void;
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
          Firm HQ Location
        </label>
        <Input
          id="firmHQ"
          type="text"
          placeholder="e.g., Chicago, IL"
          value={firmHQ}
          onChange={(e) => setFirmHQ(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="investmentIndustries" className="block text-sm font-medium text-gray-700">
          Investment Industries
        </label>
        <Select
          value={investmentIndustries}
          onValueChange={setInvestmentIndustries}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select primary industry focus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SaaS">SaaS</SelectItem>
            <SelectItem value="Fintech">Fintech</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="E-commerce">E-commerce</SelectItem>
            <SelectItem value="AI/ML">AI/ML</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
            <SelectItem value="Consumer">Consumer</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Deep Tech">Deep Tech</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="investmentStages" className="block text-sm font-medium text-gray-700">
          Investment Stages
        </label>
        <Select
          value={investmentStages}
          onValueChange={setInvestmentStages}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select preferred investment stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pre-seed">Pre-seed</SelectItem>
            <SelectItem value="Seed">Seed</SelectItem>
            <SelectItem value="Series A">Series A</SelectItem>
            <SelectItem value="Series B">Series B</SelectItem>
            <SelectItem value="Series C+">Series C+</SelectItem>
            <SelectItem value="Growth">Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="geographicFocus" className="block text-sm font-medium text-gray-700">
          Geographic Focus
        </label>
        <Select
          value={geographicFocus}
          onValueChange={setGeographicFocus}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select geographic focus" />
          </SelectTrigger>
          <SelectContent>
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
            <SelectItem value="Global">Global</SelectItem>
            <SelectItem value="Remote First">Remote First</SelectItem>
          </SelectContent>
        </Select>
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
            <SelectItem value="$25K-$100K">$25K-$100K</SelectItem>
            <SelectItem value="$100K-$500K">$100K-$500K</SelectItem>
            <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
            <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
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
