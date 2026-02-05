import { taxData2025 } from '../data/taxData.js';
import stateTaxData from '../data/stateTaxData';

/**
 * Calculates the Standard Deduction based on user's filing status, age, and blindness.
 * This logic mimics the complex IF formula from the "Week 4 - Tax" Excel sheet.
 * @param {object} userChoices - The user's selections.
 * @param {string} userChoices.filingStatus - e.g., 'single', 'marriedFilingJointly'.
 * @param {string} userChoices.age - 'under65' or 'over65'.
 * @param {string} userChoices.isBlind - 'yes' or 'no'.
 * @param {string} userChoices.spouseAge - 'under65' or 'over65' (if applicable).
 * @param {string} userChoices.isSpouseBlind - 'yes' or 'no' (if applicable).
 * @returns {number} The calculated total standard deduction.
 */
function calculateStandardDeduction() {
  // 2026 single filers standard deduction
  return taxData2025.standardDeductionRules.base.single; // $16,100
  
  // OLD COMPLEX LOGIC REMOVED - WE ALWAYS USE $15,000
  /*
  // Map Excel logic to JS
  const rules = taxData2025.standardDeductionRules;
  let deduction = 0;

  // Helper flags
  const isMarried = marriageStatus === 'married';
  const isJointly = filedJointly === 'jointly';
  const isHeadOfHousehold = dependency === 'yes';
  const isOver65 = age === 'over65';
  const isBlind = blind === 'yes';
  const isQSS = qualifyingSurvivingSpouse === 'yes';

  // Excel logic: QSS overrides everything
  if (isQSS) {
    deduction = rules.base.qualifyingWidow;
    // QSS can also get additional deduction for age/blindness
    if (isOver65) deduction += rules.additional.married;
    if (isBlind) deduction += rules.additional.married;
    return deduction;
  }

  // Head of Household
  if (!isMarried && isHeadOfHousehold) {
    deduction = rules.base.headOfHousehold;
    if (isOver65) deduction += rules.additional.singleOrHeadOfHousehold;
    if (isBlind) deduction += rules.additional.singleOrHeadOfHousehold;
    return deduction;
  }

  // Single
  if (!isMarried && !isHeadOfHousehold) {
    deduction = rules.base.single;
    if (isOver65) deduction += rules.additional.singleOrHeadOfHousehold;
    if (isBlind) deduction += rules.additional.singleOrHeadOfHousehold;
    return deduction;
  }

  // Married Filing Jointly
  if (isMarried && isJointly) {
    deduction = rules.base.marriedFilingJointly;
    // For simplicity, assume only user (not spouse) is over 65/blind (Excel can be extended for spouse)
    if (isOver65) deduction += rules.additional.married;
    if (isBlind) deduction += rules.additional.married;
    return deduction;
  }

  // Married Filing Separately
  if (isMarried && !isJointly) {
    deduction = rules.base.marriedFilingSeparately;
    if (isOver65) deduction += rules.additional.married;
    if (isBlind) deduction += rules.additional.married;
    return deduction;
  }

  // Fallback
  return deduction;
  */
}

/**
 * Calculates federal income tax based on progressive tax brackets.
 * @param {number} taxableIncome - The income amount subject to taxation.
 * @returns {number} The calculated federal income tax.
 */
function calculateFederalIncomeTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;

  const brackets = [...taxData2025.federalTaxBrackets].sort((a, b) => a.lowerBound - b.lowerBound);
  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (let i = brackets.length - 1; i >= 0; i--) {
    const bracket = brackets[i];
    if (remainingIncome > bracket.lowerBound) {
      const incomeInBracket = remainingIncome - bracket.lowerBound;
      totalTax += incomeInBracket * bracket.rate;
      remainingIncome = bracket.lowerBound;
    }
  }

  return totalTax;
}

/**
 * Calculates all taxes and the final after-tax income.
 * @param {number} preTaxIncome - The income before any taxes or deductions.
 * @param {object} userDeductionChoices - Choices for calculating the standard deduction.
 * @param {string} state - The selected state abbreviation (e.g., 'TX').
 * @param {string} residenceInNYC - Whether the user resides in NYC ('Yes' or 'No').
 * @returns {object} An object containing all calculated financial figures.
 */
export function calculateFinancials(preTaxIncome, userDeductionChoices, state, residenceInNYC = 'No') {
  if (isNaN(preTaxIncome) || preTaxIncome < 0) {
    preTaxIncome = 0;
  }

  const standardDeduction = calculateStandardDeduction(); // 2026 single: $16,100
  const taxableIncome = preTaxIncome - standardDeduction;

  const federalIncomeTax = calculateFederalIncomeTax(taxableIncome);
  
  const socialSecurityTaxable = Math.min(taxableIncome, taxData2025.socialSecurity.limit);
  const socialSecurityTax = socialSecurityTaxable * taxData2025.socialSecurity.rate;

  const medicareTax = taxableIncome * taxData2025.medicare.rate;

  // State income tax calculation (progressive) - implementing Excel bracket logic
  let stateIncomeTax = 0;
  let nycTax = 0;
  
  if (state) {
    const brackets = stateTaxData.filter(row => row.state === state).sort((a, b) => a.lowerBound - b.lowerBound);
    
    // Implement the Excel bracket tracking logic
    const bracketResults = [];
    const trackerResults = [];
    
    for (let i = 0; i < brackets.length; i++) {
      const currentBracket = brackets[i];
      const nextBracket = brackets[i + 1];
      
      // State Tracker: =IF(B107='Week 1 - Budgeting'!$E$8,1,0)
      const stateTracker = (currentBracket.state === state) ? 1 : 0;
      
      // Applied Tax Brackets Tracker logic
      let appliedTracker = 0;
      if (stateTracker === 0) {
        appliedTracker = 0;
      } else {
        // Check if previous bracket was "2" (using cumulative sum)
        const previousTrackerSum = trackerResults.slice(0, i).reduce((sum, val) => sum + val, 0);
        
        if (previousTrackerSum >= 1) {
          appliedTracker = 0;
        } else {
          // Check bracket conditions
          const isStateChange = nextBracket ? (currentBracket.state !== nextBracket.state) : false;
          const nextLowerBound = nextBracket ? nextBracket.lowerBound : Infinity;
          
          if (isStateChange && taxableIncome > currentBracket.lowerBound) {
            appliedTracker = 3;
          } else if (taxableIncome >= nextLowerBound) {
            appliedTracker = 1;
          } else {
            appliedTracker = 2;
          }
        }
      }
      
      // "2" Tracker: =IF(F107=2,1,0)
      const tracker = (appliedTracker === 2) ? 1 : 0;
      
      // State Income Taxes calculation
      let bracketTax = 0;
      if (appliedTracker === 1) {
        // Full bracket: (D108-D107)*C107
        const nextLowerBound = nextBracket ? nextBracket.lowerBound : Infinity;
        bracketTax = (nextLowerBound - currentBracket.lowerBound) * currentBracket.rate;
      } else if (appliedTracker === 2 || appliedTracker === 3) {
        // Partial bracket: ($C$2-D107)*C107
        bracketTax = (taxableIncome - currentBracket.lowerBound) * currentBracket.rate;
      }
      
      bracketResults.push(bracketTax);
      trackerResults.push(tracker);
      stateIncomeTax += bracketTax;
    }
    
    // NYC tax calculation (only for NY state residents who live in NYC)
    if (state === 'NY' && residenceInNYC === 'Yes') {
      // NYC tax rates from the screenshot
      if (taxableIncome > 0) {
        if (taxableIncome <= 12000) {
          nycTax = taxableIncome * 0.03078;
        } else if (taxableIncome <= 25000) {
          nycTax = 12000 * 0.03078 + (taxableIncome - 12000) * 0.03762;
        } else if (taxableIncome <= 50000) {
          nycTax = 12000 * 0.03078 + 13000 * 0.03762 + (taxableIncome - 25000) * 0.03819;
        } else {
          nycTax = 12000 * 0.03078 + 13000 * 0.03762 + 25000 * 0.03819 + (taxableIncome - 50000) * 0.03876;
        }
      }
    }
  }

  const totalTax = federalIncomeTax + socialSecurityTax + medicareTax + stateIncomeTax + nycTax;
  
  const afterTaxIncome = preTaxIncome - totalTax;

  return {
    preTaxIncome,
    standardDeduction,
    taxableIncome,
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    stateIncomeTax,
    nycTax,
    totalTax,
    afterTaxIncome,
  };
} 