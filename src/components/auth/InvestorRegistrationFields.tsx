
import { Input } from "@/components/ui/input";

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
          Firm HQ Location (e.g., Chicago, IL)
        </label>
        <Input
          id="firmHQ"
          type="text"
          placeholder="Firm HQ Location"
          value={firmHQ}
          onChange={(e) => setFirmHQ(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="investmentIndustries" className="block text-sm font-medium text-gray-700">
          Investment Industries
        </label>
        <Input
          id="investmentIndustries"
          type="text"
          placeholder="e.g., SaaS, Fintech, Healthcare"
          value={investmentIndustries}
          onChange={(e) => setInvestmentIndustries(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="investmentStages" className="block text-sm font-medium text-gray-700">
          Investment Stages
        </label>
        <Input
          id="investmentStages"
          type="text"
          placeholder="e.g., Seed, Series A"
          value={investmentStages}
          onChange={(e) => setInvestmentStages(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="geographicFocus" className="block text-sm font-medium text-gray-700">
          Geographic Focus
        </label>
        <Input
          id="geographicFocus"
          type="text"
          placeholder="e.g., Midwest, Global"
          value={geographicFocus}
          onChange={(e) => setGeographicFocus(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="checkSize" className="block text-sm font-medium text-gray-700">
          Typical Check Size
        </label>
        <Input
          id="checkSize"
          type="text"
          placeholder="e.g., $50K-$500K"
          value={checkSize}
          onChange={(e) => setCheckSize(e.target.value)}
          disabled={loading}
        />
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
