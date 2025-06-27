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

// Updated schema to support arrays for multi-select fields
export const investorFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  firmName: z.string().min(1, "Firm name is required"),
  firmDescription: z.string().min(10, "Please provide a longer description"),
  preferredIndustries: z.array(z.string()).min(1, "Please specify at least one preferred industry"),
  preferredStages: z.array(z.string()).min(1, "Please specify at least one preferred stage"),
  firmWebsiteUrl: z.string().url().optional().or(z.literal("")),
  firmHQ: z.string().optional(),
  geographicFocus: z.array(z.string()).optional(),
  checkSize: z.array(z.string()).optional().default([]),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  additionalNotes: z.string().optional(),
  leadsDeals: z.enum(["Always", "Sometimes", "Never"]),
  businessModels: z.array(z.enum(["B2B", "B2C"])).optional().default([]),
  industriesSpecific: z.string().optional(),
  revenueCriteria: z.string().optional(),
  geographySpecific: z.string().optional(),
  checkSizeSpecific: z.string().optional(),
});

export type FounderFormValues = z.infer<typeof founderFormSchema>;
export type InvestorFormValues = z.infer<typeof investorFormSchema>;
