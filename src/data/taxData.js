export const taxData2025 = {
  // From "Week 1 & Week 4 B - Federal Tax" sheet
  federalTaxBrackets: [
    { rate: 0.10, lowerBound: 0 },
    { rate: 0.12, lowerBound: 11925 },
    { rate: 0.22, lowerBound: 48475 },
    { rate: 0.24, lowerBound: 103350 },
    { rate: 0.32, lowerBound: 197300 },
    { rate: 0.35, lowerBound: 250525 },
    { rate: 0.37, lowerBound: 626350 },
  ],
  socialSecurity: {
    rate: 0.0620,
    limit: 176100,
  },
  medicare: {
    rate: 0.0145,
  },
  // This is now deprecated by the detailed rules below, but kept for reference.
  // standardDeduction: 15000, 
  
  // From "Week 4 B - Tax Deduction Rule"
  standardDeductionRules: {
    base: {
      single: 15000,
      marriedFilingJointly: 30000,
      headOfHousehold: 22500,
      marriedFilingSeparately: 15000,
      qualifyingWidow: 30000,
    },
    additional: {
      singleOrHeadOfHousehold: 2000,
      married: 1600, // Per qualifying individual
    }
  }
}; 