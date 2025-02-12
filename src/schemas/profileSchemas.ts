
import * as z from "zod";

export const founderFormSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  companyStage: z.string().min(1, "Company stage is required"),
  fundingStage: z.string().min(1, "Funding stage is required"),
  companyDescription: z.string().min(10, "Please provide a longer description"),
  targetRaiseAmount: z.string().optional(),
  pitchDeckUrl: z.string().url().optional().or(z.literal("")),
});

export const investorFormSchema = z.object({
  firmDescription: z.string().min(10, "Please provide a longer description"),
  investmentThesis: z.string().optional(),
  minInvestmentAmount: z.string().optional(),
  maxInvestmentAmount: z.string().optional(),
  preferredIndustries: z.string().min(1, "Please specify preferred industries"),
  preferredStages: z.string().min(1, "Please specify preferred stages"),
});

export type FounderFormValues = z.infer<typeof founderFormSchema>;
export type InvestorFormValues = z.infer<typeof investorFormSchema>;
