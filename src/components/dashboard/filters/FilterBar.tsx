
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated industry options to match registration
const INDUSTRY_OPTIONS = [
  'AI',
  'Adtech',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'Crypto',
  'Biotech',
  'Edtech',
  'Other'
] as const;

// Ensure EXACT stage names as stored in the database
const STAGE_OPTIONS = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth',
  'Other'
] as const;

type SortOption = 'newest' | 'alphabetical' | 'company';

interface FilterBarProps {
  industryFilter: string;
  setIndustryFilter: React.Dispatch<React.SetStateAction<string>>;
  stageFilter: string;
  setStageFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  showIndustryAndStage?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  industryFilter,
  setIndustryFilter,
  stageFilter,
  setStageFilter,
  sortBy,
  setSortBy,
  showIndustryAndStage = true
}) => {
  console.log('FilterBar rendering with:', { industryFilter, stageFilter, sortBy });
  
  return (
    <div className={`mb-6 grid gap-4 ${showIndustryAndStage ? 'md:grid-cols-3' : ''}`}>
      {showIndustryAndStage && (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Select
              value={industryFilter}
              onValueChange={setIndustryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Stage</label>
            <Select
              value={stageFilter}
              onValueChange={setStageFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGE_OPTIONS.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort by</label>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="company">Company name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
