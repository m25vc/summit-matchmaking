
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FounderRegistrationFieldsProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  companyDescription: string;
  setCompanyDescription: (value: string) => void;
  currentRevenue: string;
  setCurrentRevenue: (value: string) => void;
  lastRoundRaised: string;
  setLastRoundRaised: (value: string) => void;
  nextRaisePlanned: string;
  setNextRaisePlanned: (value: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
  loading: boolean;
}

const FounderRegistrationFields = ({
  companyName,
  setCompanyName,
  companyDescription,
  setCompanyDescription,
  currentRevenue,
  setCurrentRevenue,
  lastRoundRaised,
  setLastRoundRaised,
  nextRaisePlanned,
  setNextRaisePlanned,
  linkedinUrl,
  setLinkedinUrl,
  websiteUrl,
  setWebsiteUrl,
  loading
}: FounderRegistrationFieldsProps) => {
  return (
    <>
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <Input
          id="companyName"
          type="text"
          required
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
          Company Description (one line)
        </label>
        <Textarea
          id="companyDescription"
          placeholder="Brief description of your company"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="lastRoundRaised" className="block text-sm font-medium text-gray-700">
          Most Recent Round Raised
        </label>
        <Input
          id="lastRoundRaised"
          type="text"
          placeholder="e.g., Seed, Series A"
          value={lastRoundRaised}
          onChange={(e) => setLastRoundRaised(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="currentRevenue" className="block text-sm font-medium text-gray-700">
          Current Annual Revenue Range
        </label>
        <Input
          id="currentRevenue"
          type="text"
          placeholder="e.g., $100K-$500K"
          value={currentRevenue}
          onChange={(e) => setCurrentRevenue(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="nextRaisePlanned" className="block text-sm font-medium text-gray-700">
          When Do You Plan to Raise Again?
        </label>
        <Input
          id="nextRaisePlanned"
          type="text"
          placeholder="e.g., Q4 2024"
          value={nextRaisePlanned}
          onChange={(e) => setNextRaisePlanned(e.target.value)}
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

export default FounderRegistrationFields;
