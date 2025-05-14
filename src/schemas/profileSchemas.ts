
import * as z from "zod"

export interface FounderFormValues {
  industry: string;
  companyStage: string;
  fundingStage: string;
  companyDescription: string;
  targetRaiseAmount: string;
  companyWebsiteUrl: string;
  lastRoundRaised: string;
  currentRevenue: string;
  nextRaisePlanned: string;
  linkedinUrl: string;
  additionalNotes: string;
  teamId?: string;
}

export interface InvestorFormValues {
  firmDescription: string;
  investmentThesis: string;
  minInvestmentAmount: string;
  maxInvestmentAmount: string;
  preferredIndustries: string[];
  preferredStages: string[];
  firmWebsiteUrl: string;
  firmHQ: string;
  geographicFocus: string[];
  checkSize: string;
  linkedinUrl: string;
  additionalNotes: string;
}

export const founderSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
  companyDescription: z.string().min(10, "Description must be at least 10 characters"),
  targetRaiseAmount: z.string().optional(),
  companyWebsiteUrl: z.string().optional(),
  lastRoundRaised: z.string().optional(),
  currentRevenue: z.string().optional(),
  nextRaisePlanned: z.string().optional(),
  linkedinUrl: z.string().optional(),
  additionalNotes: z.string().optional(),
  teamId: z.string().optional(),
});

export const investorSchema = z.object({
  firmDescription: z.string().min(10, "Firm description must be at least 10 characters"),
  investmentThesis: z.string().optional(),
  minInvestmentAmount: z.string().optional(),
  maxInvestmentAmount: z.string().optional(),
  preferredIndustries: z.array(z.string()).optional(),
  preferredStages: z.array(z.string()).optional(),
  firmWebsiteUrl: z.string().optional(),
  firmHQ: z.string().optional(),
  geographicFocus: z.array(z.string()).optional(),
  checkSize: z.string().optional(),
  linkedinUrl: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Export aliases for backward compatibility
export const founderFormSchema = founderSchema;
export const investorFormSchema = investorSchema;
