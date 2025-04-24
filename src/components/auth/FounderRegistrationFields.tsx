import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <Select
          value={lastRoundRaised}
          onValueChange={setLastRoundRaised}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select most recent round" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pre-seed">Pre-seed</SelectItem>
            <SelectItem value="Seed">Seed</SelectItem>
            <SelectItem value="Series A">Series A</SelectItem>
            <SelectItem value="Series B">Series B</SelectItem>
            <SelectItem value="Series C+">Series C+</SelectItem>
            <SelectItem value="Not Raised Yet">Not Raised Yet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="currentRevenue" className="block text-sm font-medium text-gray-700">
          Current Annual Revenue Range
        </label>
        <Select
          value={currentRevenue}
          onValueChange={setCurrentRevenue}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select revenue range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$0-$10K">$0-$10K</SelectItem>
            <SelectItem value="$10K-$50K">$10K-$50K</SelectItem>
            <SelectItem value="$50K-$100K">$50K-$100K</SelectItem>
            <SelectItem value="$100K-$500K">$100K-$500K</SelectItem>
            <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
            <SelectItem value="$1M+">$1M+</SelectItem>
            <SelectItem value="No Revenue Yet">No Revenue Yet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="nextRaisePlanned" className="block text-sm font-medium text-gray-700">
          When Do You Plan to Raise Again?
        </label>
        <Select
          value={nextRaisePlanned}
          onValueChange={setNextRaisePlanned}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select next raise timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Q2 2025">Q2 2025</SelectItem>
            <SelectItem value="Q3 2025">Q3 2025</SelectItem>
            <SelectItem value="Q4 2025">Q4 2025</SelectItem>
            <SelectItem value="Q1 2026">Q1 2026</SelectItem>
            <SelectItem value="No Plans">No Immediate Plans</SelectItem>
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

export default FounderRegistrationFields;
