import React, { createContext, useState, useMemo, useContext } from 'react';
import { calculateFinancials } from '../utils/taxCalculator';
import { supabase } from '../lib/supabaseClient';

// Helper function to calculate federal income tax (copied from taxCalculator.js)
function calculateFederalIncomeTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;

  const federalTaxBrackets = [
    { rate: 0.10, lowerBound: 0 },
    { rate: 0.12, lowerBound: 12400 },
    { rate: 0.22, lowerBound: 50400 },
    { rate: 0.24, lowerBound: 105700 },
    { rate: 0.32, lowerBound: 201775 },
    { rate: 0.35, lowerBound: 256225 },
    { rate: 0.37, lowerBound: 640600 },
  ];

  const brackets = [...federalTaxBrackets].sort((a, b) => a.lowerBound - b.lowerBound);
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

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [topInputs, setTopInputs] = useState({
    preTaxIncome: '100000',
    location: 'NY',
    residenceInNYC: 'Yes',
    housingCosts: 'Medium',
  });

  // User inputs for pre-tax expenses (Insurance and Retirement)
  const [userPreTaxInputs, setUserPreTaxInputs] = useState({
    health_insurance: '',
    life_insurance: '',
    disability_insurance: '',
    traditional_401k: '',
    traditional_ira: '',
  });


  // New: Retirement plan user inputs (shared between Week 1 and Week 6)
  const [retirementInputs, setRetirementInputs] = useState({
    retirement_traditional_401k: '',
    retirement_roth_401k: '',
    retirement_traditional_ira: '',
    retirement_roth_ira: '',
    retirement_simple_ira: '',
    retirement_403b: '',
    retirement_457b: '',
    retirement_thrift: '',
    retirement_private_db: '',
    retirement_gov_db: '',
  });

  // Week 2: Savings user inputs with individual sections
  const [savingsInputs, setSavingsInputs] = useState({
    // Section names (editable)
    down_payment_1_name: 'Down Payment',
    down_payment_2_name: 'Down Payment',
    car_1_name: 'Car',
    car_2_name: 'Car',
    wedding_1_name: 'Wedding',
    wedding_2_name: 'Wedding',
    advanced_degree_1_name: 'Advanced Degree',
    advanced_degree_2_name: 'Advanced Degree',
    vacation_1_name: 'Vacation',
    vacation_2_name: 'Vacation',
    miscellaneous_1_name: 'Miscellaneous',
    miscellaneous_2_name: 'Miscellaneous',
    // Annual earning rates (editable)
    down_payment_1_rate: '',
    down_payment_2_rate: '',
    car_1_rate: '',
    car_2_rate: '',
    wedding_1_rate: '',
    wedding_2_rate: '',
    advanced_degree_1_rate: '',
    advanced_degree_2_rate: '',
    vacation_1_rate: '',
    vacation_2_rate: '',
    miscellaneous_1_rate: '',
    miscellaneous_2_rate: '',
    // Goal amounts
    down_payment_1: '',
    down_payment_2: '',
    car_1: '',
    car_2: '',
    wedding_1: '',
    wedding_2: '',
    advanced_degree_1: '',
    advanced_degree_2: '',
    vacation_1: '',
    vacation_2: '',
    miscellaneous_1: '',
    miscellaneous_2: '',
    // Monthly savings amounts (calculated)
    down_payment_1_monthly: '',
    down_payment_2_monthly: '',
    car_1_monthly: '',
    car_2_monthly: '',
    wedding_1_monthly: '',
    wedding_2_monthly: '',
    advanced_degree_1_monthly: '',
    advanced_degree_2_monthly: '',
    vacation_1_monthly: '',
    vacation_2_monthly: '',
    miscellaneous_1_monthly: '',
    miscellaneous_2_monthly: '',
    // Time to goal (calculated)
    down_payment_1_time: '',
    down_payment_2_time: '',
    car_1_time: '',
    car_2_time: '',
    wedding_1_time: '',
    wedding_2_time: '',
    advanced_degree_1_time: '',
    advanced_degree_2_time: '',
    vacation_1_time: '',
    vacation_2_time: '',
    miscellaneous_1_time: '',
    miscellaneous_2_time: '',
  });

  const financialCalculations = useMemo(() => {
    const preTax = parseFloat(topInputs.preTaxIncome) || 0;
    // Use default deduction choices for single taxpayer
    const defaultDeductionChoices = {
      marriageStatus: 'single',
      filedJointly: 'independently',
      dependency: 'no',
      age: 'under65',
      blind: 'no',
      qualifyingSurvivingSpouse: 'no',
    };
    return calculateFinancials(preTax, defaultDeductionChoices, topInputs.location, topInputs.residenceInNYC);
  }, [topInputs.preTaxIncome, topInputs.location, topInputs.residenceInNYC]);

  // Summary sheet calculations (Week 1 B - Summary)
  const summaryCalculations = useMemo(() => {
    const preTaxIncome = parseFloat(topInputs.preTaxIncome || 0);
    const standardDeduction = 15000; // $15,000 - NEVER CHANGES!
    
    // Debug logging for $1,000,000
    if (preTaxIncome === 1000000) {
      console.log('=== DETAILED TAX CALCULATIONS FOR $1,000,000 ===');
      console.log('Pre-Tax Income:', preTaxIncome);
      console.log('Standard Deduction:', standardDeduction);
    }
    
    // Pre-Tax Expenses calculations (from Budgeting sheet)
    // G28 + G38 (Recommended Insurance + Recommended Retirement) * 12
    const suggestedPreTaxExpenses = 150 * 12; // Health Insurance $150 * 12 months = $1,800
    // E28 + E38 (User Insurance + User Retirement) * 12
    const userPreTaxExpenses = (
      (parseFloat(userPreTaxInputs.health_insurance) || 0) +
      (parseFloat(userPreTaxInputs.life_insurance) || 0) +
      (parseFloat(userPreTaxInputs.disability_insurance) || 0) +
      (parseFloat(userPreTaxInputs.traditional_401k) || 0) +
      (parseFloat(userPreTaxInputs.traditional_ira) || 0)
    ) * 12;
    
    // Taxable Income calculations
    // C9: =C4-C6-C7
    // F9: =F4-F6-F7
    const suggestedTaxableIncome = preTaxIncome - standardDeduction - suggestedPreTaxExpenses;
    const userTaxableIncome = preTaxIncome - standardDeduction - userPreTaxExpenses;
    
    if (preTaxIncome === 1000000) {
      console.log('Suggested Pre-Tax Expenses:', suggestedPreTaxExpenses);
      console.log('User Pre-Tax Expenses:', userPreTaxExpenses);
      console.log('Suggested Taxable Income:', suggestedTaxableIncome);
      console.log('User Taxable Income:', userTaxableIncome);
    }
    
    // SUGGESTED SECTION TAX CALCULATIONS (custom calculation to match Excel exactly)
    
    // Federal Income Tax: Calculate using exact Excel logic
    // Updated for 2026 tax year
    const federalTaxBrackets = [
      { rate: 0.10, lowerBound: 0 },
      { rate: 0.12, lowerBound: 12400 },
      { rate: 0.22, lowerBound: 50400 },
      { rate: 0.24, lowerBound: 105700 },
      { rate: 0.32, lowerBound: 201775 },
      { rate: 0.35, lowerBound: 256225 },
      { rate: 0.37, lowerBound: 640600 },
    ];
    
    let suggestedFederalIncomeTax = 0;
    // If taxable income is negative or zero, no federal tax is owed
    if (suggestedTaxableIncome <= 0) {
      suggestedFederalIncomeTax = 0;
    } else {
    for (let i = 0; i < federalTaxBrackets.length; i++) {
      const currentBracket = federalTaxBrackets[i];
      const nextBracket = federalTaxBrackets[i + 1];
      
      // Applied Tax Brackets Tracker logic (from Excel)
      let appliedTracker;
      if (suggestedTaxableIncome <= currentBracket.lowerBound) {
        appliedTracker = 0; // No tax in this bracket
      } else if (nextBracket && suggestedTaxableIncome >= nextBracket.lowerBound) {
        appliedTracker = 1; // Full bracket
      } else {
        appliedTracker = 2; // Partial bracket (last bracket reached)
      }
      
      // Calculate tax for this bracket based on Excel formula
      let bracketTax = 0;
      if (appliedTracker === 1) {
        // Full bracket: (nextLowerBound - currentLowerBound) * rate
        const nextLowerBound = nextBracket ? nextBracket.lowerBound : Infinity;
        bracketTax = (nextLowerBound - currentBracket.lowerBound) * currentBracket.rate;
      } else if (appliedTracker === 2) {
        // Partial bracket: (taxableIncome - currentLowerBound) * rate
        bracketTax = (suggestedTaxableIncome - currentBracket.lowerBound) * currentBracket.rate;
      }
      
      suggestedFederalIncomeTax += bracketTax;
      }
    }
    
    if (preTaxIncome === 1000000) {
      console.log('Suggested Federal Income Tax:', suggestedFederalIncomeTax);
    }
    
    // Social Security and Medicare: based on original pre-tax income (not taxable income)
    const suggestedSocialSecurityTax = Math.min(preTaxIncome * 0.062, 176100); // MIN(preTaxIncome * 6.2%, 176100)
    const suggestedMedicareTax = preTaxIncome * 0.0145; // 1.45%
    
    if (preTaxIncome === 1000000) {
      console.log('Suggested Social Security Tax:', suggestedSocialSecurityTax);
      console.log('Suggested Medicare Tax:', suggestedMedicareTax);
    }
    
    // State Income Tax: Calculate using exact Excel logic
    const stateTaxBrackets = {
      'AL': [
        { rate: 0.02, lowerBound: 0, upperBound: 500 },
        { rate: 0.04, lowerBound: 500, upperBound: 3000 },
        { rate: 0.05, lowerBound: 3000, upperBound: Infinity },
      ],
      'AK': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'AZ': [
        { rate: 0.025, lowerBound: 0, upperBound: Infinity },
      ],
      'AR': [
        { rate: 0.02, lowerBound: 0, upperBound: 4500 },
        { rate: 0.039, lowerBound: 4500, upperBound: Infinity },
      ],
      'CA': [
        { rate: 0.01, lowerBound: 0, upperBound: 10756 },
        { rate: 0.02, lowerBound: 10756, upperBound: 25499 },
        { rate: 0.04, lowerBound: 25499, upperBound: 40245 },
        { rate: 0.06, lowerBound: 40245, upperBound: 55866 },
        { rate: 0.08, lowerBound: 55866, upperBound: 70606 },
        { rate: 0.093, lowerBound: 70606, upperBound: 360659 },
        { rate: 0.103, lowerBound: 360659, upperBound: 432787 },
        { rate: 0.123, lowerBound: 432787, upperBound: 721314 },
        { rate: 0.133, lowerBound: 721314, upperBound: 1000000 },
        { rate: 0.143, lowerBound: 1000000, upperBound: Infinity },
      ],
      'CO': [
        { rate: 0.044, lowerBound: 0, upperBound: Infinity },
      ],
      'CT': [
        { rate: 0.02, lowerBound: 0, upperBound: 10000 },
        { rate: 0.045, lowerBound: 10000, upperBound: 50000 },
        { rate: 0.055, lowerBound: 50000, upperBound: 100000 },
        { rate: 0.06, lowerBound: 100000, upperBound: 200000 },
        { rate: 0.065, lowerBound: 200000, upperBound: 250000 },
        { rate: 0.069, lowerBound: 250000, upperBound: 500000 },
        { rate: 0.0699, lowerBound: 500000, upperBound: Infinity },
      ],
      'DE': [
        { rate: 0.00, lowerBound: 0, upperBound: 2000 },
        { rate: 0.022, lowerBound: 2000, upperBound: 5000 },
        { rate: 0.039, lowerBound: 5000, upperBound: 10000 },
        { rate: 0.048, lowerBound: 10000, upperBound: 20000 },
        { rate: 0.052, lowerBound: 20000, upperBound: 25000 },
        { rate: 0.0555, lowerBound: 25000, upperBound: 60000 },
        { rate: 0.066, lowerBound: 60000, upperBound: Infinity },
      ],
      'FL': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'GA': [
        { rate: 0.0539, lowerBound: 0, upperBound: Infinity },
      ],
      'HI': [
        { rate: 0.014, lowerBound: 0, upperBound: 9600 },
        { rate: 0.032, lowerBound: 9600, upperBound: 14400 },
        { rate: 0.055, lowerBound: 14400, upperBound: 19200 },
        { rate: 0.064, lowerBound: 19200, upperBound: 24000 },
        { rate: 0.068, lowerBound: 24000, upperBound: 36000 },
        { rate: 0.072, lowerBound: 36000, upperBound: 48000 },
        { rate: 0.076, lowerBound: 48000, upperBound: 125000 },
        { rate: 0.0825, lowerBound: 125000, upperBound: 175000 },
        { rate: 0.09, lowerBound: 175000, upperBound: 225000 },
        { rate: 0.10, lowerBound: 225000, upperBound: 275000 },
        { rate: 0.11, lowerBound: 275000, upperBound: 325000 },
        { rate: 0.12, lowerBound: 325000, upperBound: Infinity },
      ],
      'ID': [
        { rate: 0.00, lowerBound: 0, upperBound: 4673 },
        { rate: 0.05695, lowerBound: 4673, upperBound: Infinity },
      ],
      'IL': [
        { rate: 0.0495, lowerBound: 0, upperBound: Infinity },
      ],
      'IN': [
        { rate: 0.03, lowerBound: 0, upperBound: Infinity },
      ],
      'IA': [
        { rate: 0.038, lowerBound: 0, upperBound: Infinity },
      ],
      'KS': [
        { rate: 0.052, lowerBound: 0, upperBound: 23000 },
        { rate: 0.0558, lowerBound: 23000, upperBound: Infinity },
      ],
      'KY': [
        { rate: 0.04, lowerBound: 0, upperBound: Infinity },
      ],
      'LA': [
        { rate: 0.03, lowerBound: 0, upperBound: Infinity },
      ],
      'ME': [
        { rate: 0.058, lowerBound: 0, upperBound: 26800 },
        { rate: 0.0675, lowerBound: 26800, upperBound: 63450 },
        { rate: 0.0715, lowerBound: 63450, upperBound: Infinity },
      ],
      'MD': [
        { rate: 0.02, lowerBound: 0, upperBound: 1000 },
        { rate: 0.03, lowerBound: 1000, upperBound: 2000 },
        { rate: 0.04, lowerBound: 2000, upperBound: 3000 },
        { rate: 0.0475, lowerBound: 3000, upperBound: 100000 },
        { rate: 0.05, lowerBound: 100000, upperBound: 125000 },
        { rate: 0.0525, lowerBound: 125000, upperBound: 150000 },
        { rate: 0.055, lowerBound: 150000, upperBound: 250000 },
        { rate: 0.0575, lowerBound: 250000, upperBound: Infinity },
      ],
      'MA': [
        { rate: 0.05, lowerBound: 0, upperBound: 1083150 },
        { rate: 0.09, lowerBound: 1083150, upperBound: Infinity },
      ],
      'MI': [
        { rate: 0.0425, lowerBound: 0, upperBound: Infinity },
      ],
      'MN': [
        { rate: 0.0535, lowerBound: 0, upperBound: 32570 },
        { rate: 0.068, lowerBound: 32570, upperBound: 106990 },
        { rate: 0.0785, lowerBound: 106990, upperBound: 198630 },
        { rate: 0.0985, lowerBound: 198630, upperBound: Infinity },
      ],
      'MS': [
        { rate: 0.00, lowerBound: 0, upperBound: 10000 },
        { rate: 0.044, lowerBound: 10000, upperBound: Infinity },
      ],
      'MO': [
        { rate: 0.02, lowerBound: 1313, upperBound: 2626 },
        { rate: 0.025, lowerBound: 2626, upperBound: 3939 },
        { rate: 0.03, lowerBound: 3939, upperBound: 5252 },
        { rate: 0.035, lowerBound: 5252, upperBound: 6565 },
        { rate: 0.04, lowerBound: 6565, upperBound: 7878 },
        { rate: 0.045, lowerBound: 7878, upperBound: 9191 },
        { rate: 0.047, lowerBound: 9191, upperBound: Infinity },
      ],
      'MT': [
        { rate: 0.047, lowerBound: 0, upperBound: 21100 },
        { rate: 0.059, lowerBound: 21100, upperBound: Infinity },
      ],
      'NE': [
        { rate: 0.0246, lowerBound: 0, upperBound: 4030 },
        { rate: 0.0351, lowerBound: 4030, upperBound: 24120 },
        { rate: 0.0501, lowerBound: 24120, upperBound: 38870 },
        { rate: 0.052, lowerBound: 38870, upperBound: Infinity },
      ],
      'NV': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'NH': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'NJ': [
        { rate: 0.014, lowerBound: 0, upperBound: 20000 },
        { rate: 0.0175, lowerBound: 20000, upperBound: 35000 },
        { rate: 0.035, lowerBound: 35000, upperBound: 40000 },
        { rate: 0.05525, lowerBound: 40000, upperBound: 75000 },
        { rate: 0.0637, lowerBound: 75000, upperBound: 500000 },
        { rate: 0.0897, lowerBound: 500000, upperBound: 1000000 },
        { rate: 0.1075, lowerBound: 1000000, upperBound: Infinity },
      ],
      'NM': [
        { rate: 0.015, lowerBound: 0, upperBound: 5500 },
        { rate: 0.032, lowerBound: 5500, upperBound: 16500 },
        { rate: 0.043, lowerBound: 16500, upperBound: 33500 },
        { rate: 0.047, lowerBound: 33500, upperBound: 66500 },
        { rate: 0.049, lowerBound: 66500, upperBound: 210000 },
        { rate: 0.059, lowerBound: 210000, upperBound: Infinity },
      ],
      'NC': [
        { rate: 0.0425, lowerBound: 0, upperBound: Infinity },
      ],
      'ND': [
        { rate: 0.00, lowerBound: 0, upperBound: 48475 },
        { rate: 0.0195, lowerBound: 48475, upperBound: 244825 },
        { rate: 0.025, lowerBound: 244825, upperBound: Infinity },
      ],
      'OH': [
        { rate: 0.00, lowerBound: 0, upperBound: 26050 },
        { rate: 0.0275, lowerBound: 26050, upperBound: 100000 },
        { rate: 0.035, lowerBound: 100000, upperBound: Infinity },
      ],
      'OK': [
        { rate: 0.0025, lowerBound: 0, upperBound: 1000 },
        { rate: 0.0075, lowerBound: 1000, upperBound: 2500 },
        { rate: 0.0175, lowerBound: 2500, upperBound: 3750 },
        { rate: 0.0275, lowerBound: 3750, upperBound: 4900 },
        { rate: 0.0375, lowerBound: 4900, upperBound: 7200 },
        { rate: 0.0475, lowerBound: 7200, upperBound: Infinity },
      ],
      'OR': [
        { rate: 0.0475, lowerBound: 0, upperBound: 4400 },
        { rate: 0.0675, lowerBound: 4400, upperBound: 11050 },
        { rate: 0.0875, lowerBound: 11050, upperBound: 125000 },
        { rate: 0.099, lowerBound: 125000, upperBound: Infinity },
      ],
      'PA': [
        { rate: 0.0307, lowerBound: 0, upperBound: Infinity },
      ],
      'RI': [
        { rate: 0.0375, lowerBound: 0, upperBound: 79900 },
        { rate: 0.0475, lowerBound: 79900, upperBound: 181650 },
        { rate: 0.0599, lowerBound: 181650, upperBound: Infinity },
      ],
      'SC': [
        { rate: 0.00, lowerBound: 0, upperBound: 3560 },
        { rate: 0.03, lowerBound: 3560, upperBound: 17830 },
        { rate: 0.062, lowerBound: 17830, upperBound: Infinity },
      ],
      'SD': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'TN': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'TX': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'UT': [
        { rate: 0.0455, lowerBound: 0, upperBound: Infinity },
      ],
      'VT': [
        { rate: 0.0335, lowerBound: 0, upperBound: 47900 },
        { rate: 0.066, lowerBound: 47900, upperBound: 116000 },
        { rate: 0.076, lowerBound: 116000, upperBound: 242000 },
        { rate: 0.0875, lowerBound: 242000, upperBound: Infinity },
      ],
      'VA': [
        { rate: 0.02, lowerBound: 0, upperBound: 3000 },
        { rate: 0.03, lowerBound: 3000, upperBound: 5000 },
        { rate: 0.05, lowerBound: 5000, upperBound: 17000 },
        { rate: 0.0575, lowerBound: 17000, upperBound: Infinity },
      ],
      'WA': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'WV': [
        { rate: 0.0222, lowerBound: 0, upperBound: 10000 },
        { rate: 0.0296, lowerBound: 10000, upperBound: 25000 },
        { rate: 0.0333, lowerBound: 25000, upperBound: 40000 },
        { rate: 0.0444, lowerBound: 40000, upperBound: 60000 },
        { rate: 0.0482, lowerBound: 60000, upperBound: Infinity },
      ],
      'WI': [
        { rate: 0.035, lowerBound: 0, upperBound: 14680 },
        { rate: 0.044, lowerBound: 14680, upperBound: 29370 },
        { rate: 0.053, lowerBound: 29370, upperBound: 323290 },
        { rate: 0.0765, lowerBound: 323290, upperBound: Infinity },
      ],
      'WY': [
        { rate: 0.00, lowerBound: 0, upperBound: Infinity },
      ],
      'DC': [
        { rate: 0.04, lowerBound: 0, upperBound: 10000 },
        { rate: 0.06, lowerBound: 10000, upperBound: 40000 },
        { rate: 0.065, lowerBound: 40000, upperBound: 60000 },
        { rate: 0.085, lowerBound: 60000, upperBound: 250000 },
        { rate: 0.0925, lowerBound: 250000, upperBound: 500000 },
        { rate: 0.0975, lowerBound: 500000, upperBound: 1000000 },
        { rate: 0.1075, lowerBound: 1000000, upperBound: Infinity },
      ],
      'NY': [
        { rate: 0.04, lowerBound: 0, upperBound: 8500 },
        { rate: 0.045, lowerBound: 8500, upperBound: 11700 },
        { rate: 0.0525, lowerBound: 11700, upperBound: 13900 },
        { rate: 0.055, lowerBound: 13900, upperBound: 80650 },
        { rate: 0.06, lowerBound: 80650, upperBound: 215400 },
        { rate: 0.0685, lowerBound: 215400, upperBound: 1077550 },
        { rate: 0.0965, lowerBound: 1077550, upperBound: 5000000 },
        { rate: 0.103, lowerBound: 5000000, upperBound: 25000000 },
        { rate: 0.109, lowerBound: 25000000, upperBound: Infinity },
      ],
    };
    
    let suggestedStateIncomeTax = 0;
    
    // Calculate state tax for any state
    if (topInputs.location && stateTaxBrackets[topInputs.location]) {
      const stateBrackets = stateTaxBrackets[topInputs.location];
      
      for (let i = 0; i < stateBrackets.length; i++) {
        const currentBracket = stateBrackets[i];
        
        // Applied Tax Brackets Tracker logic (from Excel)
        let appliedTracker;
        
        if (suggestedTaxableIncome < currentBracket.lowerBound) {
          appliedTracker = 0; // No tax in this bracket
        } else if (suggestedTaxableIncome >= currentBracket.upperBound) {
          appliedTracker = 1; // Full bracket
        } else {
          appliedTracker = 2; // Partial bracket (last bracket reached)
        }
        
        // Special case: if taxable income is negative and we're in the first bracket (lowerBound = 0), treat as partial bracket
        if (suggestedTaxableIncome < 0 && currentBracket.lowerBound === 0) {
          appliedTracker = 2;
        }
        
        // Calculate tax for this bracket using Excel formula logic
        let bracketTax = 0;
        if (appliedTracker === 1) {
          // Full bracket: (upperBound - lowerBound) * rate
          bracketTax = (currentBracket.upperBound - currentBracket.lowerBound) * currentBracket.rate;
        } else if (appliedTracker === 2) {
          // Partial bracket: (taxableIncome - lowerBound) * rate
          bracketTax = (suggestedTaxableIncome - currentBracket.lowerBound) * currentBracket.rate;
        }
        
        if (preTaxIncome === 100000 || preTaxIncome === 250000) {
          console.log(`Bracket ${i}: ${currentBracket.lowerBound} to ${currentBracket.upperBound}, rate: ${currentBracket.rate}%, appliedTracker: ${appliedTracker}, bracketTax: $${bracketTax.toFixed(2)}`);
        }
        
        suggestedStateIncomeTax += bracketTax;
      }
    }
    
    if (preTaxIncome === 1000000) {
      console.log('Suggested State Income Tax:', suggestedStateIncomeTax);
    }
    
    // NYC Tax: Calculate using exact Excel logic (only if residenceInNYC is 'Yes')
    let suggestedNYCTax = 0;
    if (topInputs.location === 'NY' && topInputs.residenceInNYC === 'Yes') {
      // NYC Tax Brackets (from Excel)
      const nycTaxBrackets = [
        { rate: 0.0308, lowerBound: 0, upperBound: 12000 },
        { rate: 0.0376, lowerBound: 12000, upperBound: 25000 },
        { rate: 0.0382, lowerBound: 25000, upperBound: 50000 },
        { rate: 0.0388, lowerBound: 50000, upperBound: Infinity },
      ];
      
      for (let i = 0; i < nycTaxBrackets.length; i++) {
        const currentBracket = nycTaxBrackets[i];
        
        // Applied Tax Brackets Tracker logic (from Excel)
        let appliedTracker;
        
        if (suggestedTaxableIncome < currentBracket.lowerBound) {
          appliedTracker = 0; // No tax in this bracket
        } else if (suggestedTaxableIncome >= currentBracket.upperBound) {
          appliedTracker = 1; // Full bracket
        } else {
          appliedTracker = 3; // Partial bracket (last bracket reached)
        }
        
        // Special case: if taxable income is negative and we're in the first bracket (lowerBound = 0), treat as partial bracket
        if (suggestedTaxableIncome < 0 && currentBracket.lowerBound === 0) {
          appliedTracker = 3;
        }
        
        // Calculate tax for this bracket using Excel formula logic
        let bracketTax = 0;
        if (appliedTracker === 1) {
          // Full bracket: (upperBound - lowerBound) * rate
          bracketTax = (currentBracket.upperBound - currentBracket.lowerBound) * currentBracket.rate;
        } else if (appliedTracker === 3) {
          // Partial bracket: (taxableIncome - lowerBound) * rate
          bracketTax = (suggestedTaxableIncome - currentBracket.lowerBound) * currentBracket.rate;
        }
        
        suggestedNYCTax += bracketTax;
      }
    }
    
    if (preTaxIncome === 1000000) {
      console.log('Suggested NYC Tax:', suggestedNYCTax);
    }
    
    // USER SECTION TAX CALCULATIONS
    // Calculate user's actual taxes based on their pre-tax expense inputs
    const userFederalIncomeTax = calculateFederalIncomeTax(userTaxableIncome);
    
    if (preTaxIncome === 1000000) {
      console.log('User Federal Income Tax:', userFederalIncomeTax);
    }
    
    // Social Security and Medicare: based on original pre-tax income (not taxable income)
    const userSocialSecurityTax = Math.min(preTaxIncome * 0.062, 176100); // MIN(preTaxIncome * 6.2%, 176100)
    const userMedicareTax = preTaxIncome * 0.0145; // 1.45%
    
    if (preTaxIncome === 1000000) {
      console.log('User Social Security Tax:', userSocialSecurityTax);
      console.log('User Medicare Tax:', userMedicareTax);
    }
    
    // State Income Tax: Calculate using exact Excel logic for user's taxable income
    let userStateIncomeTax = 0;
    if (topInputs.location && stateTaxBrackets[topInputs.location]) {
      const stateBrackets = stateTaxBrackets[topInputs.location];
      
      for (let i = 0; i < stateBrackets.length; i++) {
        const currentBracket = stateBrackets[i];
        
        // Applied Tax Brackets Tracker logic (from Excel) - DIFFERENT from suggested
        let appliedTracker;
        
        if (userTaxableIncome < currentBracket.lowerBound) {
          appliedTracker = 0; // No tax in this bracket
        } else if (userTaxableIncome >= currentBracket.upperBound) {
          appliedTracker = 1; // Full bracket
        } else {
          appliedTracker = 2; // Partial bracket (last bracket reached)
        }
        
        // Special case: if taxable income is negative and we're in the first bracket (lowerBound = 0), treat as partial bracket
        if (userTaxableIncome < 0 && currentBracket.lowerBound === 0) {
          appliedTracker = 2;
        }
        
        // Calculate tax for this bracket using Excel formula logic
        let bracketTax = 0;
        if (appliedTracker === 1) {
          // Full bracket: (upperBound - lowerBound) * rate
          bracketTax = (currentBracket.upperBound - currentBracket.lowerBound) * currentBracket.rate;
        } else if (appliedTracker === 2) {
          // Partial bracket: (taxableIncome - lowerBound) * rate
          bracketTax = (userTaxableIncome - currentBracket.lowerBound) * currentBracket.rate;
        }
        
        if (preTaxIncome === 100000 || preTaxIncome === 250000) {
          console.log(`USER Bracket ${i}: ${currentBracket.lowerBound} to ${currentBracket.upperBound}, rate: ${currentBracket.rate}%, appliedTracker: ${appliedTracker}, bracketTax: $${bracketTax.toFixed(2)}`);
        }
        
        userStateIncomeTax += bracketTax;
      }
    }
    
    // NYC Tax: Calculate using exact Excel logic (only if residenceInNYC is 'Yes')
    let userNYCTax = 0;
    if (topInputs.location === 'NY' && topInputs.residenceInNYC === 'Yes') {
      // NYC Tax Brackets (from Excel)
      const nycTaxBrackets = [
        { rate: 0.0308, lowerBound: 0, upperBound: 12000 },
        { rate: 0.0376, lowerBound: 12000, upperBound: 25000 },
        { rate: 0.0382, lowerBound: 25000, upperBound: 50000 },
        { rate: 0.0388, lowerBound: 50000, upperBound: Infinity },
      ];
      
      for (let i = 0; i < nycTaxBrackets.length; i++) {
        const currentBracket = nycTaxBrackets[i];
        
        // Applied Tax Brackets Tracker logic (from Excel)
        let appliedTracker;
        
        if (userTaxableIncome < currentBracket.lowerBound) {
          appliedTracker = 0; // No tax in this bracket
        } else if (userTaxableIncome >= currentBracket.upperBound) {
          appliedTracker = 1; // Full bracket
        } else {
          appliedTracker = 3; // Partial bracket (last bracket reached)
        }
        
        // Special case: if taxable income is negative and we're in the first bracket (lowerBound = 0), treat as partial bracket
        if (userTaxableIncome < 0 && currentBracket.lowerBound === 0) {
          appliedTracker = 3;
        }
        
        // Calculate tax for this bracket using Excel formula logic
        let bracketTax = 0;
        if (appliedTracker === 1) {
          // Full bracket: (upperBound - lowerBound) * rate
          bracketTax = (currentBracket.upperBound - currentBracket.lowerBound) * currentBracket.rate;
        } else if (appliedTracker === 3) {
          // Partial bracket: (taxableIncome - lowerBound) * rate
          bracketTax = (userTaxableIncome - currentBracket.lowerBound) * currentBracket.rate;
        }
        
        if (preTaxIncome === 100000 || preTaxIncome === 250000) {
          console.log(`USER NYC Bracket ${i}: ${currentBracket.lowerBound} to ${currentBracket.upperBound}, rate: ${currentBracket.rate}%, appliedTracker: ${appliedTracker}, bracketTax: $${bracketTax.toFixed(2)}`);
        }
        
        userNYCTax += bracketTax;
      }
    }
    
    // After Tax Income calculations
    // C18: =MAX(C9-SUM(C11:C16)+C6,0) - Taxable Income minus all taxes plus Standard Deduction
    // F18: =MAX(F9-SUM(F11:F16)+F6,0) - Taxable Income minus all taxes plus Standard Deduction
    const suggestedAfterTaxIncome = Math.max(
      suggestedTaxableIncome - (suggestedFederalIncomeTax + suggestedSocialSecurityTax + suggestedMedicareTax + suggestedStateIncomeTax + suggestedNYCTax) + standardDeduction,
      0
    );
    
    const userAfterTaxIncome = Math.max(
      userTaxableIncome - (userFederalIncomeTax + userSocialSecurityTax + userMedicareTax + userStateIncomeTax + userNYCTax) + standardDeduction,
      0
    );
    
    if (preTaxIncome === 1000000 || preTaxIncome === 20000 || preTaxIncome === 10000) {
      console.log('=== DEBUG CALCULATIONS FOR INCOME:', preTaxIncome, '===');
      console.log('Pre-Tax Income:', preTaxIncome);
      console.log('Standard Deduction:', standardDeduction);
      console.log('Suggested Taxable Income:', suggestedTaxableIncome);
      console.log('User Taxable Income:', userTaxableIncome);
      console.log('Suggested Federal Tax:', suggestedFederalIncomeTax);
      console.log('Suggested Social Security Tax:', suggestedSocialSecurityTax);
      console.log('Suggested Medicare Tax:', suggestedMedicareTax);
      console.log('Suggested State Tax:', suggestedStateIncomeTax);
      console.log('Suggested NYC Tax:', suggestedNYCTax);
      console.log('User Federal Tax:', userFederalIncomeTax);
      console.log('User Social Security Tax:', userSocialSecurityTax);
      console.log('User Medicare Tax:', userMedicareTax);
      console.log('User State Tax:', userStateIncomeTax);
      console.log('User NYC Tax:', userNYCTax);
      console.log('Suggested After Tax Income:', suggestedAfterTaxIncome);
      console.log('User After Tax Income:', userAfterTaxIncome);
      console.log('=== END DEBUG CALCULATIONS ===');
    }
    
    return {
      preTaxIncome, // C4, F4
      standardDeduction, // C6, F6
      suggestedPreTaxExpenses, // C7
      userPreTaxExpenses, // F7
      suggestedTaxableIncome, // C9
      userTaxableIncome, // F9
      suggestedFederalIncomeTax, // C11
      suggestedSocialSecurityTax, // C12
      suggestedMedicareTax, // C13
      suggestedStateIncomeTax, // C15
      suggestedNYCTax, // C16
      userFederalIncomeTax, // F11
      userSocialSecurityTax, // F12
      userMedicareTax, // F13
      userStateIncomeTax, // F15
      userNYCTax, // F16
      suggestedAfterTaxIncome, // C18
      userAfterTaxIncome, // F18
      zeroPretaxTaxableIncome: preTaxIncome - standardDeduction, // C22
    };
  }, [topInputs.preTaxIncome, financialCalculations, userPreTaxInputs]);

  // Week 2: Savings calculations matching Excel structure
  const savingsCalculations = useMemo(() => {
    const monthlyAfterTaxIncome = summaryCalculations.userAfterTaxIncome / 12;
    const annualEarningRate = 0.04; // 4% as shown in Excel
    
    // Calculate savings goal details for each goal
    const calculateGoalDetails = (goalAmount) => {
      const amount = parseFloat(goalAmount) || 0;
      if (amount <= 0) return { monthlySavings: 0, percentage: 0, timeToGoal: 0 };
      
      // Calculate monthly savings needed to reach goal in 60 months (5 years) with 4% annual return
      // Using future value formula: FV = PMT * [((1 + r)^n - 1) / r]
      // Solving for PMT: PMT = FV / [((1 + r)^n - 1) / r]
      const monthlyRate = annualEarningRate / 12;
      const months = 60; // 5 years as shown in Excel
      const futureValueFactor = ((1 + monthlyRate) ** months - 1) / monthlyRate;
      const monthlySavings = amount / futureValueFactor;
      
      const percentage = monthlyAfterTaxIncome > 0 ? (monthlySavings / monthlyAfterTaxIncome) * 100 : 0;
      
      return {
        monthlySavings,
        percentage,
        timeToGoal: months
      };
    };

    // Calculate details for each savings goal
    const goalDetails = {};
    Object.keys(savingsInputs).forEach(key => {
      goalDetails[key] = calculateGoalDetails(savingsInputs[key]);
    });

    // Calculate total monthly savings
    const totalMonthlySavings = Object.values(goalDetails).reduce((sum, details) => {
      return sum + details.monthlySavings;
    }, 0);

    // Calculate total savings rate
    const totalSavingsRate = monthlyAfterTaxIncome > 0 ? (totalMonthlySavings / monthlyAfterTaxIncome) * 100 : 0;

    return {
      monthlyAfterTaxIncome,
      annualEarningRate,
      goalDetails,
      totalMonthlySavings,
      totalSavingsRate,
    };
  }, [summaryCalculations.userAfterTaxIncome, savingsInputs]);

  // Supabase functions for data persistence
  const saveBudgetData = async (userInputs, customExpenseNames, sectionStates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const budgetData = {
        user_id: user.id,
        top_inputs: topInputs,
        user_inputs: userInputs,
        custom_expense_names: customExpenseNames,
        section_states: sectionStates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('budget_data')
        .upsert(budgetData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving budget data:', error);
      return { success: false, error: error.message };
    }
  };

  const loadBudgetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('budget_data')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error loading budget data:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    topInputs,
    setTopInputs,
    financialCalculations,
    summaryCalculations,
    retirementInputs,
    setRetirementInputs,
    userPreTaxInputs,
    setUserPreTaxInputs,
    savingsInputs,
    setSavingsInputs,
    savingsCalculations,
    saveBudgetData,
    loadBudgetData,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 