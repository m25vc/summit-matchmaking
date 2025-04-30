
import * as z from "zod";

export const founderFormSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
  companyDescription: z.string().min(10, "Please provide a longer description"),
  targetRaiseAmount: z.string().optional(),
  companyWebsiteUrl: z.string().url().optional().or(z.literal("")),
  lastRoundRaised: z.string().optional(),
  currentRevenue: z.string().optional(),
  nextRaisePlanned: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  additionalNotes: z.string().optional(),
});

// Updated schema to match the dropdown selections
export const investorFormSchema = z.object({
  firmDescription: z.string().min(10, "Please provide a longer description"),
  investmentThesis: z.string().optional(),
  minInvestmentAmount: z.string().optional(),
  maxInvestmentAmount: z.string().optional(),
  preferredIndustries: z.string().min(1, "Please specify preferred industries"),
  preferredStages: z.string().min(1, "Please specify preferred stages"),
  firmWebsiteUrl: z.string().url().optional().or(z.literal("")),
  firmHQ: z.string().optional(),
  geographicFocus: z.string().optional(),
  checkSize: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  additionalNotes: z.string().optional(),
});

export type FounderFormValues = z.infer<typeof founderFormSchema>;
export type InvestorFormValues = z.infer<typeof investorFormSchema>;
