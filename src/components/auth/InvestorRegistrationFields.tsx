
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
          Preferred Industries
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
      </div>
      
      <div>
        <label htmlFor="investmentStages" className="block text-sm font-medium text-gray-700">
          Preferred Stages
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
            <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
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
