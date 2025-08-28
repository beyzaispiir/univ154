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
function calculateStandardDeduction({
  marriageStatus,
  filedJointly,
  dependency,
  age,
  blind,
  qualifyingSurvivingSpouse
}) {
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
 * @returns {object} An object containing all calculated financial figures.
 */
export function calculateFinancials(preTaxIncome, userDeductionChoices, state) {
  if (isNaN(preTaxIncome) || preTaxIncome < 0) {
    preTaxIncome = 0;
  }

  const standardDeduction = calculateStandardDeduction(userDeductionChoices);
  const taxableIncome = preTaxIncome - standardDeduction;

  const federalIncomeTax = calculateFederalIncomeTax(taxableIncome);
  
  const socialSecurityTaxable = Math.min(taxableIncome, taxData2025.socialSecurity.limit);
  const socialSecurityTax = socialSecurityTaxable * taxData2025.socialSecurity.rate;

  const medicareTax = taxableIncome * taxData2025.medicare.rate;

  // State income tax calculation (progressive)
  let stateIncomeTax = 0;
  if (state) {
    const brackets = stateTaxData.filter(row => row.state === state).sort((a, b) => a.lowerBound - b.lowerBound);
    let remainingIncome = taxableIncome;
    for (let i = brackets.length - 1; i >= 0; i--) {
      const bracket = brackets[i];
      if (remainingIncome > bracket.lowerBound) {
        const incomeInBracket = remainingIncome - bracket.lowerBound;
        stateIncomeTax += incomeInBracket * bracket.rate;
        remainingIncome = bracket.lowerBound;
      }
    }
  }

  const totalTax = federalIncomeTax + socialSecurityTax + medicareTax + stateIncomeTax;
  
  const afterTaxIncome = preTaxIncome - totalTax;

  return {
    preTaxIncome,
    standardDeduction,
    taxableIncome,
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    stateIncomeTax,
    totalTax,
    afterTaxIncome,
  };
} 