import React, { useState, useMemo, useEffect } from 'react';
import stateTaxData from '../data/stateTaxData';
import { useBudget } from '../contexts/BudgetContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Inline styles matching Week 1, 2, 3 for consistency
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontSize: '14px',
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e9ecef'
  },
  enhancedHeader: {
    backgroundColor: '#002060',
    color: 'white',
    padding: '20px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '18px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 32, 96, 0.3)'
  },
  sectionDivider: {
    height: '3px',
    background: 'linear-gradient(90deg, #002060, #28a745, #002060)',
    margin: '20px 0',
    borderRadius: '2px',
    boxShadow: '0 2px 4px rgba(0, 32, 96, 0.2)'
  },
  section: {
    marginBottom: 48,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    background: '#fff',
    padding: '32px 2vw',
  },
  header: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#002060',
    marginBottom: 18,
  },
  subHeader: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#002060',
    margin: '18px 0 10px 0',
  },
  table: {
    width: '70%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: 10,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    marginBottom: 18,
    marginLeft: 'auto',
    marginRight: 'auto', // ya da kısaca:
    // margin: '10px auto 18px auto',
  },
  
  th: {
    backgroundColor: '#002060',
    color: 'white',
    padding: '12px',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center',
    fontWeight: 600,
  },
  td: {
    border: '1px solid #e0e0e0',
    padding: '10px 12px',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'right',
    backgroundColor: '#fffde7',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  readOnly: {
    textAlign: 'right',
    paddingRight: '12px',
    color: '#555',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
  chartPlaceholder: {
    width: '70%',
    height: 300,
    background: '#eef2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: 18,
    borderRadius: '12px',
    margin: '24px auto',
  },
  info: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid #bfdbfe',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    borderRadius: '14px',
    padding: '12px 20px',
    color: '#0d1a4b',
    fontWeight: 500,
    fontSize: 12,
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

function simulate401k({
  startAge,
  endAge,
  annualPayment,
  returnRate,
  employerMatch,
  maxContribution,
}) {
  const ages = [];
  const years = [];
  const annualContributions = [];
  const employerMatches = [];
  const totalContributions = [];
  const balances = [];
  let balance = 0;
  let year = 0; // Start from 0 to match Excel
  for (let age = startAge; age <= endAge; age++, year++) {
    ages.push(age);
    years.push(year);
    // Annual contribution logic (capped by maxContribution)
    let contribution = Math.min(annualPayment, maxContribution);
    annualContributions.push(contribution);
    // Employer match
    let match = contribution * (employerMatch / 100);
    employerMatches.push(match);
    // Total contribution
    let total = contribution + match;
    totalContributions.push(total);
    // Account balance (future value)
    balance = balance * (1 + returnRate / 100) + total;
    balances.push(balance);
  }
  return { ages, years, annualContributions, employerMatches, totalContributions, balances };
}

// Helper to get last valid value in array (like Excel INDEX(..., MATCH(1E+99, ...)))
function getLastValid(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null && !isNaN(arr[i])) { // allow 0 as valid
      return arr[i];
    }
  }
  return 0;
}

export default function Week6Retirement() {
  const { topInputs, retirementInputs, setRetirementInputs, financialCalculations, summaryCalculations, saveBudgetData, loadBudgetData } = useBudget() || {};

  // Handler functions for save/load
  const handleSaveWeek6 = async () => {
    try {
      const week6Data = {
        retirementPlanningInputs,
        monthlyPayments,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('week6_data', JSON.stringify(week6Data));
      alert('Week 6 data saved successfully!');
    } catch (error) {
      console.error('Error saving Week 6 data:', error);
      alert('Error saving Week 6 data. Please try again.');
    }
  };

  const handleLoadWeek6 = async () => {
    try {
      const savedData = localStorage.getItem('week6_data');
      
      if (savedData) {
        const week6Data = JSON.parse(savedData);
        
        // Load retirement planning inputs
        if (week6Data.retirementPlanningInputs) {
          setRetirementPlanningInputs(week6Data.retirementPlanningInputs);
        }
        
        // Load monthly payments
        if (week6Data.monthlyPayments) {
          setMonthlyPayments(week6Data.monthlyPayments);
        }
        
        alert('Week 6 data loaded successfully!');
      } else {
        alert('No saved data found for Week 6.');
      }
    } catch (error) {
      console.error('Error loading Week 6 data:', error);
      alert('Error loading Week 6 data. Please try again.');
    }
  };
  const selectedState = topInputs?.location;
  const stateBrackets = selectedState ? stateTaxData.filter(row => row.state === selectedState) : [];

  // Shared input state
  const [startAge, setStartAge] = useState(20);
  const [endAge, setEndAge] = useState(70);
  // Remove maxContribution state, make it computed

  // Series A
  const [annualPaymentA, setAnnualPaymentA] = useState(4638);
  const [returnRateA, setReturnRateA] = useState(7);
  const [employerMatchA, setEmployerMatchA] = useState(3);
  const [withdrawalRateA, setWithdrawalRateA] = useState(6);

  // Series B
  const [annualPaymentB, setAnnualPaymentB] = useState(10000);
  const [returnRateB, setReturnRateB] = useState(7);
  const [employerMatchB, setEmployerMatchB] = useState(3);
  const [withdrawalRateB, setWithdrawalRateB] = useState(6);

  // Series C
  const [annualPaymentC, setAnnualPaymentC] = useState(15353);
  const [returnRateC, setReturnRateC] = useState(7);
  const [employerMatchC, setEmployerMatchC] = useState(3);
  const [withdrawalRateC, setWithdrawalRateC] = useState(6);

  // New Retirement Budgeting state with default values
  const [retirementBudgetedAmounts, setRetirementBudgetedAmounts] = useState({
    traditional_401k: '',
    roth_401k: '',
    traditional_ira: '',
    roth_ira: ''
  });

  // Error state for validation messages
  const [validationErrors, setValidationErrors] = useState({});

  // Calculate default values based on Week 1 recommendations
  const getDefaultBudgetedAmount = (type) => {
    const defaultValue = 386.526666666667; // Default value you want
    return Math.round(defaultValue); // Round to 387 for display
  };

  const [deferralPercentage, setDeferralPercentage] = useState(5);

  // State for monthly payment inputs in retirement planning sections
  const [monthlyPayments, setMonthlyPayments] = useState({
    traditional_401k_a: 387,
    traditional_401k_b: 833,
    traditional_401k_c: 1279,
    roth_401k_a: 387,
    roth_401k_b: 833,
    roth_401k_c: 1279,
    traditional_ira_a: 300,
    traditional_ira_b: 400,
    traditional_ira_c: 500,
    roth_ira_a: 300,
    roth_ira_b: 400,
    roth_ira_c: 500
  });

  // State for validation errors in monthly payment inputs
  const [monthlyPaymentErrors, setMonthlyPaymentErrors] = useState({});

  // State for table visibility filters
  const [tableVisibility, setTableVisibility] = useState({
    traditional401kSeriesA: false,
    traditional401kSeriesB: false,
    traditional401kSeriesC: false,
    roth401kSeriesA: false,
    roth401kSeriesB: false,
    roth401kSeriesC: false,
    traditionalIRASeriesA: false,
    traditionalIRASeriesB: false,
    traditionalIRASeriesC: false,
    rothIRASeriesA: false,
    rothIRASeriesB: false,
    rothIRASeriesC: false
  });

  // State for selected series
  const [selectedSeries, setSelectedSeries] = useState('none');
  const [selectedWithdrawalSeries, setSelectedWithdrawalSeries] = useState('none');
  const [selectedRoth401kSeries, setSelectedRoth401kSeries] = useState('none');
  const [selectedRoth401kWithdrawalSeries, setSelectedRoth401kWithdrawalSeries] = useState('A');
  const [selectedTraditionalIRASeries, setSelectedTraditionalIRASeries] = useState('none');
  const [selectedTraditionalIRAWithdrawalSeries, setSelectedTraditionalIRAWithdrawalSeries] = useState('A');
  const [selectedRothIRASeries, setSelectedRothIRASeries] = useState('none');
  const [selectedRothIRAWithdrawalSeries, setSelectedRothIRAWithdrawalSeries] = useState('A');

  // State for other retirement planning inputs
  const [retirementPlanningInputs, setRetirementPlanningInputs] = useState({
    contributionStartAge: 22,
    retirementAge: 65,
    annualReturnRate: 7,
    employerMatch401k: 3,
    employerMatchIRA: 0,
    // Traditional 401k withdrawal rates
    traditional401kWithdrawalRateA: 4,
    traditional401kWithdrawalRateB: 4,
    traditional401kWithdrawalRateC: 4,
    // Roth 401k withdrawal rates
    roth401kWithdrawalRateA: 4,
    roth401kWithdrawalRateB: 4,
    roth401kWithdrawalRateC: 4,
    // Traditional IRA withdrawal rates
    traditionalIRAWithdrawalRateA: 4,
    traditionalIRAWithdrawalRateB: 4,
    traditionalIRAWithdrawalRateC: 4,
    // Roth IRA withdrawal rates
    rothIRAWithdrawalRateA: 4,
    rothIRAWithdrawalRateB: 4,
    rothIRAWithdrawalRateC: 4,
    traditional401kAgeA: 60, // Traditional 401k Scenario A age
    traditional401kAgeB: 60, // Traditional 401k Scenario B age
    traditional401kAgeC: 60, // Traditional 401k Scenario C age
    roth401kAgeA: 60, // Roth 401k Scenario A age
    roth401kAgeB: 60, // Roth 401k Scenario B age
    roth401kAgeC: 60, // Roth 401k Scenario C age
    startingDistributionAgeA: 60, // Traditional IRA Scenario A age
    traditionalIRAAgeB: 60, // Traditional IRA Scenario B age
    traditionalIRAAgeC: 60, // Traditional IRA Scenario C age
    rothIRAAgeA: 60, // Roth IRA Scenario A age
    rothIRAAgeB: 60, // Roth IRA Scenario B age
    rothIRAAgeC: 60, // Roth IRA Scenario C age
    rmdAge: 75
  });

  // State for validation errors in retirement planning inputs
  const [retirementPlanningErrors, setRetirementPlanningErrors] = useState({});

  // Force re-calculation of withdrawal data when retirement planning inputs or monthly payments change
  useEffect(() => {
    // This effect will trigger re-renders when retirementPlanningInputs or monthlyPayments change
    // The withdrawal calculation functions will be called again with new values
  }, [retirementPlanningInputs, monthlyPayments]);

  // Calculate maxContribution using the effective take-home rate from Week 1
  const preTaxIncome = Number(topInputs?.preTaxIncome) || 1;
  console.log('preTaxIncome (Week 6):', preTaxIncome);
  
  // Get both after-tax incomes from summaryCalculations
  const suggestedAfterTaxIncome = summaryCalculations?.suggestedAfterTaxIncome || 0;
  const userAfterTaxIncome = summaryCalculations?.userAfterTaxIncome || 0;
  console.log('suggestedAfterTaxIncome (Week 6):', suggestedAfterTaxIncome);
  console.log('userAfterTaxIncome (Week 6):', userAfterTaxIncome);
  
  const effectiveTakeHomeRate = userAfterTaxIncome / preTaxIncome;
  const maxContribution = 23500 * (effectiveTakeHomeRate);

  // Calculate monthly incomes
  const monthlyPreTaxIncome = preTaxIncome / 12;
  const monthlySuggestedAfterTaxIncome = suggestedAfterTaxIncome / 12; // For recommended calculations
  const monthlyUserAfterTaxIncome = userAfterTaxIncome / 12; // For user input calculations

  // Helper function to calculate percentage of Monthly Pre-Tax Income
  const calculatePercentageOfPreTaxIncome = (monthlyPayment) => {
    if (!monthlyPreTaxIncome || monthlyPreTaxIncome <= 0) return 0;
    return ((monthlyPayment || 0) / monthlyPreTaxIncome) * 100;
  };

  // Helper function to calculate percentage of Monthly After Tax Income
  const calculatePercentageOfAfterTaxIncome = (monthlyPayment) => {
    if (!monthlyUserAfterTaxIncome || monthlyUserAfterTaxIncome <= 0) return 0;
    return ((monthlyPayment || 0) / monthlyUserAfterTaxIncome) * 100;
  };

  // Toggle table visibility
  const toggleTableVisibility = (tableKey) => {
    setTableVisibility(prev => ({
      ...prev,
      [tableKey]: !prev[tableKey]
    }));
  };

  // Handle series selection
  const handleSeriesSelection = (series) => {
    setSelectedSeries(series);
    // Reset all visibility
    setTableVisibility({
      traditional401kSeriesA: false,
      traditional401kSeriesB: false,
      traditional401kSeriesC: false,
      roth401kSeriesA: false,
      roth401kSeriesB: false,
      roth401kSeriesC: false,
      traditionalIRASeriesA: false,
      traditionalIRASeriesB: false,
      traditionalIRASeriesC: false,
      rothIRASeriesA: false,
      rothIRASeriesB: false,
      rothIRASeriesC: false
    });
    // Show selected series
    if (series !== 'none') {
      setTableVisibility(prev => ({
        ...prev,
        [`traditional401kSeries${series}`]: true
      }));
    }
  };

  // Traditional 401k Series A Calculations
  const calculateTraditional401kSeriesA = () => {
    const monthlyPayment = monthlyPayments.traditional_401k_a || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditional401kAgeA) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditional401kWithdrawalRateA || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Present Value calculation using Excel PV formula
  const calculatePresentValue = (futureValue, yearsFromNow, discountRate = 0.035) => {
    // Excel formula: =ABS(PV(0.035, nper, 0, fv))
    // PV = FV / (1 + rate)^nper
    const presentValue = futureValue / Math.pow(1 + discountRate, yearsFromNow);
    return Math.abs(presentValue);
  };

  // Traditional 401k Series B Calculations
  const calculateTraditional401kSeriesB = () => {
    const monthlyPayment = monthlyPayments.traditional_401k_b || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditional401kAgeB) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditional401kWithdrawalRateB || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Traditional 401k Series C Calculations
  const calculateTraditional401kSeriesC = () => {
    const monthlyPayment = monthlyPayments.traditional_401k_c || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditional401kAgeC) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditional401kWithdrawalRateC || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Roth 401k Series A Calculations
  const calculateRoth401kSeriesA = () => {
    const monthlyPayment = monthlyPayments.roth_401k_a || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.roth401kAgeA) || 60;
    const withdrawalRate = (retirementPlanningInputs.roth401kWithdrawalRateA || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Roth 401k Series B Calculations
  const calculateRoth401kSeriesB = () => {
    const monthlyPayment = monthlyPayments.roth_401k_b || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.roth401kAgeB) || 60;
    const withdrawalRate = (retirementPlanningInputs.roth401kWithdrawalRateB || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Roth 401k Series C Calculations
  const calculateRoth401kSeriesC = () => {
    const monthlyPayment = monthlyPayments.roth_401k_c || 0;
    const annualContribution = monthlyPayment * 12;
    const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
    const employerMatch = annualContribution * employerMatchRate;
    const totalAnnualContribution = annualContribution + employerMatch;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const withdrawalStartAge = parseInt(retirementPlanningInputs.roth401kAgeC) || 60;
    const withdrawalRate = (retirementPlanningInputs.roth401kWithdrawalRateC || 4) / 100;

    // Accumulation phase (ages 22-65)
    const accumulationData = [];
    let accountBalance = 0;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      if (year === 0) {
        accountBalance = totalAnnualContribution;
      } else {
        accountBalance = accountBalance * (1 + returnRate) + totalAnnualContribution;
      }
      
      accumulationData.push({
        age,
        year,
        annualContribution,
        employerMatch,
        totalContribution: totalAnnualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    // Withdrawal phase (ages 60+)
    const withdrawalData = [];
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        accountBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }

    return {
      accumulationData,
      withdrawalData,
      finalBalance: accumulationData[accumulationData.length - 1]?.accountBalance || 0
    };
  };

  // Traditional IRA Series A Calculations
  const calculateTraditionalIRASeriesA = () => {
    const monthlyPayment = monthlyPayments.traditional_ira_a || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditionalIRAAgeA) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditionalIRAWithdrawalRateA || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Traditional IRA Series B Calculations
  const calculateTraditionalIRASeriesB = () => {
    const monthlyPayment = monthlyPayments.traditional_ira_b || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditionalIRAAgeB) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditionalIRAWithdrawalRateB || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Traditional IRA Series C Calculations
  const calculateTraditionalIRASeriesC = () => {
    const monthlyPayment = monthlyPayments.traditional_ira_c || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.traditionalIRAAgeC) || 60;
    const withdrawalRate = (retirementPlanningInputs.traditionalIRAWithdrawalRateC || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Roth IRA Series A Calculations
  const calculateRothIRASeriesA = () => {
    const monthlyPayment = monthlyPayments.roth_ira_a || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.rothIRAAgeA) || 60;
    const withdrawalRate = (retirementPlanningInputs.rothIRAWithdrawalRateA || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Roth IRA Series B Calculations
  const calculateRothIRASeriesB = () => {
    const monthlyPayment = monthlyPayments.roth_ira_b || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.rothIRAAgeB) || 60;
    const withdrawalRate = (retirementPlanningInputs.rothIRAWithdrawalRateB || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Roth IRA Series C Calculations
  const calculateRothIRASeriesC = () => {
    const monthlyPayment = monthlyPayments.roth_ira_c || 0;
    const annualContribution = monthlyPayment * 12;
    const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    const yearsToRetirement = endAge - startAge;

      // Accumulation Phase
      const accumulationData = [];
      let accountBalance = 0;
      
      for (let age = startAge; age <= endAge; age++) {
        const year = age - startAge;
        
        if (year === 0) {
          // First year: Account Balance = Annual Contribution (no compound interest)
          accountBalance = annualContribution;
        } else {
          // Subsequent years: Account Balance (Year n) = Account Balance (Year n-1) × (1 + Return Rate) + Annual Contribution
          accountBalance = accountBalance * (1 + returnRate) + annualContribution;
        }
        
        accumulationData.push({
        age,
        year: year + 1,
        annualContribution,
        employerMatch: 0, // IRA has no employer match
        totalContribution: annualContribution,
        accountBalance: Math.round(accountBalance * 100) / 100
      });
    }

    const finalBalance = accumulationData[accumulationData.length - 1]?.accountBalance || 0;

    // Withdrawal Phase
    const withdrawalStartAge = parseInt(retirementPlanningInputs.rothIRAAgeC) || 60;
    const withdrawalRate = (retirementPlanningInputs.rothIRAWithdrawalRateC || 4) / 100;
    const withdrawalData = [];
    
    // Find the balance at withdrawal start age from accumulation phase
    const withdrawalStartAgeIndex = accumulationData.findIndex(item => item.age === withdrawalStartAge);
    let accountBalanceForWithdrawals = withdrawalStartAgeIndex >= 0 ? 
      accumulationData[withdrawalStartAgeIndex].accountBalance : 
      accumulationData[accumulationData.length - 1]?.accountBalance || 0;
    
    for (let age = withdrawalStartAge; age <= 109; age++) {
      const year = age;
      const yearIndex = age - withdrawalStartAge;
      
      // Calculate withdrawal using different formulas for first year vs subsequent years:
      // First year: N4*Q9 (no MAX)
      // Subsequent years: MAX(N5*Q9,0)
      const withdrawal = yearIndex === 0 
        ? accountBalanceForWithdrawals * withdrawalRate  // First year: no MAX
        : Math.max(accountBalanceForWithdrawals * withdrawalRate, 0);  // Subsequent years: with MAX
      
      // Store the current year's data
      withdrawalData.push({
        year: age,
        withdrawals: Math.round(withdrawal * 100) / 100,
        remainingBalance: Math.round(accountBalanceForWithdrawals * 100) / 100
      });
      
      // Calculate next year's Account Balance For Withdrawals using Excel formula:
      // IF((N5-M5)*(1+ReturnRate)=0,NA(),(N5-M5)*(1+ReturnRate))
      // Where N5 = Previous Year's Account Balance For Withdrawals, M5 = Previous Year's Withdrawals
      const nextYearBalance = (accountBalanceForWithdrawals - withdrawal) * (1 + returnRate);
      
      // Only continue if the result is not zero (Excel's IF condition)
      if (nextYearBalance !== 0) {
        accountBalanceForWithdrawals = nextYearBalance;
      } else {
        // If balance becomes zero, stop the loop (Excel returns NA())
        break;
      }
    }
    
    return {
      finalBalance: Math.round(finalBalance * 100) / 100,
      accumulationData,
      withdrawalData
    };
  };

  // Generate chart data for Roth 401k Balance vs Age
  const generateRoth401kChartData = () => {
    const seriesAData = calculateRoth401kSeriesA();
    const seriesBData = calculateRoth401kSeriesB();
    const seriesCData = calculateRoth401kSeriesC();
    
    const chartData = [];
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    
    // Calculate balance for each year using compound interest
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      const monthlyPaymentA = monthlyPayments.roth_401k_a || 0;
      const monthlyPaymentB = monthlyPayments.roth_401k_b || 0;
      const monthlyPaymentC = monthlyPayments.roth_401k_c || 0;
      
      const annualContributionA = monthlyPaymentA * 12;
      const annualContributionB = monthlyPaymentB * 12;
      const annualContributionC = monthlyPaymentC * 12;
      
      const employerMatchRate = (retirementPlanningInputs.employerMatch401k || 0) / 100;
      const totalAnnualContributionA = annualContributionA + (annualContributionA * employerMatchRate);
      const totalAnnualContributionB = annualContributionB + (annualContributionB * employerMatchRate);
      const totalAnnualContributionC = annualContributionC + (annualContributionC * employerMatchRate);
      
      const returnRate = (retirementPlanningInputs.annualReturnRate || 7) / 100;
      
      // Calculate balance using compound interest formula
      const seriesABalance = totalAnnualContributionA * ((Math.pow(1 + returnRate, year + 1) - 1) / returnRate) * (1 + returnRate);
      const seriesBBalance = totalAnnualContributionB * ((Math.pow(1 + returnRate, year + 1) - 1) / returnRate) * (1 + returnRate);
      const seriesCBalance = totalAnnualContributionC * ((Math.pow(1 + returnRate, year + 1) - 1) / returnRate) * (1 + returnRate);
      
      chartData.push({
        age,
        seriesA: Math.round(seriesABalance),
        seriesB: Math.round(seriesBBalance),
        seriesC: Math.round(seriesCBalance)
      });
    }
    
    return chartData;
  };

  // Calculate PV of First Payment for Traditional 401k
  const calculateTraditional401kPV = (series) => {
    const seriesData = series === 'A' ? calculateTraditional401kSeriesA() : 
                      series === 'B' ? calculateTraditional401kSeriesB() : 
                      calculateTraditional401kSeriesC();
    
    const withdrawalStartAge = series === 'A' ? parseInt(retirementPlanningInputs.traditional401kAgeA) || 60 :
                               series === 'B' ? parseInt(retirementPlanningInputs.traditional401kAgeB) || 60 :
                               parseInt(retirementPlanningInputs.traditional401kAgeC) || 60;
    
    // Find the withdrawal data for the specific withdrawal start age
    const firstWithdrawalData = seriesData.withdrawalData.find(item => item.year === withdrawalStartAge);
    const firstWithdrawal = firstWithdrawalData?.withdrawals || 0;
    const yearsFromNow = withdrawalStartAge - (retirementPlanningInputs.contributionStartAge || 22);
    
    
    return calculatePresentValue(firstWithdrawal, yearsFromNow);
  };

  // Calculate PV of First Payment for Roth 401k
  const calculateRoth401kPV = (series) => {
    const seriesData = series === 'A' ? calculateRoth401kSeriesA() : 
                      series === 'B' ? calculateRoth401kSeriesB() : 
                      calculateRoth401kSeriesC();
    
    const withdrawalStartAge = series === 'A' ? parseInt(retirementPlanningInputs.roth401kAgeA) || 60 :
                               series === 'B' ? parseInt(retirementPlanningInputs.roth401kAgeB) || 60 :
                               parseInt(retirementPlanningInputs.roth401kAgeC) || 60;
    
    // Find the withdrawal data for the specific withdrawal start age
    const firstWithdrawalData = seriesData.withdrawalData.find(item => item.year === withdrawalStartAge);
    const firstWithdrawal = firstWithdrawalData?.withdrawals || 0;
    const yearsFromNow = withdrawalStartAge - (retirementPlanningInputs.contributionStartAge || 22);
    
    return calculatePresentValue(firstWithdrawal, yearsFromNow);
  };

  // Calculate PV of First Payment for Traditional IRA
  const calculateTraditionalIRAPV = (series) => {
    const seriesData = series === 'A' ? calculateTraditionalIRASeriesA() : 
                      series === 'B' ? calculateTraditionalIRASeriesB() : 
                      calculateTraditionalIRASeriesC();
    
    const withdrawalStartAge = series === 'A' ? parseInt(retirementPlanningInputs.traditionalIRAAgeA) || 60 :
                               series === 'B' ? parseInt(retirementPlanningInputs.traditionalIRAAgeB) || 60 :
                               parseInt(retirementPlanningInputs.traditionalIRAAgeC) || 60;
    
    // Find the withdrawal data for the specific withdrawal start age
    const firstWithdrawalData = seriesData.withdrawalData.find(item => item.year === withdrawalStartAge);
    const firstWithdrawal = firstWithdrawalData?.withdrawals || 0;
    const yearsFromNow = withdrawalStartAge - (retirementPlanningInputs.contributionStartAge || 22);
    
    return calculatePresentValue(firstWithdrawal, yearsFromNow);
  };

  // Calculate PV of First Payment for Roth IRA
  const calculateRothIRAPV = (series) => {
    const seriesData = series === 'A' ? calculateRothIRASeriesA() : 
                      series === 'B' ? calculateRothIRASeriesB() : 
                      calculateRothIRASeriesC();
    
    const withdrawalStartAge = series === 'A' ? parseInt(retirementPlanningInputs.rothIRAAgeA) || 60 :
                               series === 'B' ? parseInt(retirementPlanningInputs.rothIRAAgeB) || 60 :
                               parseInt(retirementPlanningInputs.rothIRAAgeC) || 60;
    
    // Find the withdrawal data for the specific withdrawal start age
    const firstWithdrawalData = seriesData.withdrawalData.find(item => item.year === withdrawalStartAge);
    const firstWithdrawal = firstWithdrawalData?.withdrawals || 0;
    const yearsFromNow = withdrawalStartAge - (retirementPlanningInputs.contributionStartAge || 22);
    
    return calculatePresentValue(firstWithdrawal, yearsFromNow);
  };

  // Generate chart data for Traditional 401k Balance vs Age
  const generateTraditional401kChartData = () => {
    const seriesAData = calculateTraditional401kSeriesA();
    const seriesBData = calculateTraditional401kSeriesB();
    const seriesCData = calculateTraditional401kSeriesC();
    
    const chartData = [];
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      const seriesABalance = seriesAData.accumulationData[year]?.accountBalance || 0;
      const seriesBBalance = seriesBData.accumulationData[year]?.accountBalance || 0;
      const seriesCBalance = seriesCData.accumulationData[year]?.accountBalance || 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesABalance),
        seriesB: Math.round(seriesBBalance),
        seriesC: Math.round(seriesCBalance)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Traditional 401k Withdrawals vs Age
  const generateTraditional401kWithdrawalsChartData = () => {
    const seriesAData = calculateTraditional401kSeriesA();
    const seriesBData = calculateTraditional401kSeriesB();
    const seriesCData = calculateTraditional401kSeriesC();
    
    const chartData = [];
    const withdrawalStartAgeA = retirementPlanningInputs.traditional401kAgeA || 60;
    const withdrawalStartAgeB = retirementPlanningInputs.traditional401kAgeB || 60;
    const withdrawalStartAgeC = retirementPlanningInputs.traditional401kAgeC || 60;
    
    // Find the earliest withdrawal start age
    const earliestStartAge = Math.min(withdrawalStartAgeA, withdrawalStartAgeB, withdrawalStartAgeC);
    
    // Generate data from earliest start age to 100
    for (let age = earliestStartAge; age <= 100; age++) {
      const yearA = age - withdrawalStartAgeA;
      const yearB = age - withdrawalStartAgeB;
      const yearC = age - withdrawalStartAgeC;
      
      const seriesAWithdrawal = yearA >= 0 && seriesAData.withdrawalData[yearA] ? seriesAData.withdrawalData[yearA].withdrawals : 0;
      const seriesBWithdrawal = yearB >= 0 && seriesBData.withdrawalData[yearB] ? seriesBData.withdrawalData[yearB].withdrawals : 0;
      const seriesCWithdrawal = yearC >= 0 && seriesCData.withdrawalData[yearC] ? seriesCData.withdrawalData[yearC].withdrawals : 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesAWithdrawal),
        seriesB: Math.round(seriesBWithdrawal),
        seriesC: Math.round(seriesCWithdrawal)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Roth 401k Withdrawals vs Age
  const generateRoth401kWithdrawalsChartData = () => {
    const seriesAData = calculateRoth401kSeriesA();
    const seriesBData = calculateRoth401kSeriesB();
    const seriesCData = calculateRoth401kSeriesC();
    
    const chartData = [];
    const withdrawalStartAgeA = retirementPlanningInputs.roth401kAgeA || 60;
    const withdrawalStartAgeB = retirementPlanningInputs.roth401kAgeB || 60;
    const withdrawalStartAgeC = retirementPlanningInputs.roth401kAgeC || 60;
    
    // Find the earliest withdrawal start age
    const earliestStartAge = Math.min(withdrawalStartAgeA, withdrawalStartAgeB, withdrawalStartAgeC);
    
    // Generate data from earliest start age to 100
    for (let age = earliestStartAge; age <= 100; age++) {
      const yearA = age - withdrawalStartAgeA;
      const yearB = age - withdrawalStartAgeB;
      const yearC = age - withdrawalStartAgeC;
      
      const seriesAWithdrawal = yearA >= 0 && seriesAData.withdrawalData[yearA] ? seriesAData.withdrawalData[yearA].withdrawals : 0;
      const seriesBWithdrawal = yearB >= 0 && seriesBData.withdrawalData[yearB] ? seriesBData.withdrawalData[yearB].withdrawals : 0;
      const seriesCWithdrawal = yearC >= 0 && seriesCData.withdrawalData[yearC] ? seriesCData.withdrawalData[yearC].withdrawals : 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesAWithdrawal),
        seriesB: Math.round(seriesBWithdrawal),
        seriesC: Math.round(seriesCWithdrawal)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Traditional IRA Balance vs Age
  const generateTraditionalIRAChartData = () => {
    const seriesAData = calculateTraditionalIRASeriesA();
    const seriesBData = calculateTraditionalIRASeriesB();
    const seriesCData = calculateTraditionalIRASeriesC();
    
    const chartData = [];
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      const seriesABalance = seriesAData.accumulationData[year]?.accountBalance || 0;
      const seriesBBalance = seriesBData.accumulationData[year]?.accountBalance || 0;
      const seriesCBalance = seriesCData.accumulationData[year]?.accountBalance || 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesABalance),
        seriesB: Math.round(seriesBBalance),
        seriesC: Math.round(seriesCBalance)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Traditional IRA Withdrawals vs Age
  const generateTraditionalIRAWithdrawalsChartData = () => {
    const seriesAData = calculateTraditionalIRASeriesA();
    const seriesBData = calculateTraditionalIRASeriesB();
    const seriesCData = calculateTraditionalIRASeriesC();
    
    const chartData = [];
    const withdrawalStartAgeA = parseInt(retirementPlanningInputs.traditionalIRAAgeA) || 60;
    const withdrawalStartAgeB = parseInt(retirementPlanningInputs.traditionalIRAAgeB) || 60;
    const withdrawalStartAgeC = parseInt(retirementPlanningInputs.traditionalIRAAgeC) || 60;
    
    // Find the earliest withdrawal start age
    const earliestStartAge = Math.min(withdrawalStartAgeA, withdrawalStartAgeB, withdrawalStartAgeC);
    
    // Generate data from earliest start age to 100
    for (let age = earliestStartAge; age <= 100; age++) {
      const yearA = age - withdrawalStartAgeA;
      const yearB = age - withdrawalStartAgeB;
      const yearC = age - withdrawalStartAgeC;
      
      const seriesAWithdrawal = yearA >= 0 && seriesAData.withdrawalData[yearA] ? seriesAData.withdrawalData[yearA].withdrawals : 0;
      const seriesBWithdrawal = yearB >= 0 && seriesBData.withdrawalData[yearB] ? seriesBData.withdrawalData[yearB].withdrawals : 0;
      const seriesCWithdrawal = yearC >= 0 && seriesCData.withdrawalData[yearC] ? seriesCData.withdrawalData[yearC].withdrawals : 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesAWithdrawal),
        seriesB: Math.round(seriesBWithdrawal),
        seriesC: Math.round(seriesCWithdrawal)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Roth IRA Balance vs Age
  const generateRothIRAChartData = () => {
    const seriesAData = calculateRothIRASeriesA();
    const seriesBData = calculateRothIRASeriesB();
    const seriesCData = calculateRothIRASeriesC();
    
    const chartData = [];
    const startAge = retirementPlanningInputs.contributionStartAge || 22;
    const endAge = retirementPlanningInputs.retirementAge || 65;
    
    for (let age = startAge; age <= endAge; age++) {
      const year = age - startAge;
      const seriesABalance = seriesAData.accumulationData[year]?.accountBalance || 0;
      const seriesBBalance = seriesBData.accumulationData[year]?.accountBalance || 0;
      const seriesCBalance = seriesCData.accumulationData[year]?.accountBalance || 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesABalance),
        seriesB: Math.round(seriesBBalance),
        seriesC: Math.round(seriesCBalance)
      });
    }
    
    return chartData;
  };

  // Generate chart data for Roth IRA Withdrawals vs Age
  const generateRothIRAWithdrawalsChartData = () => {
    const seriesAData = calculateRothIRASeriesA();
    const seriesBData = calculateRothIRASeriesB();
    const seriesCData = calculateRothIRASeriesC();
    
    const chartData = [];
    const withdrawalStartAgeA = parseInt(retirementPlanningInputs.rothIRAAgeA) || 60;
    const withdrawalStartAgeB = parseInt(retirementPlanningInputs.rothIRAAgeB) || 60;
    const withdrawalStartAgeC = parseInt(retirementPlanningInputs.rothIRAAgeC) || 60;
    
    // Find the earliest withdrawal start age
    const earliestStartAge = Math.min(withdrawalStartAgeA, withdrawalStartAgeB, withdrawalStartAgeC);
    
    // Generate data from earliest start age to 100
    for (let age = earliestStartAge; age <= 100; age++) {
      const yearA = age - withdrawalStartAgeA;
      const yearB = age - withdrawalStartAgeB;
      const yearC = age - withdrawalStartAgeC;
      
      const seriesAWithdrawal = yearA >= 0 && seriesAData.withdrawalData[yearA] ? seriesAData.withdrawalData[yearA].withdrawals : 0;
      const seriesBWithdrawal = yearB >= 0 && seriesBData.withdrawalData[yearB] ? seriesBData.withdrawalData[yearB].withdrawals : 0;
      const seriesCWithdrawal = yearC >= 0 && seriesCData.withdrawalData[yearC] ? seriesCData.withdrawalData[yearC].withdrawals : 0;
      
      chartData.push({
        age,
        seriesA: Math.round(seriesAWithdrawal),
        seriesB: Math.round(seriesBWithdrawal),
        seriesC: Math.round(seriesCWithdrawal)
      });
    }
    
    return chartData;
  };

  // Helper function to get retirement input from Week 1
  const getRetirementInput = (key) => {
    const val = retirementInputs?.[key];
    return val === undefined || val === "" ? 0 : Number(val);
  };

  // Helper function to handle retirement budget changes
  const handleRetirementBudgetChange = (key, value) => {
    // Allow empty string, numbers, and one decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Clear any existing error for this field
    setValidationErrors(prev => ({
      ...prev,
      [key]: ''
    }));
    
    // Allow empty string (user can clear the field)
    if (cleanValue === '') {
      setRetirementBudgetedAmounts(prev => ({
        ...prev,
        [key]: ''
      }));
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(cleanValue);
    
    // Set different limits based on account type
    let maxValue = 1958.33; // Default for 401(k) plans
    let accountType = '401(k)';
    if (key.includes('ira')) {
      maxValue = 583.33; // IRA plans have lower limit
      accountType = 'IRA';
    }
    
    // Validate range: 0 <= value <= maxValue
    if (numValue >= 0 && numValue <= maxValue) {
      setRetirementBudgetedAmounts(prev => ({
        ...prev,
        [key]: cleanValue
      }));
    } else if (numValue > maxValue) {
      // Show error message for values exceeding maximum
      setValidationErrors(prev => ({
        ...prev,
        [key]: `${accountType} plan maximum value is ${maxValue.toFixed(2)}. Please enter a smaller value.`
      }));
    } else if (numValue < 0) {
      // Show error message for negative values
      setValidationErrors(prev => ({
        ...prev,
        [key]: 'Value cannot be less than 0. Please enter a positive value.'
      }));
    }
    // If invalid, don't update (keep previous valid value)
  };

  // Helper function to handle monthly payment changes in retirement planning sections
  const handleMonthlyPaymentChange = (key, value) => {
    // Allow empty string, numbers, and one decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Clear any existing error for this field
    setMonthlyPaymentErrors(prev => ({
      ...prev,
      [key]: ''
    }));
    
    // Allow empty string (user can clear the field)
    if (cleanValue === '') {
      setMonthlyPayments(prev => ({
        ...prev,
        [key]: ''
      }));
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(cleanValue);
    
    // Set different limits based on account type
    let maxValue = 1958.33; // Default for 401(k) plans
    let accountType = '401(k)';
    if (key.includes('ira')) {
      maxValue = 583.33; // IRA plans have lower limit
      accountType = 'IRA';
    }
    
    // Validate range: 0 <= value <= maxValue
    if (numValue >= 0 && numValue <= maxValue) {
      setMonthlyPayments(prev => ({
        ...prev,
        [key]: cleanValue
      }));
    } else if (numValue > maxValue) {
      // Show error message for values exceeding maximum
      setMonthlyPaymentErrors(prev => ({
        ...prev,
        [key]: `${accountType} plan maximum value is ${maxValue.toFixed(2)}. Please enter a smaller value.`
      }));
    } else if (numValue < 0) {
      // Show error message for negative values
      setMonthlyPaymentErrors(prev => ({
        ...prev,
        [key]: 'Value cannot be less than 0. Please enter a positive value.'
      }));
    }
    // If invalid, don't update (keep previous valid value)
  };

  // Helper function to handle other retirement planning input changes
  const handleRetirementPlanningInputChange = (key, value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Clear any existing error for this field
    setRetirementPlanningErrors(prev => ({
      ...prev,
      [key]: ''
    }));
    
    // Always allow empty string (user can clear the field)
    if (cleanValue === '') {
      setRetirementPlanningInputs(prev => ({
        ...prev,
        [key]: ''
      }));
      return;
    }
    
    const numValue = parseFloat(cleanValue);
    
    // Always update the input value, but show error if invalid
    setRetirementPlanningInputs(prev => ({
      ...prev,
      [key]: cleanValue
    }));
    
    // Define validation rules for each input type
    let errorMessage = '';
    
    if (key === 'contributionStartAge') {
      const retirementAge = parseFloat(retirementPlanningInputs.retirementAge) || 65;
      // Contribution age should be less than retirement age (not equal)
      const maxContributionAge = Math.min(retirementAge, 100);
      if (numValue >= maxContributionAge) {
        errorMessage = `Contribution Start Age must be less than ${maxContributionAge} years.`;
      }
    } else if (key === 'retirementAge') {
      const contributionAge = parseFloat(retirementPlanningInputs.contributionStartAge) || 22;
      // Retirement age should always be max 100, and min should be 30 (exclusive)
      const minRetirementAge = Math.max(contributionAge, 30);
      if (numValue <= minRetirementAge || numValue > 100) {
        errorMessage = `Retirement Age must be between ${minRetirementAge + 1} and 100 years.`;
      }
    } else if (key === 'annualReturnRate') {
      if (numValue < 0 || numValue > 20) {
        errorMessage = 'Annual Rate of Return must be between 0% and 20%.';
      }
    } else if (key === 'employerMatch401k' || key === 'employerMatchIRA') {
      if (numValue < 0 || numValue > 100) {
        errorMessage = 'Employer Match must be between 0% and 100%.';
      }
    } else if (key === 'traditional401kWithdrawalRateA' || key === 'traditional401kWithdrawalRateB' || key === 'traditional401kWithdrawalRateC' ||
               key === 'roth401kWithdrawalRateA' || key === 'roth401kWithdrawalRateB' || key === 'roth401kWithdrawalRateC' ||
               key === 'traditionalIRAWithdrawalRateA' || key === 'traditionalIRAWithdrawalRateB' || key === 'traditionalIRAWithdrawalRateC' ||
               key === 'rothIRAWithdrawalRateA' || key === 'rothIRAWithdrawalRateB' || key === 'rothIRAWithdrawalRateC') {
      if (numValue < 0 || numValue > 100) {
        errorMessage = 'Withdrawal Rate must be between 0% and 100%.';
      }
    } else if (key === 'traditional401kAgeA' || key === 'traditional401kAgeB' || key === 'traditional401kAgeC' ||
               key === 'roth401kAgeA' || key === 'roth401kAgeB' || key === 'roth401kAgeC' ||
               key === 'traditionalIRAAgeA' || key === 'traditionalIRAAgeB' || key === 'traditionalIRAAgeC' ||
               key === 'rothIRAAgeA' || key === 'rothIRAAgeB' || key === 'rothIRAAgeC') {
      // Traditional IRA ages are limited by RMD age
      if (key.startsWith('traditionalIRA')) {
        const rmdAge = parseFloat(retirementPlanningInputs.rmdAge) || 73;
        if (numValue <= 30 || numValue > rmdAge) {
          errorMessage = `Starting Distribution Age must be between 31 and ${rmdAge} years.`;
        }
      } 
      // Roth IRA ages are limited to 100
      else if (key.startsWith('rothIRA')) {
        if (numValue <= 30 || numValue > 100) {
          errorMessage = `Starting Distribution Age must be between 31 and 100 years.`;
        }
      }
      // Traditional and Roth 401k ages are limited by RMD age
      else {
        const rmdAge = parseFloat(retirementPlanningInputs.rmdAge) || 73;
        if (numValue <= 30 || numValue > rmdAge) {
          errorMessage = `Starting Distribution Age must be between 31 and ${rmdAge} years.`;
        }
      }
    } else if (key === 'rmdAge') {
      // No validation limits for RMD age
    }
    
    // Show error message if validation fails
    if (errorMessage) {
      setRetirementPlanningErrors(prev => ({
        ...prev,
        [key]: errorMessage
      }));
    }
  };

  // Calculate recommended Roth 401(k) amount using Week 1 logic (suggested after-tax income)
  const calculateRecommendedRoth401k = () => {
    if (monthlySuggestedAfterTaxIncome <= 0) return 0;
    // Excel: =MIN('Week 1 - Budgeting'!$G$40*(1/20),1958.33)
    // This is 5% of monthly after-tax income, capped at $1,958.33 (monthly max for $23,500 annual)
    return Math.min(monthlySuggestedAfterTaxIncome * 0.05, 1958.33);
  };

  // Calculate recommended Roth IRA amount using Week 1 logic (suggested after-tax income)
  const calculateRecommendedRothIRA = () => {
    if (monthlySuggestedAfterTaxIncome <= 0) return 0;
    // Excel: =IF(G46=1958.33,MIN('Week 1 - Budgeting'!$G$40*(0.05-I46),583.33),0)
    // Only contribute to Roth IRA if Roth 401k is at its maximum
    const roth401kAmount = Math.min(monthlySuggestedAfterTaxIncome * 0.05, 1958.33);
    if (roth401kAmount === 1958.33) {
      // Calculate Roth 401k percentage first
      const roth401kPercent = roth401kAmount / monthlySuggestedAfterTaxIncome;
      // Then calculate Roth IRA: 5% total - Roth 401k percentage, capped at $583.33
      return Math.min(monthlySuggestedAfterTaxIncome * (0.05 - roth401kPercent), 583.33);
    }
    return 0;
  };

  // Calculate deferral amount based on percentage
  const calculateDeferralAmount = () => {
    const percentage = parseFloat(deferralPercentage) || 0;
    return monthlyPreTaxIncome * (percentage / 100);
  };

  // Calculate totals for the table
  const totalUserInput = Object.values({
    traditional_401k: getRetirementInput('retirement_traditional_401k'),
    roth_401k: getRetirementInput('retirement_roth_401k'),
    traditional_ira: getRetirementInput('retirement_traditional_ira'),
    roth_ira: getRetirementInput('retirement_roth_ira')
  }).reduce((sum, val) => sum + val, 0);

  const totalBudgetedAmount = Object.entries(retirementBudgetedAmounts).reduce((sum, [key, val]) => {
    // Only include valid values (no errors) in total calculation
    if (validationErrors[key]) {
      return sum; // Skip invalid values
    }
    const value = parseFloat(val) || getDefaultBudgetedAmount(key);
    return sum + value;
  }, 0);

  const totalRecommendedAmount = calculateRecommendedRoth401k() + calculateRecommendedRothIRA();

  const totalRecommendedPercent = monthlyPreTaxIncome > 0 ? (totalRecommendedAmount / monthlyPreTaxIncome) * 100 : 0;

  // Simulations
  const simA = useMemo(() => {
    // For Series A, annual contribution is annualPaymentA / effectiveTakeHomeRate (Excel logic)
    const customSimulate401kA = ({
      startAge,
      endAge,
      annualPayment,
      returnRate,
      employerMatch,
      maxContribution,
      effectiveTakeHomeRate
    }) => {
      const ages = [];
      const years = [];
      const annualContributions = [];
      const employerMatches = [];
      const totalContributions = [];
      const balances = [];
      let balance = 0;
      let year = 0;
      // Calculate the fixed annual contribution for all years
      const fixedContribution = annualPayment / effectiveTakeHomeRate;
      for (let age = startAge; age <= endAge; age++, year++) {
        ages.push(age);
        years.push(year);
        // Round annual contribution
        const roundedContribution = Number(fixedContribution.toFixed(2));
        annualContributions.push(roundedContribution);
        // Round employer match
        let match = Number((roundedContribution * (employerMatch / 100)).toFixed(2));
        employerMatches.push(match);
        // Total contribution, rounded
        let total;
        if (roundedContribution === "" || match === "") {
          total = "";
          totalContributions.push("");
        } else {
          total = Number((roundedContribution + match).toFixed(2));
          totalContributions.push(total);
        }
        // Account balance (future value), rounded
        if (total === "") {
          balances.push("");
        } else {
          balance = Number((balance * (1 + returnRate / 100) + total).toFixed(2));
          balances.push(balance);
        }
      }
      return { ages, years, annualContributions, employerMatches, totalContributions, balances };
    };
    return customSimulate401kA({
      startAge,
      endAge,
      annualPayment: annualPaymentA,
      returnRate: returnRateA,
      employerMatch: employerMatchA,
      maxContribution,
      effectiveTakeHomeRate
    });
  }, [startAge, endAge, annualPaymentA, returnRateA, employerMatchA, maxContribution, effectiveTakeHomeRate]);

  // Series B and C remain unchanged for now
  const simB = useMemo(() => {
    const ages = [];
    const years = [];
    const annualContributions = [];
    const employerMatches = [];
    const totalContributions = [];
    const balances = [];
    let balance = 0;
    let year = 0;
    // Calculate the fixed annual contribution for all years (Excel logic)
    const fixedContribution = annualPaymentB / effectiveTakeHomeRate;
    for (let age = startAge; age <= endAge; age++, year++) {
      ages.push(age);
      years.push(year);
      // Round annual contribution
      const roundedContribution = Number(fixedContribution.toFixed(2));
      annualContributions.push(roundedContribution);
      // Round employer match
      let match = Number((roundedContribution * (employerMatchB / 100)).toFixed(2));
      employerMatches.push(match);
      // Total contribution, rounded
      let total;
      if (roundedContribution === "" || match === "") {
        total = "";
        totalContributions.push("");
      } else {
        total = Number((roundedContribution + match).toFixed(2));
        totalContributions.push(total);
      }
      // Account balance (future value), rounded
      if (total === "") {
        balances.push("");
      } else {
        balance = Number((balance * (1 + returnRateB / 100) + total).toFixed(2));
        balances.push(balance);
      }
    }
    return { ages, years, annualContributions, employerMatches, totalContributions, balances };
  }, [startAge, endAge, annualPaymentB, returnRateB, employerMatchB, maxContribution, effectiveTakeHomeRate]);

  const simC = useMemo(() => {
    const ages = [];
    const years = [];
    const annualContributions = [];
    const employerMatches = [];
    const totalContributions = [];
    const balances = [];
    let balance = 0;
    let year = 0;
    // Calculate the fixed annual contribution for all years (Excel logic)
    const fixedContribution = annualPaymentC / effectiveTakeHomeRate;
    for (let age = startAge; age <= endAge; age++, year++) {
      ages.push(age);
      years.push(year);
      // Round annual contribution
      const roundedContribution = Number(fixedContribution.toFixed(2));
      annualContributions.push(roundedContribution);
      // Round employer match
      let match = Number((roundedContribution * (employerMatchC / 100)).toFixed(2));
      employerMatches.push(match);
      // Total contribution, rounded
      let total;
      if (roundedContribution === "" || match === "") {
        total = "";
        totalContributions.push("");
      } else {
        total = Number((roundedContribution + match).toFixed(2));
        totalContributions.push(total);
      }
      // Account balance (future value), rounded
      if (total === "") {
        balances.push("");
      } else {
        balance = Number((balance * (1 + returnRateC / 100) + total).toFixed(2));
        balances.push(balance);
      }
    }
    return { ages, years, annualContributions, employerMatches, totalContributions, balances };
  }, [startAge, endAge, annualPaymentC, returnRateC, employerMatchC, maxContribution, effectiveTakeHomeRate]);

  // Final balances (last valid value)
  const finalBalanceA = getLastValid(simA.balances);
  const finalBalanceB = getLastValid(simB.balances);
  const finalBalanceC = getLastValid(simC.balances);

  // Chart data
  const chartData = {
    labels: simA.ages,
    datasets: [
      {
        label: 'Series A',
        data: simA.balances,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.2,
      },
      {
        label: 'Series B',
        data: simB.balances,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.1)',
        tension: 0.2,
      },
      {
        label: 'Series C',
        data: simC.balances,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Traditional 401(k) Balance vs. Age' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Helper to format currency
  const formatCurrency = (num) => Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


  // Section header style for all section titles
  const sectionHeaderStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#002060',
    margin: '0 0 18px 0',
    padding: 0,
    fontFamily: 'inherit',
    letterSpacing: 0,
    lineHeight: 1.3,
  };

  // Simple section header style to match Week 1
  const simpleHeaderStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#002060',
    margin: '0 0 18px 0',
    padding: 0,
    fontFamily: 'inherit',
    letterSpacing: 0,
    lineHeight: 1.3,
  };

  return (
    <>
      {/* Modern info alert for editable fields - guaranteed right top corner */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '32px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(2px)',
        border: '1px solid #bfdbfe',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        borderRadius: '14px',
        padding: '12px 20px',
        color: '#0d1a4b',
        fontWeight: 500,
        fontSize: 12
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
        You can only enter data in the open (yellow) fields.
      </div>

      <div style={styles.container}>
            {/* Enhanced Header */}
        <div style={{
          ...styles.enhancedHeader,
          backgroundColor: '#002060',
          color: 'white'
        }}>
              🏦 Week 6 - Retirement Planning
            </div>

        {/* 1. Income Summary */}
        <div style={styles.sectionContainer}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#002060',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Income Summary
          </div>
          <div style={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #dcedc8',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2e7d32',
                marginBottom: '4px'
              }}>
                Monthly Pre-Tax Income
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#002060'
              }}>
                ${formatCurrency(monthlyPreTaxIncome)}
              </div>
            </div>
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #dcedc8',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2e7d32',
                marginBottom: '4px'
              }}>
                Monthly After-Tax Income
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#002060'
              }}>
                ${formatCurrency(monthlyUserAfterTaxIncome)}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Retirement Account Budgeting Table */}
        <div style={styles.sectionContainer}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#002060',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Retirement Account Budgeting
          </div>
          <table style={{
            ...styles.table,
            width: '100%',
            minWidth: '1000px'
          }}>
          <thead>
            <tr>
                <th style={{
                  ...styles.th,
                  textAlign: 'left',
                  width: '25%'
                }}>
                  Account Type
                </th>
                <th style={{
                  ...styles.th,
                  width: '20%'
                }}>
                  User Input in Week 1 Budget
                </th>
                <th style={{
                  ...styles.th,
                  width: '20%'
                }}>
                  Budgeted Amount Spent
                </th>
                <th style={{
                  ...styles.th,
                  width: '20%'
                }}>
                  Recommended Amount Spent
                </th>
                <th style={{
                  ...styles.th,
                  width: '15%'
                }}>
                  Recommended %
                </th>
            </tr>
          </thead>
          <tbody>
              {/* Traditional 401(k) */}
                <tr>
                  <td style={{
                    ...styles.td,
                  textAlign: 'left',
                  verticalAlign: 'top',
                  padding: '16px 12px'
                }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Traditional 401(k), 403(b), 457(b), or Thrift Savings Plan
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    Pre-tax. Employer-sponsored. $23,500 limit. No taxes now, taxed at withdrawal. Employer match available.
                    </div>
                  </td>
                <td style={styles.td}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    ${formatCurrency(getRetirementInput('retirement_traditional_401k'))}
                  </div>
                </td>
                <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                    max="1958.33"
                    step="0.01"
                    value={retirementBudgetedAmounts.traditional_401k || getDefaultBudgetedAmount('traditional_401k')}
                    onChange={e => handleRetirementBudgetChange('traditional_401k', e.target.value)}
                      style={{
                      ...styles.input,
                      backgroundColor: '#fffde7',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}
                    placeholder="Enter amount"
                  />
                  <div style={{
                    fontSize: '11px',
                    color: '#888',
                    marginTop: '4px',
                    textAlign: 'center'
                  }}>
                    {retirementBudgetedAmounts.traditional_401k ? 
                      `${((retirementBudgetedAmounts.traditional_401k / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income` : 
                      `${((getDefaultBudgetedAmount('traditional_401k') / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income`
                    }
                  </div>
                  {validationErrors.traditional_401k && (
                    <div style={{
                      fontSize: '10px',
                      color: '#dc3545',
                      marginTop: '2px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {validationErrors.traditional_401k}
                    </div>
                  )}
                  </td>
                <td style={styles.td}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    -
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    0.00%
                  </div>
                </td>
                </tr>

            {/* Roth 401(k) */}
            <tr>
              <td style={{...styles.td, textAlign: 'left', verticalAlign: 'top', padding: '16px 12px'}}>
                <div style={{fontWeight: '600', fontSize: '14px', marginBottom: '8px'}}>
                  Roth 401(k) Plan
      </div>
                <div style={{fontSize: '12px', color: '#666', lineHeight: '1.4'}}>
                  Post-tax. Employer-sponsored. $23,500 limit. Pay taxes now, withdraw tax-free. Employer match common; goes into pre-tax 401(k).
                </div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600'}}>
                  ${formatCurrency(getRetirementInput('retirement_roth_401k'))}
                </div>
              </td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="0"
                  max="1958.33"
                  step="0.01"
                  value={retirementBudgetedAmounts.roth_401k || getDefaultBudgetedAmount('roth_401k')}
                  onChange={e => handleRetirementBudgetChange('roth_401k', e.target.value)}
                  style={{
                    ...styles.input,
                    backgroundColor: '#fffde7',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}
                  placeholder="Enter amount"
                />
                <div style={{fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'center'}}>
                  {retirementBudgetedAmounts.roth_401k ? 
                    `${((retirementBudgetedAmounts.roth_401k / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income` : 
                    `${((getDefaultBudgetedAmount('roth_401k') / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income`
                  }
                </div>
                {validationErrors.roth_401k && (
                  <div style={{fontSize: '10px', color: '#dc3545', marginTop: '2px', textAlign: 'center', fontWeight: '500'}}>
                    {validationErrors.roth_401k}
                  </div>
                )}
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#28a745'}}>
                  ${formatCurrency(calculateRecommendedRoth401k())}
                </div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#28a745'}}>
                  {monthlyPreTaxIncome > 0 ? ((calculateRecommendedRoth401k() / monthlyPreTaxIncome) * 100).toFixed(2) : '0.00'}%
                </div>
              </td>
            </tr>

            {/* Traditional IRA */}
            <tr>
              <td style={{...styles.td, textAlign: 'left', verticalAlign: 'top', padding: '16px 12px'}}>
                <div style={{fontWeight: '600', fontSize: '14px', marginBottom: '8px'}}>
                  Traditional IRA
      </div>
                <div style={{fontSize: '12px', color: '#666', lineHeight: '1.4'}}>
                  Pre-tax. Individual account. $7,000 limit &lt;50 y/o &amp; &lt;$150,000 income. Lowers taxes now, taxed at withdrawal. No employer match.
              </div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600'}}>
                  ${formatCurrency(getRetirementInput('retirement_traditional_ira'))}
              </div>
              </td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="0"
                  max="583.33"
                  step="0.01"
                  value={retirementBudgetedAmounts.traditional_ira || getDefaultBudgetedAmount('traditional_ira')}
                  onChange={e => handleRetirementBudgetChange('traditional_ira', e.target.value)}
                  style={{
                    ...styles.input,
                    backgroundColor: '#fffde7',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}
                  placeholder="Enter amount"
                />
                <div style={{fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'center'}}>
                  {retirementBudgetedAmounts.traditional_ira ? 
                    `${((retirementBudgetedAmounts.traditional_ira / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income` : 
                    `${((getDefaultBudgetedAmount('traditional_ira') / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income`
                  }
            </div>
                {validationErrors.traditional_ira && (
                  <div style={{fontSize: '10px', color: '#dc3545', marginTop: '2px', textAlign: 'center', fontWeight: '500'}}>
                    {validationErrors.traditional_ira}
              </div>
                )}
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#666'}}>-</div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#666'}}>0.00%</div>
              </td>
            </tr>

            {/* Roth IRA */}
            <tr>
              <td style={{...styles.td, textAlign: 'left', verticalAlign: 'top', padding: '16px 12px'}}>
                <div style={{fontWeight: '600', fontSize: '14px', marginBottom: '8px'}}>
                  Roth IRA
              </div>
                <div style={{fontSize: '12px', color: '#666', lineHeight: '1.4'}}>
                  Post-tax. Individual account. $7,000 limit &lt;50 yo &amp; &lt;$150,000 income. Tax-free growth and withdrawals. No employer match.
              </div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600'}}>
                  ${formatCurrency(getRetirementInput('retirement_roth_ira'))}
              </div>
              </td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="0"
                  max="583.33"
                  step="0.01"
                  value={retirementBudgetedAmounts.roth_ira || getDefaultBudgetedAmount('roth_ira')}
                  onChange={e => handleRetirementBudgetChange('roth_ira', e.target.value)}
                  style={{
                    ...styles.input,
                    backgroundColor: '#fffde7',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}
                  placeholder="Enter amount"
                />
                <div style={{fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'center'}}>
                  {retirementBudgetedAmounts.roth_ira ? 
                    `${((retirementBudgetedAmounts.roth_ira / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income` : 
                    `${((getDefaultBudgetedAmount('roth_ira') / monthlyPreTaxIncome) * 100).toFixed(1)}% of Gross Monthly Income`
                  }
            </div>
                {validationErrors.roth_ira && (
                  <div style={{fontSize: '10px', color: '#dc3545', marginTop: '2px', textAlign: 'center', fontWeight: '500'}}>
                    {validationErrors.roth_ira}
              </div>
                )}
                  </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#28a745'}}>
                  ${formatCurrency(calculateRecommendedRothIRA())}
              </div>
              </td>
              <td style={styles.td}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#28a745'}}>
                  {monthlyPreTaxIncome > 0 ? ((calculateRecommendedRothIRA() / monthlyPreTaxIncome) * 100).toFixed(2) : '0.00'}%
              </div>
              </td>
                </tr>

            {/* Total Row */}
            <tr style={{backgroundColor: '#002060'}}>
              <td style={{...styles.td, backgroundColor: '#002060', color: '#fff', fontWeight: '700', fontSize: '14px'}}>
                <b>Total</b>
              </td>
              <td style={{...styles.td, backgroundColor: '#002060', color: '#fff', fontWeight: '700', fontSize: '14px'}}>
                ${formatCurrency(totalUserInput)}
              </td>
              <td style={{...styles.td, backgroundColor: '#002060', color: '#fff', fontWeight: '700', fontSize: '14px'}}>
                ${formatCurrency(totalBudgetedAmount)}
              </td>
              <td style={{...styles.td, backgroundColor: '#002060', color: '#fff', fontWeight: '700', fontSize: '14px'}}>
                ${formatCurrency(totalRecommendedAmount)}
              </td>
              <td style={{...styles.td, backgroundColor: '#002060', color: '#fff', fontWeight: '700', fontSize: '14px'}}>
                {totalRecommendedPercent.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        {/* 3. Monthly Deferral Calculator */}
        <div style={styles.sectionContainer}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#002060',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Monthly Deferral Calculator
              </div>
          <div style={{
            marginBottom: '12px',
            fontSize: '14px',
            color: '#666',
            textAlign: 'center'
          }}>
            Retirement contribution based on % of monthly gross income
              </div>
          <table style={{
            ...styles.table,
            width: '300px',
            margin: '0 auto'
          }}>
            <thead>
              <tr>
                <th style={styles.th}>Deferral %</th>
                <th style={styles.th}>Deferral $</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={deferralPercentage || ''}
                    onChange={e => setDeferralPercentage(e.target.value)}
                    style={{
                      ...styles.input,
                      backgroundColor: '#fffde7',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}
                    placeholder="5%"
                  />
                </td>
                <td style={styles.td}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#002060'
                  }}>
                    ${formatCurrency(calculateDeferralAmount())}
              </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{
            fontSize: '13px',
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: '16px',
            padding: '6px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            Note: Adjust Week 1 Budget based on this week's insights
            </div>
              </div>

        {/* 5. Traditional 401(k) Balance and Withdrawals */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Traditional 401(k) Balance */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Traditional 401(k) Balance
              </div>

            {/* Description */}
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              Pre-tax. Employer-sponsored. $23,500 limit. No taxes now, taxed at withdrawal. Employer match available.
              </div>

            {/* Key Parameters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Contribution Start Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.contributionStartAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('contributionStartAge', e.target.value)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.contributionStartAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.contributionStartAge}
            </div>
                )}
            </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Retirement Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.retirementAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('retirementAge', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.retirementAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.retirementAge}
            </div>
                )}
          </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Annual Rate of Return (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.annualReturnRate || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('annualReturnRate', e.target.value)}
                  min="0"
                  max="20"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.annualReturnRate && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.annualReturnRate}
              </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Employer Match (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.employerMatch401k || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('employerMatch401k', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.employerMatch401k && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.employerMatch401k}
              </div>
                )}
            </div>
          </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_401k_a || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_401k_a', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_401k_a && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_401k_a}
        </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_401k_a).toFixed(2)}% of Monthly Pre-Tax Income</div>
      </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_401k_b || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_401k_b', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_401k_b && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_401k_b}
              </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_401k_b).toFixed(2)}% of Monthly Pre-Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_401k_c || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_401k_c', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_401k_c && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_401k_c}
            </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_401k_c).toFixed(2)}% of Monthly Pre-Tax Income</div>
              </div>
              </div>

            {/* Dynamic Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Traditional 401(k) Balance vs. Age Chart
              </div>
              {(() => {
                const chartData = generateTraditional401kChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // Dynamic Y-axis values based on max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.5;
                  else if (normalized <= 5) step = 1;
                  else step = 2;
                  
                  step *= magnitude;
                  const steps = Math.ceil(max / step);
                  
                  const values = [];
                  for (let i = 0; i <= steps; i++) {
                    values.push(i * step);
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(maxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / maxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Series A line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesA / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3F7293"
                        strokeWidth="2"
                      />
                      
                      {/* Series B line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesB / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#D97F3F"
                        strokeWidth="2"
                      />
                      
                      {/* Series C line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesC / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#5A8D5A"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>


            {/* Traditional 401k Series A Tables */}
            {tableVisibility.traditional401kSeriesA && (() => {
              const seriesAData = calculateTraditional401kSeriesA();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Accumulation Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional 401(k) Plan - Series A (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Employer Match</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Total Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesAData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.annualContribution.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.employerMatch.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.totalContribution.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.accountBalance.toFixed(2)}</td>
                            </tr>
                          ))}
                          {seriesAData.accumulationData.length > 20 && (
                            <tr>
                              <td colSpan="6" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontStyle: 'italic' }}>
                                ... and {seriesAData.accumulationData.length - 20} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Summary Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                Summary
            </div>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '4px', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario A</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario B</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario C</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Future Value Retirement Balance</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditional401kSeriesA().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditional401kSeriesB().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditional401kSeriesC().finalBalance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Value in Today's Dollars</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditional401kSeriesA().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditional401kSeriesB().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditional401kSeriesC().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
          </div>
              </div>

          {/* Traditional 401(k) Withdrawals */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Traditional 401(k) Withdrawals
              </div>

            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Note: Withdrawal Balance calculated from previous Traditional 401(k) Balance (left)
              </div>

            {/* RMD Input */}
            {selectedWithdrawalSeries === 'A' && (() => {
              const seriesAData = calculateTraditional401kSeriesA();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Withdrawal Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
              border: '1px solid #e9ecef'
            }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional 401(k) Plan - Series A (Withdrawal Phase)
              </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Withdrawals</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance For Withdrawals</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesAData.withdrawalData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.withdrawals.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.accountBalance.toFixed(2)}</td>
                            </tr>
                          ))}
                          {seriesAData.withdrawalData.length > 20 && (
                            <tr>
                              <td colSpan="3" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontStyle: 'italic' }}>
                                ... and {seriesAData.withdrawalData.length - 20} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Series B Withdrawal Tables */}
            {selectedWithdrawalSeries === 'B' && (() => {
              const seriesBData = calculateTraditional401kSeriesB();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Withdrawal Phase Table */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional 401(k) Plan - Series B (Withdrawal Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Withdrawals</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance For Withdrawals</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesBData.withdrawalData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.withdrawals.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.accountBalance.toFixed(2)}</td>
                            </tr>
                          ))}
                          {seriesBData.withdrawalData.length > 20 && (
                            <tr>
                              <td colSpan="3" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontStyle: 'italic' }}>
                                ... and {seriesBData.withdrawalData.length - 20} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Series C Tables */}
            {selectedWithdrawalSeries === 'C' && (() => {
              const seriesCData = calculateTraditional401kSeriesC();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Withdrawal Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
              border: '1px solid #e9ecef'
            }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional 401(k) Plan - Series C (Withdrawal Phase)
              </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Withdrawals</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance For Withdrawals</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesCData.withdrawalData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.withdrawals.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.accountBalance.toFixed(2)}</td>
                            </tr>
                          ))}
                          {seriesCData.withdrawalData.length > 20 && (
                            <tr>
                              <td colSpan="3" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontStyle: 'italic' }}>
                                ... and {seriesCData.withdrawalData.length - 20} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RMD Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                minWidth: '60px'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>RMD</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rmdAge || ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#ffb3ba',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'not-allowed'
                  }}
                />
          </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                flex: 1
              }}>
                RMD: Required Minimum Distribution (last start age for withdrawals) - Fixed at 75
        </div>
      </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kWithdrawalRateA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kWithdrawalRateA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kWithdrawalRateA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kWithdrawalRateA}
              </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kAgeA || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kAgeA', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kAgeA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kAgeA}
              </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditional401kPV('A').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kWithdrawalRateB || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kWithdrawalRateB', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kWithdrawalRateB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kWithdrawalRateB}
            </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kAgeB || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kAgeB', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kAgeB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kAgeB}
              </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditional401kPV('B').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kWithdrawalRateC || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kWithdrawalRateC', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kWithdrawalRateC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kWithdrawalRateC}
              </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditional401kAgeC || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditional401kAgeC', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditional401kAgeC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditional401kAgeC}
            </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditional401kPV('C').toFixed(2)}</div>
            </div>
          </div>

            {/* Traditional 401k Series B Tables */}
            {tableVisibility.traditional401kSeriesB && (() => {
              const seriesBData = calculateTraditional401kSeriesB();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Accumulation Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional 401(k) Plan - Series B (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Employer Match</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Total Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesBData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.annualContribution.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.employerMatch.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>${row.totalContribution.toFixed(2)}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: '600' }}>${row.accountBalance.toFixed(2)}</td>
                            </tr>
                          ))}
                          {seriesBData.accumulationData.length > 20 && (
                            <tr>
                              <td colSpan="6" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center', fontStyle: 'italic' }}>
                                ... and {seriesBData.accumulationData.length - 20} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Traditional 401(k) Withdrawals vs Age Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Traditional 401(k) Withdrawals vs. Age Chart
              </div>
              {(() => {
                const chartData = generateTraditional401kWithdrawalsChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // For withdrawal charts, extend Y-axis to double the max value for better visual spacing
                const extendedMaxValue = maxValue * 2;
                
                // Dynamic Y-axis values based on extended max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals - aim for 5-6 steps
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.4;
                  else if (normalized <= 5) step = 1;
                  else if (normalized <= 10) step = 2;
                  else step = 5;
                  
                  step *= magnitude;
                  
                  // Ensure we have 5-6 steps
                  const numSteps = Math.ceil(max / step);
                  if (numSteps < 4) {
                    step = max / 5;
                  } else if (numSteps > 8) {
                    step = max / 6;
                  }
                  
                  const values = [];
                  for (let i = 0; i <= Math.ceil(max / step); i++) {
                    const value = i * step;
                    if (value <= max) {
                      values.push(value);
                    }
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(extendedMaxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / extendedMaxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Bar chart - Series A, B, C bars for each age */}
                      {chartData.map((d, i) => {
                        const barWidth = (plotWidth / chartData.length) * 0.8; // 80% of available space
                        const barSpacing = (plotWidth / chartData.length) * 0.2; // 20% spacing
                        const x = yAxisLabelWidth + (plotWidth / chartData.length) * i + barSpacing / 2;
                        
                        return (
                          <g key={i}>
                            {/* Series A bar */}
                            <rect
                              x={x}
                              y={padding + plotHeight * (1 - d.seriesA / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesA / extendedMaxValue)}
                              fill="#3F7293"
                              opacity="0.8"
                            />
                            
                            {/* Series B bar */}
                            <rect
                              x={x + barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesB / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesB / extendedMaxValue)}
                              fill="#D97F3F"
                              opacity="0.8"
                            />
                            
                            {/* Series C bar */}
                            <rect
                              x={x + 2 * barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesC / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesC / extendedMaxValue)}
                              fill="#5A8D5A"
                              opacity="0.8"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>


            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              Note: If the Annual Rate of Return is larger than Withdrawal Rate, your portfolio will increase forever!
              </div>
            </div>
          </div>

        {/* 6. Roth 401(k) Balance and Withdrawals */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Roth 401(k) Balance */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Roth 401(k) Balance
        </div>

            {/* Description */}
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              Post-tax. Employer-sponsored. $23,500 limit. Pay taxes now, withdraw tax-free. Employer match common; goes into pre-tax 401(k).
      </div>

            {/* Key Parameters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Contribution Start Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.contributionStartAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('contributionStartAge', e.target.value)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.contributionStartAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.contributionStartAge}
              </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Retirement Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.retirementAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('retirementAge', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.retirementAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.retirementAge}
            </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Annual Rate of Return (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.annualReturnRate || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('annualReturnRate', e.target.value)}
                  min="0"
                  max="20"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.annualReturnRate && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.annualReturnRate}
              </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Employer Match (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.employerMatch401k || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('employerMatch401k', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.employerMatch401k && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.employerMatch401k}
            </div>
                )}
            </div>
          </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_401k_a || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_401k_a', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_401k_a && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_401k_a}
              </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_401k_a).toFixed(2)}% of Monthly After Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_401k_b || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_401k_b', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_401k_b && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_401k_b}
              </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_401k_b).toFixed(2)}% of Monthly After Tax Income</div>
            </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_401k_c || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_401k_c', e.target.value)}
                  min="0"
                  max="1958.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_401k_c && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_401k_c}
          </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_401k_c).toFixed(2)}% of Monthly After Tax Income</div>
        </div>
      </div>

            {/* Dynamic Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Roth 401(k) Balance vs. Age Chart
      </div>
              {(() => {
                const chartData = generateRoth401kChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // Dynamic Y-axis values based on max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.5;
                  else if (normalized <= 5) step = 1;
                  else step = 2;
                  
                  step *= magnitude;
                  const steps = Math.ceil(max / step);
                  
                  const values = [];
                  for (let i = 0; i <= steps; i++) {
                    values.push(i * step);
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(maxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / maxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Series A line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesA / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3F7293"
                        strokeWidth="2"
                      />
                      
                      {/* Series B line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesB / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#D97F3F"
                        strokeWidth="2"
                      />
                      
                      {/* Series C line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesC / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#5A8D5A"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
      </div>


            {/* Series Tables */}
            {selectedRoth401kSeries === 'A' && (() => {
              const seriesAData = calculateRoth401kSeriesA();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Accumulation Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth 401(k) Plan - Series A (Accumulation Phase)
      </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Employer Match</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Total Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesAData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.employerMatch.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.totalContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedRoth401kSeries === 'B' && (() => {
              const seriesBData = calculateRoth401kSeriesB();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Accumulation Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth 401(k) Plan - Series B (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Employer Match</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Total Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesBData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.employerMatch.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.totalContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedRoth401kSeries === 'C' && (() => {
              const seriesCData = calculateRoth401kSeriesC();
              return (
                <div style={{ marginBottom: '16px' }}>
                  {/* Accumulation Phase Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth 401(k) Plan - Series C (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Employer Match</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Total Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesCData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.employerMatch.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.totalContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Summary Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                Summary
      </div>
              <table style={{ width: '100%', fontSize: '11px' }}>
            <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '4px', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario A</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario B</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario C</th>
              </tr>
            </thead>
            <tbody>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Future Value Retirement Balance</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRoth401kSeriesA().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRoth401kSeriesB().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRoth401kSeriesC().finalBalance.toLocaleString()}</td>
                </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Value in Today's Dollars</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRoth401kSeriesA().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRoth401kSeriesB().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRoth401kSeriesC().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                  </tr>
            </tbody>
          </table>
          </div>
      </div>

          {/* Roth 401(k) Withdrawals */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Roth 401(k) Withdrawals
              </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              Note: Withdrawal Balance calculated from previous Roth 401(k) Balance (left)
              </div>

            {/* RMD Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                minWidth: '60px'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>RMD</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rmdAge || ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#ffb3ba',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                flex: 1
              }}>
                RMD: Required Minimum Distribution (last start age for withdrawals) - Fixed at 75
            </div>
      </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kWithdrawalRateA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kWithdrawalRateA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kWithdrawalRateA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kWithdrawalRateA}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kAgeA || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kAgeA', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kAgeA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kAgeA}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRoth401kPV('A').toFixed(2)}</div>
          </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kWithdrawalRateB || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kWithdrawalRateB', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kWithdrawalRateB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kWithdrawalRateB}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kAgeB || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kAgeB', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kAgeB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kAgeB}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRoth401kPV('B').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kWithdrawalRateC || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kWithdrawalRateC', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kWithdrawalRateC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kWithdrawalRateC}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.roth401kAgeC || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('roth401kAgeC', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.roth401kAgeC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.roth401kAgeC}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRoth401kPV('C').toFixed(2)}</div>
              </div>
      </div>

            {/* Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Roth 401(k) Withdrawals vs. Age Chart
            </div>
              {(() => {
                const chartData = generateRoth401kWithdrawalsChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // For withdrawal charts, extend Y-axis to double the max value for better visual spacing
                const extendedMaxValue = maxValue * 2;
                
                // Dynamic Y-axis values based on extended max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals - aim for 5-6 steps
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.4;
                  else if (normalized <= 5) step = 1;
                  else if (normalized <= 10) step = 2;
                  else step = 5;
                  
                  step *= magnitude;
                  
                  // Ensure we have 5-6 steps
                  const numSteps = Math.ceil(max / step);
                  if (numSteps < 4) {
                    step = max / 5;
                  } else if (numSteps > 8) {
                    step = max / 6;
                  }
                  
                  const values = [];
                  for (let i = 0; i <= Math.ceil(max / step); i++) {
                    const value = i * step;
                    if (value <= max) {
                      values.push(value);
                    }
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(extendedMaxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / extendedMaxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Bar chart - Series A, B, C bars for each age */}
                      {chartData.map((d, i) => {
                        const barWidth = (plotWidth / chartData.length) * 0.8; // 80% of available space
                        const barSpacing = (plotWidth / chartData.length) * 0.2; // 20% spacing
                        const x = yAxisLabelWidth + (plotWidth / chartData.length) * i + barSpacing / 2;
                        
                        return (
                          <g key={i}>
                            {/* Series A bar */}
                            <rect
                              x={x}
                              y={padding + plotHeight * (1 - d.seriesA / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesA / extendedMaxValue)}
                              fill="#3F7293"
                              opacity="0.8"
                            />
                            
                            {/* Series B bar */}
                            <rect
                              x={x + barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesB / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesB / extendedMaxValue)}
                              fill="#D97F3F"
                              opacity="0.8"
                            />
                            
                            {/* Series C bar */}
                            <rect
                              x={x + 2 * barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesC / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesC / extendedMaxValue)}
                              fill="#5A8D5A"
                              opacity="0.8"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
          </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              Note: If the Annual Rate of Return is larger than Withdrawal Rate, your portfolio will increase forever!
              </div>




        </div>
      </div>

        {/* 7. Traditional IRA Balance and Withdrawals */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Traditional IRA Balance */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Traditional IRA Balance
      </div>

            {/* Description */}
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              Pre-tax. Individual account. $7,000 limit under 50 y/o & under $150,000 income. Lowers taxes now, taxed at withdrawal. No employer match.
      </div>

            {/* Key Parameters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Contribution Start Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.contributionStartAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('contributionStartAge', e.target.value)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.contributionStartAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.contributionStartAge}
                  </div>
                )}
      </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Retirement Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.retirementAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('retirementAge', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.retirementAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.retirementAge}
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Annual Rate of Return (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.annualReturnRate || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('annualReturnRate', e.target.value)}
                  min="0"
                  max="20"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.annualReturnRate && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.annualReturnRate}
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Employer Match (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.employerMatchIRA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('employerMatchIRA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.employerMatchIRA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.employerMatchIRA}
                  </div>
                )}
              </div>
            </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_ira_a || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_ira_a', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_ira_a && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_ira_a}
          </div>
        )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_ira_a).toFixed(2)}% of Monthly Pre-Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_ira_b || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_ira_b', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_ira_b && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_ira_b}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_ira_b).toFixed(2)}% of Monthly Pre-Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.traditional_ira_c || ''}
                  onChange={(e) => handleMonthlyPaymentChange('traditional_ira_c', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.traditional_ira_c && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.traditional_ira_c}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfPreTaxIncome(monthlyPayments.traditional_ira_c).toFixed(2)}% of Monthly Pre-Tax Income</div>
              </div>
      </div>

            {/* Traditional IRA Balance vs Age Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Traditional IRA Balance vs. Age Chart
              </div>
              {(() => {
                const chartData = generateTraditionalIRAChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // Dynamic Y-axis values based on max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.5;
                  else if (normalized <= 5) step = 1;
                  else step = 2;
                  
                  step *= magnitude;
                  const steps = Math.ceil(max / step);
                  
                  const values = [];
                  for (let i = 0; i <= steps; i++) {
                    values.push(i * step);
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(maxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / maxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Series A line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesA / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3F7293"
                        strokeWidth="2"
                      />
                      
                      {/* Series B line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesB / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#D97F3F"
                        strokeWidth="2"
                      />
                      
                      {/* Series C line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesC / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#5A8D5A"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>

            {/* Series Tables */}
            {selectedTraditionalIRASeries === 'A' && (() => {
              const seriesAData = calculateTraditionalIRASeriesA();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional IRA Plan - Series A (Accumulation Phase)
            </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesAData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedTraditionalIRASeries === 'B' && (() => {
              const seriesBData = calculateTraditionalIRASeriesB();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional IRA Plan - Series B (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesBData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedTraditionalIRASeries === 'C' && (() => {
              const seriesCData = calculateTraditionalIRASeriesC();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Traditional IRA Plan - Series C (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesCData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Summary Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                Summary
              </div>
              <table style={{ width: '100%', fontSize: '11px' }}>
            <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '4px', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario A</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario B</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario C</th>
              </tr>
            </thead>
          <tbody>
            <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Future Value Retirement Balance</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditionalIRASeriesA().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditionalIRASeriesB().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateTraditionalIRASeriesC().finalBalance.toLocaleString()}</td>
            </tr>
            <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Value in Today's Dollars</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditionalIRASeriesA().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditionalIRASeriesB().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateTraditionalIRASeriesC().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
            </tr>
            </tbody>
          </table>
          </div>
      </div>

          {/* Traditional IRA Withdrawals */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Traditional IRA Withdrawals
            </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              Note: Withdrawal Balance calculated from previous Traditional IRA Balance (left)
            </div>

            {/* RMD Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                minWidth: '60px'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>RMD</div>
                <input
                  type="number"
                  value="75"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#ffb3ba',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                flex: 1
              }}>
                RMD: Required Minimum Distribution (last start age for withdrawals) - Fixed at 75
              </div>
            </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAWithdrawalRateA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAWithdrawalRateA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAWithdrawalRateA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAWithdrawalRateA}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAAgeA || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAAgeA', e.target.value)}
                  min="31"
                  max={retirementPlanningInputs.rmdAge || 73}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAAgeA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAAgeA}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditionalIRAPV('A').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAWithdrawalRateB || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAWithdrawalRateB', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAWithdrawalRateB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAWithdrawalRateB}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAAgeB || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAAgeB', e.target.value)}
                  min="31"
                  max={retirementPlanningInputs.rmdAge || 73}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAAgeB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAAgeB}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditionalIRAPV('B').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAWithdrawalRateC || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAWithdrawalRateC', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAWithdrawalRateC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAWithdrawalRateC}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.traditionalIRAAgeC || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('traditionalIRAAgeC', e.target.value)}
                  min="31"
                  max={retirementPlanningInputs.rmdAge || 73}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.traditionalIRAAgeC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.traditionalIRAAgeC}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateTraditionalIRAPV('C').toFixed(2)}</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            {/* Traditional IRA Withdrawals vs Age Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Traditional IRA Withdrawals vs. Age Chart
              </div>
              {(() => {
                const chartData = generateTraditionalIRAWithdrawalsChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // For withdrawal charts, extend Y-axis to double the max value for better visual spacing
                const extendedMaxValue = maxValue * 2;
                
                // Dynamic Y-axis values based on extended max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals - aim for 5-6 steps
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.4;
                  else if (normalized <= 5) step = 1;
                  else if (normalized <= 10) step = 2;
                  else step = 5;
                  
                  step *= magnitude;
                  
                  // Ensure we have 5-6 steps
                  const numSteps = Math.ceil(max / step);
                  if (numSteps < 4) {
                    step = max / 5;
                  } else if (numSteps > 8) {
                    step = max / 6;
                  }
                  
                  const values = [];
                  for (let i = 0; i <= Math.ceil(max / step); i++) {
                    const value = i * step;
                    if (value <= max) {
                      values.push(value);
                    }
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(extendedMaxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / extendedMaxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Bar chart - Series A, B, C bars for each age */}
                      {chartData.map((d, i) => {
                        const barWidth = (plotWidth / chartData.length) * 0.8; // 80% of available space
                        const barSpacing = (plotWidth / chartData.length) * 0.2; // 20% spacing
                        const x = yAxisLabelWidth + (plotWidth / chartData.length) * i + barSpacing / 2;
                        
                        return (
                          <g key={i}>
                            {/* Series A bar */}
                            <rect
                              x={x}
                              y={padding + plotHeight * (1 - d.seriesA / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesA / extendedMaxValue)}
                              fill="#3F7293"
                              opacity="0.8"
                            />
                            
                            {/* Series B bar */}
                            <rect
                              x={x + barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesB / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesB / extendedMaxValue)}
                              fill="#D97F3F"
                              opacity="0.8"
                            />
                            
                            {/* Series C bar */}
                            <rect
                              x={x + 2 * barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesC / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesC / extendedMaxValue)}
                              fill="#5A8D5A"
                              opacity="0.8"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#28a745' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#dc3545' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              Note: If the Annual Rate of Return is larger than Withdrawal Rate, your portfolio will increase forever!
            </div>




          </div>
        </div>

        {/* 8. Roth IRA Balance and Withdrawals */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Roth IRA Balance */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Roth IRA Balance
            </div>

            {/* Description */}
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              Post-tax. Individual account. $7,000 limit under 50 yo & under $150,000 income. Tax-free growth and withdrawals. No employer match.
            </div>

            {/* Key Parameters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Contribution Start Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.contributionStartAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('contributionStartAge', e.target.value)}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.contributionStartAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.contributionStartAge}
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Retirement Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.retirementAge || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('retirementAge', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.retirementAge && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.retirementAge}
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Annual Rate of Return (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.annualReturnRate || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('annualReturnRate', e.target.value)}
                  min="0"
                  max="20"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.annualReturnRate && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.annualReturnRate}
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Employer Match (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.employerMatchIRA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('employerMatchIRA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px'
                  }}
                />
                {retirementPlanningErrors.employerMatchIRA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.employerMatchIRA}
                  </div>
                )}
              </div>
            </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_ira_a || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_ira_a', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_ira_a && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_ira_a}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_ira_a).toFixed(2)}% of Monthly After Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_ira_b || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_ira_b', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_ira_b && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_ira_b}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_ira_b).toFixed(2)}% of Monthly After Tax Income</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Monthly Payment</div>
                <input
                  type="number"
                  value={monthlyPayments.roth_ira_c || ''}
                  onChange={(e) => handleMonthlyPaymentChange('roth_ira_c', e.target.value)}
                  min="0"
                  max="583.33"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {monthlyPaymentErrors.roth_ira_c && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {monthlyPaymentErrors.roth_ira_c}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{calculatePercentageOfAfterTaxIncome(monthlyPayments.roth_ira_c).toFixed(2)}% of Monthly After Tax Income</div>
              </div>
            </div>

            {/* Roth IRA Balance vs Age Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Roth IRA Balance vs. Age Chart
              </div>
              {(() => {
                const chartData = generateRothIRAChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // Dynamic Y-axis values based on max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.5;
                  else if (normalized <= 5) step = 1;
                  else step = 2;
                  
                  step *= magnitude;
                  const steps = Math.ceil(max / step);
                  
                  const values = [];
                  for (let i = 0; i <= steps; i++) {
                    values.push(i * step);
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(maxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / maxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Series A line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesA / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3F7293"
                        strokeWidth="2"
                      />
                      
                      {/* Series B line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesB / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#D97F3F"
                        strokeWidth="2"
                      />
                      
                      {/* Series C line */}
                      <polyline
                        points={chartData.map((d, i) => 
                          `${yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * i},${padding + plotHeight * (1 - d.seriesC / maxValue)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#5A8D5A"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#D97F3F' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#5A8D5A' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>


            {/* Series Tables */}
            {selectedRothIRASeries === 'A' && (() => {
              const seriesAData = calculateRothIRASeriesA();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth IRA Plan - Series A (Accumulation Phase)
            </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesAData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedRothIRASeries === 'B' && (() => {
              const seriesBData = calculateRothIRASeriesB();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth IRA Plan - Series B (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesBData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedRothIRASeries === 'C' && (() => {
              const seriesCData = calculateRothIRASeriesC();
              return (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e9ecef',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                      Roth IRA Plan - Series C (Accumulation Phase)
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Age</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Year</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Annual Contribution</th>
                            <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>Account Balance (FV)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seriesCData.accumulationData.slice(0, 20).map((row, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.age}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{row.year}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.annualContribution.toLocaleString()}</td>
                              <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>${row.accountBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Summary Table */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                Summary
              </div>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: '4px', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario A</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario B</th>
                    <th style={{ padding: '4px', textAlign: 'center' }}>Scenario C</th>
            </tr>
                </thead>
          <tbody>
            <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Future Value Retirement Balance</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRothIRASeriesA().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRothIRASeriesB().finalBalance.toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculateRothIRASeriesC().finalBalance.toLocaleString()}</td>
            </tr>
            <tr>
                    <td style={{ padding: '4px', fontWeight: '600' }}>Value in Today's Dollars</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRothIRASeriesA().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRothIRASeriesB().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>${calculatePresentValue(calculateRothIRASeriesC().finalBalance, (retirementPlanningInputs.retirementAge || 65) - (retirementPlanningInputs.contributionStartAge || 22)).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
            </div>
      </div>

          {/* Roth IRA Withdrawals */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#002060',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Roth IRA Withdrawals
            </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              Note: Withdrawal Balance calculated from previous Roth IRA Balance (left)
            </div>

            {/* RMD Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                minWidth: '60px'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>RMD</div>
                <input
                  type="text"
                  value="None"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#ffb3ba',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                flex: 1
              }}>
                RMD: Required Minimum Distribution (last start age for withdrawals)
              </div>
            </div>

            {/* Scenarios */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario A</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAWithdrawalRateA || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAWithdrawalRateA', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAWithdrawalRateA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAWithdrawalRateA}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAAgeA || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAAgeA', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAAgeA && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAAgeA}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRothIRAPV('A').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario B</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAWithdrawalRateB || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAWithdrawalRateB', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAWithdrawalRateB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAWithdrawalRateB}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAAgeB || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAAgeB', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAAgeB && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAAgeB}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRothIRAPV('B').toFixed(2)}</div>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Scenario C</div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Withdrawal Rate (%)</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAWithdrawalRateC || ''}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAWithdrawalRateC', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAWithdrawalRateC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAWithdrawalRateC}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px', marginTop: '4px' }}>Starting Distribution Age</div>
                <input
                  type="number"
                  value={retirementPlanningInputs.rothIRAAgeC || 60}
                  onChange={(e) => handleRetirementPlanningInputChange('rothIRAAgeC', e.target.value)}
                  min="31"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    backgroundColor: '#fffde7',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}
                />
                {retirementPlanningErrors.rothIRAAgeC && (
                  <div style={{ fontSize: '9px', color: 'red', marginTop: '2px' }}>
                    {retirementPlanningErrors.rothIRAAgeC}
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>PV of First Payment: ${calculateRothIRAPV('C').toFixed(2)}</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            {/* Roth IRA Withdrawals vs Age Chart */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '350px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
                Roth IRA Withdrawals vs. Age Chart
              </div>
              {(() => {
                const chartData = generateRothIRAWithdrawalsChartData();
                const maxValue = Math.max(...chartData.map(d => Math.max(d.seriesA, d.seriesB, d.seriesC)));
                
                // For withdrawal charts, extend Y-axis to double the max value for better visual spacing
                const extendedMaxValue = maxValue * 2;
                
                // Dynamic Y-axis values based on extended max value
                const getYAxisValues = (max) => {
                  if (max === 0) return [0];
                  
                  // Calculate nice intervals - aim for 5-6 steps
                  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
                  const normalized = max / magnitude;
                  
                  let step;
                  if (normalized <= 1) step = 0.2;
                  else if (normalized <= 2) step = 0.4;
                  else if (normalized <= 5) step = 1;
                  else if (normalized <= 10) step = 2;
                  else step = 5;
                  
                  step *= magnitude;
                  
                  // Ensure we have 5-6 steps
                  const numSteps = Math.ceil(max / step);
                  if (numSteps < 4) {
                    step = max / 5;
                  } else if (numSteps > 8) {
                    step = max / 6;
                  }
                  
                  const values = [];
                  for (let i = 0; i <= Math.ceil(max / step); i++) {
                    const value = i * step;
                    if (value <= max) {
                      values.push(value);
                    }
                  }
                  return values;
                };
                
                const yAxisValues = getYAxisValues(extendedMaxValue);
                const chartWidth = 500;
                const chartHeight = 250;
                const padding = 20;
                const yAxisLabelWidth = 60; // Space for Y-axis labels
                const plotWidth = chartWidth - padding - yAxisLabelWidth;
                const plotHeight = chartHeight - 2 * padding;
                
                return (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                      {/* Grid lines with dynamic Y-axis values */}
                      {yAxisValues.map((value, i) => {
                        const ratio = value / extendedMaxValue;
                        return (
                          <g key={i}>
                            <line
                              x1={yAxisLabelWidth}
                              y1={padding + plotHeight * (1 - ratio)}
                              x2={yAxisLabelWidth + plotWidth}
                              y2={padding + plotHeight * (1 - ratio)}
                              stroke="#e0e0e0"
                              strokeWidth="1"
                            />
                            <text
                              x={yAxisLabelWidth - 5}
                              y={padding + plotHeight * (1 - ratio) + 4}
                              fontSize="10"
                              fill="#666"
                              textAnchor="end"
                            >
                              ${Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Age labels */}
                      {chartData.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <text
                          key={i}
                          x={yAxisLabelWidth + (plotWidth / (chartData.length - 1)) * (chartData.findIndex(item => item.age === d.age))}
                          y={chartHeight - padding + 15}
                          fontSize="10"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {d.age}
                        </text>
                      ))}
                      
                      {/* Bar chart - Series A, B, C bars for each age */}
                      {chartData.map((d, i) => {
                        const barWidth = (plotWidth / chartData.length) * 0.8; // 80% of available space
                        const barSpacing = (plotWidth / chartData.length) * 0.2; // 20% spacing
                        const x = yAxisLabelWidth + (plotWidth / chartData.length) * i + barSpacing / 2;
                        
                        return (
                          <g key={i}>
                            {/* Series A bar */}
                            <rect
                              x={x}
                              y={padding + plotHeight * (1 - d.seriesA / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesA / extendedMaxValue)}
                              fill="#3F7293"
                              opacity="0.8"
                            />
                            
                            {/* Series B bar */}
                            <rect
                              x={x + barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesB / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesB / extendedMaxValue)}
                              fill="#D97F3F"
                              opacity="0.8"
                            />
                            
                            {/* Series C bar */}
                            <rect
                              x={x + 2 * barWidth / 3}
                              y={padding + plotHeight * (1 - d.seriesC / extendedMaxValue)}
                              width={barWidth / 3}
                              height={plotHeight * (d.seriesC / extendedMaxValue)}
                              fill="#5A8D5A"
                              opacity="0.8"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
              
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#3F7293' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series A</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#28a745' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '2px', backgroundColor: '#dc3545' }}></div>
                  <span style={{ fontSize: '11px', color: '#666' }}>Series C</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              Note: If the Annual Rate of Return is larger than Withdrawal Rate, your portfolio will increase forever!
            </div>




          </div>
        </div>

      
          {/* Section Divider */}
          <div style={styles.sectionDivider}></div>

          {/* Save/Load Buttons - enhanced like Week 1/2/3 */}
          <div style={{
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={handleSaveWeek6}
              style={{
                backgroundColor: '#002060',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 8px rgba(0, 32, 96, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#003d82';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#002060';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              💾 Save Week 6 Data
            </button>
            <button
              onClick={handleLoadWeek6}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 8px rgba(55, 65, 81, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#374151';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📁 Load Week 6 Data
            </button>
        </div>
      </div>
    </>
  );
} 