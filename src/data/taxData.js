export const taxData2025 = {
  // From "Week 1 & Week 4 B - Federal Tax" sheet
  // Updated for 2026 tax year
  federalTaxBrackets: [
    { rate: 0.10, lowerBound: 0 },
    { rate: 0.12, lowerBound: 12400 },
    { rate: 0.22, lowerBound: 50400 },
    { rate: 0.24, lowerBound: 105700 },
    { rate: 0.32, lowerBound: 201775 },
    { rate: 0.35, lowerBound: 256225 },
    { rate: 0.37, lowerBound: 640600 },
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
  // Updated for 2026 tax year
  standardDeductionRules: {
    base: {
      single: 16100,
      marriedFilingJointly: 32200,
      headOfHousehold: 24150,
      marriedFilingSeparately: 16100,
      qualifyingWidow: 32200,
    },
    additional: {
      singleOrHeadOfHousehold: 2000,
      married: 1600, // Per qualifying individual
    }
  }
}; 