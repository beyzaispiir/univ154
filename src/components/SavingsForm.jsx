import React, { useState, useMemo, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';

// Savings-specific configuration with individual sections
const savingsConfig = {
  title: "Savings Plan",
  sections: [
    {
      id: 'down_payment_1',
      title: 'Down Payment',
      sectionName: 'down_payment_1_name',
      goalAmount: 'down_payment_1',
      monthlySavings: 'down_payment_1_monthly',
      timeToGoal: 'down_payment_1_time',
      annualRate: 'down_payment_1_rate',
      calculationMode: 'time' // Calculate time from goal + monthly savings
    },
    {
      id: 'down_payment_2', 
      title: 'Down Payment',
      sectionName: 'down_payment_2_name',
      goalAmount: 'down_payment_2',
      monthlySavings: 'down_payment_2_monthly',
      timeToGoal: 'down_payment_2_time',
      annualRate: 'down_payment_2_rate',
      calculationMode: 'monthly' // Calculate monthly savings from goal + time
    },
    {
      id: 'car_1',
      title: 'Car',
      sectionName: 'car_1_name',
      goalAmount: 'car_1',
      monthlySavings: 'car_1_monthly',
      timeToGoal: 'car_1_time',
      annualRate: 'car_1_rate',
      calculationMode: 'time'
    },
    {
      id: 'car_2',
      title: 'Car', 
      sectionName: 'car_2_name',
      goalAmount: 'car_2',
      monthlySavings: 'car_2_monthly',
      timeToGoal: 'car_2_time',
      annualRate: 'car_2_rate',
      calculationMode: 'monthly'
    },
    {
      id: 'wedding_1',
      title: 'Wedding',
      sectionName: 'wedding_1_name',
      goalAmount: 'wedding_1',
      monthlySavings: 'wedding_1_monthly',
      timeToGoal: 'wedding_1_time',
      annualRate: 'wedding_1_rate',
      calculationMode: 'time'
    },
    {
      id: 'wedding_2',
      title: 'Wedding',
      sectionName: 'wedding_2_name',
      goalAmount: 'wedding_2', 
      monthlySavings: 'wedding_2_monthly',
      timeToGoal: 'wedding_2_time',
      annualRate: 'wedding_2_rate',
      calculationMode: 'monthly'
    },
    {
      id: 'advanced_degree_1',
      title: 'Advanced Degree',
      sectionName: 'advanced_degree_1_name',
      goalAmount: 'advanced_degree_1',
      monthlySavings: 'advanced_degree_1_monthly',
      timeToGoal: 'advanced_degree_1_time',
      annualRate: 'advanced_degree_1_rate',
      calculationMode: 'time'
    },
    {
      id: 'advanced_degree_2',
      title: 'Advanced Degree',
      sectionName: 'advanced_degree_2_name',
      goalAmount: 'advanced_degree_2',
      monthlySavings: 'advanced_degree_2_monthly', 
      timeToGoal: 'advanced_degree_2_time',
      annualRate: 'advanced_degree_2_rate',
      calculationMode: 'monthly'
    },
    {
      id: 'vacation_1',
      title: 'Vacation',
      sectionName: 'vacation_1_name',
      goalAmount: 'vacation_1',
      monthlySavings: 'vacation_1_monthly',
      timeToGoal: 'vacation_1_time',
      annualRate: 'vacation_1_rate',
      calculationMode: 'time'
    },
    {
      id: 'vacation_2',
      title: 'Vacation',
      sectionName: 'vacation_2_name',
      goalAmount: 'vacation_2',
      monthlySavings: 'vacation_2_monthly',
      timeToGoal: 'vacation_2_time',
      annualRate: 'vacation_2_rate',
      calculationMode: 'monthly'
    },
    {
      id: 'miscellaneous_1',
      title: 'Miscellaneous',
      sectionName: 'miscellaneous_1_name',
      goalAmount: 'miscellaneous_1',
      monthlySavings: 'miscellaneous_1_monthly',
      timeToGoal: 'miscellaneous_1_time',
      annualRate: 'miscellaneous_1_rate',
      calculationMode: 'time'
    },
    {
      id: 'miscellaneous_2',
      title: 'Miscellaneous',
      sectionName: 'miscellaneous_2_name',
      goalAmount: 'miscellaneous_2',
      monthlySavings: 'miscellaneous_2_monthly',
      timeToGoal: 'miscellaneous_2_time',
      annualRate: 'miscellaneous_2_rate',
      calculationMode: 'monthly'
    }
  ]
};

const styles = {
  // Main container - enhanced like Week 3
  container: { 
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontSize: '14px',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  sectionDivider: {
    height: '3px',
    background: 'linear-gradient(90deg, #002060, #28a745, #002060)',
    margin: '20px 0',
    borderRadius: '2px',
    boxShadow: '0 2px 4px rgba(0, 32, 96, 0.2)'
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
  
  // Header styling - matching Week 1
  header: { 
    fontSize: '14px', 
    fontWeight: '600',
    margin: '20px 0 10px 0', 
    color: '#002060' // Use website blue color
  },
  
  // Monthly After-Tax Income display - matching Week 1 green styling
  afterTaxRow: { 
    backgroundColor: '#e8f5e9', // Softer green - matching Week 1
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '12px 16px', 
    border: '1px solid #dcedc8', // Soft border
    width: '100%', 
    maxWidth: '600px',
    marginTop: '20px', 
    borderRadius: '8px', // Rounded corners
    fontWeight: '600',
    color: '#2e7d32',
    fontSize: '14px'
  },

  // Input fields - matching Week 1 yellow styling
  input: { 
    width: '100%', 
    border: '1px solid #ccc', 
    padding: '8px', 
    textAlign: 'right', 
    backgroundColor: '#fffde7', // Softer yellow - matching Week 1
    borderRadius: '6px', // Rounded corners
    boxSizing: 'border-box',
    fontWeight: '600',
    fontSize: '12px'
  },
  
  // Read-only fields - matching Week 1
  readOnly: { 
    textAlign: 'right', 
    paddingRight: '12px',
    color: '#555',
    fontSize: '14px'
  },
  
  // Input container - matching Week 1
  inputCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  
  // Currency symbol - matching Week 1
  currencySymbol: {
    marginLeft: '8px',
    color: '#555',
    fontSize: '14px'
  },
  
  // Section headers - matching Week 1 blue styling
  sectionHeader: { 
    fontWeight: '600',
    backgroundColor: '#f5f5f5', // Soft gray - matching Week 1
    color: '#002060', // Match nav link color for consistency
    fontSize: '14px',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0'
  },
  
  // Summary section - matching Week 1 styling
  summaryContainer: {
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px'
  },
  
  // Summary cards - matching Week 1 color scheme
  summaryCard: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  
  // Summary values - matching Week 1 styling
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  
  // Summary labels - matching Week 1 styling
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  
  // Info box - matching Week 1
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#eef2f6',
    borderRadius: '8px',
    color: '#334155',
    fontSize: '13px',
    marginBottom: '24px',
  },
  
  // Small percentage info - matching Excel style
  percentageInfo: {
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '4px',
    textAlign: 'right'
  },
};

const InfoIcon = () => (
    <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#3b82f6" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

export default function SavingsForm() {
    const budgetContext = useBudget();
    
    // Add debugging
    console.log('SavingsForm: budgetContext', budgetContext);
    
    // Add fallback in case context is not available
    if (!budgetContext) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading...</h2>
                <p>Please wait while the savings form loads.</p>
            </div>
        );
    }

    const { 
        topInputs, 
        setTopInputs, 
        financialCalculations,
        summaryCalculations,
        savingsInputs,
        setSavingsInputs,
        savingsCalculations,
        saveBudgetData,
        loadBudgetData
    } = budgetContext;

    // Handler functions for save/load
    // Auto-save function (without alert)
    const autoSaveSavings = () => {
        try {
            const savingsData = {
                topInputs,
                userInputs,
                customExpenseNames,
                expandedSections,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage silently
            localStorage.setItem('week2_data', JSON.stringify(savingsData));
        } catch (error) {
            console.error('Error auto-saving Week 2 data:', error);
        }
    };

    // Use context values instead of local state
    const userInputs = savingsInputs;
    const setUserInputs = setSavingsInputs;
    
    // Force re-render when inputs change
    const [, forceUpdate] = useState({});
    const triggerUpdate = () => forceUpdate({});

    // Set default values when page loads
    useEffect(() => {
        // Only set defaults if no meaningful values exist (first time loading)
        // Check only the goal amounts, monthly savings, and rates (not section names)
        const meaningfulKeys = [
            'down_payment_1', 'down_payment_1_monthly', 'down_payment_1_rate', 'down_payment_1_time',
            'down_payment_2', 'down_payment_2_monthly', 'down_payment_2_rate', 'down_payment_2_time',
            'car_1', 'car_1_monthly', 'car_1_rate', 'car_1_time',
            'car_2', 'car_2_monthly', 'car_2_rate', 'car_2_time',
            'wedding_1', 'wedding_1_monthly', 'wedding_1_rate', 'wedding_1_time',
            'wedding_2', 'wedding_2_monthly', 'wedding_2_rate', 'wedding_2_time',
            'advanced_degree_1', 'advanced_degree_1_monthly', 'advanced_degree_1_rate', 'advanced_degree_1_time',
            'advanced_degree_2', 'advanced_degree_2_monthly', 'advanced_degree_2_rate', 'advanced_degree_2_time',
            'vacation_1', 'vacation_1_monthly', 'vacation_1_rate', 'vacation_1_time',
            'vacation_2', 'vacation_2_monthly', 'vacation_2_rate', 'vacation_2_time',
            'miscellaneous_1', 'miscellaneous_1_monthly', 'miscellaneous_1_rate', 'miscellaneous_1_time',
            'miscellaneous_2', 'miscellaneous_2_monthly', 'miscellaneous_2_rate', 'miscellaneous_2_time'
        ];
        
        const hasAnyValues = meaningfulKeys.some(key => {
            const value = userInputs[key];
            return value !== '' && value !== null && value !== undefined && value !== 0;
        });
        
        if (!hasAnyValues) {
            const defaultValues = {
                // Down Payment
                'down_payment_1': '50000',
                'down_payment_1_monthly': '500',
                'down_payment_1_rate': '4',
                'down_payment_1_time': '60',
                'down_payment_2': '50000',
                'down_payment_2_monthly': '500',
                'down_payment_2_rate': '4',
                'down_payment_2_time': '60',
                // Car
                'car_1': '25000',
                'car_1_monthly': '500',
                'car_1_rate': '4',
                'car_1_time': '60',
                'car_2': '25000',
                'car_2_monthly': '500',
                'car_2_rate': '4',
                'car_2_time': '60',
                // Wedding
                'wedding_1': '15000',
                'wedding_1_monthly': '500',
                'wedding_1_rate': '4',
                'wedding_1_time': '60',
                'wedding_2': '15000',
                'wedding_2_monthly': '500',
                'wedding_2_rate': '4',
                'wedding_2_time': '60',
                // Advanced Degree
                'advanced_degree_1': '30000',
                'advanced_degree_1_monthly': '500',
                'advanced_degree_1_rate': '4',
                'advanced_degree_1_time': '60',
                'advanced_degree_2': '30000',
                'advanced_degree_2_monthly': '500',
                'advanced_degree_2_rate': '4',
                'advanced_degree_2_time': '60',
                // Vacation
                'vacation_1': '5000',
                'vacation_1_monthly': '500',
                'vacation_1_rate': '4',
                'vacation_1_time': '60',
                'vacation_2': '5000',
                'vacation_2_monthly': '500',
                'vacation_2_rate': '4',
                'vacation_2_time': '60',
                // Miscellaneous
                'miscellaneous_1': '10000',
                'miscellaneous_1_monthly': '500',
                'miscellaneous_1_rate': '4',
                'miscellaneous_1_time': '60',
                'miscellaneous_2': '10000',
                'miscellaneous_2_monthly': '500',
                'miscellaneous_2_rate': '4',
                'miscellaneous_2_time': '60'
            };
            
            setUserInputs(prev => ({
                ...prev,
                ...defaultValues
            }));
        }
    }, []);

    // Add missing state variables for save/load functionality
    const [expandedSections, setExpandedSections] = useState({});
    const [customExpenseNames, setCustomExpenseNames] = useState({});

    // Auto-load data on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('week2_data');
        if (savedData) {
            try {
                const savingsData = JSON.parse(savedData);
                
                // Load top inputs
                if (savingsData.topInputs) {
                    setTopInputs(savingsData.topInputs);
                }
                // Load user inputs
                if (savingsData.userInputs) {
                    setUserInputs(savingsData.userInputs);
                }
                // Load custom expense names
                if (savingsData.customExpenseNames) {
                    setCustomExpenseNames(savingsData.customExpenseNames);
                }
                // Load section states
                if (savingsData.expandedSections) {
                    setExpandedSections(savingsData.expandedSections);
                }
            } catch (error) {
                console.error('Error loading Week 2 data:', error);
            }
        }
    }, []); // Only run on mount

    // Auto-save with debounce (500ms delay)
    useEffect(() => {
        const saveTimer = setTimeout(() => {
            autoSaveSavings();
        }, 500); // Wait 500ms after last change before saving

        return () => clearTimeout(saveTimer);
    }, [topInputs, userInputs, customExpenseNames, expandedSections]);


    const afterTaxIncome = financialCalculations?.afterTaxIncome || 0;
    const monthlyAfterTaxIncome = savingsCalculations?.monthlyAfterTaxIncome || 0;
    
    // Debug: Log the values
    console.log('monthlyAfterTaxIncome from context:', monthlyAfterTaxIncome);

    // Function to calculate savings details for a specific goal
    const calculateSavingsDetails = (goalAmount, monthlySavingsAmount, timeToGoal, calculationMode, annualRateInput) => {
      const goal = parseFloat(goalAmount) || 0;
      const monthly = parseFloat(monthlySavingsAmount) || 0;
      const time = parseFloat(timeToGoal) || 0;
      
      // Require annual rate input - no default
      if (!annualRateInput || annualRateInput === '') {
        return { monthlySavings: 0, percentage: 0, timeToGoal: 0 };
      }
      
      const annualRate = parseFloat(annualRateInput) / 100; // Convert percentage to decimal
      const monthlyRate = annualRate / 12;

      // Debug: Check values
      console.log('=== CALCULATION DEBUG ===');
      console.log('monthlyAfterTaxIncome:', monthlyAfterTaxIncome);
      console.log('monthly:', monthly);
      console.log('calculationMode:', calculationMode);
      console.log('annualRateInput (raw):', annualRateInput, 'type:', typeof annualRateInput);
      console.log('annualRate (parsed):', annualRate, 'type:', typeof annualRate);
      console.log('monthlyRate:', monthlyRate);
      console.log('=== END DEBUG ===');

      // Calculate percentage for any monthly savings amount (input or calculated)
      let percentage = 0;
      
      // Use a fallback value if monthlyAfterTaxIncome is 0 (user hasn't filled Week 1)
      const effectiveMonthlyAfterTaxIncome = monthlyAfterTaxIncome > 0 ? monthlyAfterTaxIncome : 41575.22; // Fallback from your Excel
      
      if (effectiveMonthlyAfterTaxIncome > 0) {
        if (monthly > 0) {
          // For time calculation mode - use input monthly amount
          percentage = (monthly / effectiveMonthlyAfterTaxIncome) * 100;
          console.log('Time mode percentage:', percentage);
        } else if (calculationMode === 'monthly' && goal > 0 && time > 0) {
          // For monthly calculation mode - calculate monthly amount first
          const futureValueFactor = ((1 + monthlyRate) ** time - 1) / monthlyRate;
          const calculatedMonthly = goal / futureValueFactor;
          percentage = (calculatedMonthly / effectiveMonthlyAfterTaxIncome) * 100;
          console.log('Monthly mode percentage:', percentage);
        }
      }

      if (calculationMode === 'time') {
        // Calculate time to achieve goal with given monthly savings
        if (goal > 0 && monthly > 0) {
          // Using Excel NPER formula: NPER(rate, -pmt, pv, fv)
          // rate = monthlyRate, pmt = monthly, pv = 0, fv = goal
          const actualTime = Math.log(1 + (goal * monthlyRate) / monthly) / Math.log(1 + monthlyRate);
          console.log('Time calculation - goal:', goal, 'monthly:', monthly, 'monthlyRate:', monthlyRate, 'actualTime:', actualTime);
          return {
            timeToGoal: Math.ceil(actualTime),
            percentage: percentage
          };
        }
        return { monthlySavings: 0, percentage: percentage, timeToGoal: 0 };
      } else if (calculationMode === 'monthly') {
        // Calculate monthly savings needed for given goal and time
        if (goal > 0 && time > 0) {
          const futureValueFactor = ((1 + monthlyRate) ** time - 1) / monthlyRate;
          const requiredMonthly = goal / futureValueFactor;
          return {
            monthlySavings: requiredMonthly,
            percentage: percentage
          };
        }
        return { monthlySavings: 0, percentage: 0, timeToGoal: 0 };
      }
      
      return { monthlySavings: 0, percentage: percentage, timeToGoal: 0 };
    };

    const handleUserInputChange = (id, value) => {
        console.log('=== INPUT CHANGE DEBUG ===');
        console.log('Input ID:', id);
        console.log('Input Value:', value);
        console.log('Current userInputs:', userInputs);
        
        // Check if this is a section name field (allow all characters)
        if (id.includes('_name')) {
          console.log('Section name field - allowing all characters');
          console.log('Setting value to:', value);
          setUserInputs(prev => {
            const newState = { ...prev, [id]: value };
            console.log('Updated userInputs:', newState);
            console.log('New value for', id, ':', newState[id]);
            return newState;
          });
          triggerUpdate();
          return;
        }
        
        // Remove commas, $ and % symbols for processing
        const cleanValue = value.replace(/[,$%]/g, '');
        
        // Only allow numbers and at most one decimal point
        const sanitized = cleanValue.replace(/[^0-9.]/g, '');
        
        // Allow empty string for clearing the field
        if (sanitized === '') {
          setUserInputs(prev => {
            const newState = { ...prev, [id]: '' };
            triggerUpdate();
            return newState;
          });
          return;
        }
        
        // Prevent multiple decimals - find first decimal point
        const firstDotIndex = sanitized.indexOf('.');
        let numericValue = '';
        
        if (firstDotIndex === -1) {
          // No decimal point - just numbers
          numericValue = sanitized;
        } else {
          // Has decimal point - take integer part and up to 2 decimal places
          const intPart = sanitized.substring(0, firstDotIndex);
          const decPart = sanitized.substring(firstDotIndex + 1).slice(0, 2); // max 2 decimals
          numericValue = intPart + '.' + decPart;
        }
        
        // Allow just a decimal point or partial decimal (user might be typing ".50")
        if (sanitized === '.' || (firstDotIndex !== -1 && sanitized.substring(firstDotIndex + 1) === '')) {
          setUserInputs(prev => {
            const newState = { ...prev, [id]: numericValue };
            triggerUpdate();
            return newState;
          });
          return;
        }
        
        console.log('Sanitized value:', numericValue);
        
        // Data validation
        const numValue = parseFloat(numericValue);
        
        // Rule 1: Must be a number (if user entered something)
        if (numericValue && isNaN(numValue)) {
          alert('⚠️ Must be a number');
          return;
        }
        
        if (numericValue && !isNaN(numValue)) {
          // Must be >= 0
          if (numValue < 0) {
            alert('⚠️ Must be >= 0');
            return;
          }
          
          // Validate annual earning rate limits (0% to 100%)
          if (id.includes('_rate') && numValue > 100) {
            alert('⚠️ Annual earning rate must be between 0% and 100%');
            return;
          }
          
          // Validate retirement contribution limits
          if (id === 'retirement_roth_401k' && numValue > 23500) {
            alert('Roth 401(k) maximum contribution is $23,500 annually');
            return;
          }
          if (id === 'retirement_roth_ira' && numValue > 7000) {
            alert('Roth IRA maximum contribution is $7,000 annually');
            return;
          }
        }
        
        setUserInputs(prev => {
          const newState = { ...prev, [id]: numericValue };
          console.log('Updated userInputs:', newState);
          console.log('Specific rate value:', newState[id]);
          console.log('=== END INPUT CHANGE DEBUG ===');
          return newState;
        });
        triggerUpdate(); // Force re-render to update calculations
    };

    const formatCurrency = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (num) => (num * 100).toFixed(2) + '%';
    
    // Format number for input display (with commas, preserve decimals for cents)
    const formatNumberForInput = (num) => {
      if (!num || num === '') return '';
      
      // Keep as string to preserve decimal input exactly as user types
      const numStr = num.toString();
      
      // If it's just a decimal point, return it as-is
      if (numStr === '.') return '.';
      
      const number = parseFloat(num);
      if (isNaN(number)) return numStr;
      
      // If it has a decimal point, preserve it exactly (don't force 2 decimals)
      if (numStr.includes('.')) {
        const parts = numStr.split('.');
        const intPart = parts[0] || '';
        const decPart = parts[1] || '';
        
        // If intPart is empty (user typing ".5"), don't format
        if (intPart === '') {
          return '.' + decPart;
        }
        
        // Format integer part with commas, keep decimal part as-is
        const formattedInt = parseInt(intPart).toLocaleString('en-US');
        return decPart ? `${formattedInt}.${decPart}` : formattedInt + '.';
      } else {
        // Whole number - format with commas
        return parseInt(numStr).toLocaleString('en-US');
      }
    };
    
    // Parse number from formatted input (remove commas)
    const parseNumberFromInput = (str) => {
      if (!str) return '';
      return str.replace(/,/g, '');
    };


    try {
        return (
            <div style={styles.container}>
        
        <div style={{width: '1200px', maxWidth: '1200px'}}>
            {/* Section Container - matching Week 3 layered design */}
            <div style={styles.sectionContainer}>
            <div style={{width: '100%', maxWidth: '1200px', marginBottom: '20px'}}>
            {/* Enhanced Header */}
            <div style={styles.enhancedHeader}>
              💰 Savings Planning
            </div>
            <div style={{fontSize: '12px', color: '#666', marginBottom: '10px', fontStyle: 'italic'}}>
                Based on your monthly after-tax income
            </div>
            
            {/* Info Box - matching Week 1 styling */}
            <div style={styles.infoBox}>
              <InfoIcon />
              <div>
                <strong>How it works:</strong> Enter your goal amount and either monthly savings amount (to calculate time) or time period (to calculate monthly savings needed). You can customize the annual earning rate for each savings goal.
              </div>
            </div>
            
            {/* Monthly After-Tax Income Display */}
            <div style={{...styles.afterTaxRow, flexGrow: 1, marginTop: '10px', backgroundColor: '#e8f5e9'}}>
              <span>Monthly After-Tax Income</span>
              <span>${formatCurrency(monthlyAfterTaxIncome)}</span>
            </div>
        </div>
        
        {/* Individual Savings Sections - Grouped in pairs */}
        {savingsConfig.sections.reduce((acc, section, index) => {
          if (index % 2 === 0) {
            // Create a pair with current section and next section
            const nextSection = savingsConfig.sections[index + 1];
            acc.push([section, nextSection]);
          }
          return acc;
        }, []).map(([section1, section2], pairIndex) => {
          const goalAmount1 = userInputs[section1.goalAmount] || '';
          const monthlySavings1 = userInputs[section1.monthlySavings] || '';
          const timeToGoal1 = userInputs[section1.timeToGoal] || '';
          const annualRate1 = userInputs[section1.annualRate] || '';
          const sectionName1 = userInputs[section1.sectionName] || '';
          console.log('Rendering sectionName1 for', section1.sectionName, ':', sectionName1);
          console.log('Section 1 - annualRate1:', annualRate1, 'section1.annualRate:', section1.annualRate);
          const details1 = calculateSavingsDetails(goalAmount1, monthlySavings1, timeToGoal1, section1.calculationMode, annualRate1);
          
          const goalAmount2 = userInputs[section2.goalAmount] || '';
          const monthlySavings2 = userInputs[section2.monthlySavings] || '';
          const timeToGoal2 = userInputs[section2.timeToGoal] || '';
          const annualRate2 = userInputs[section2.annualRate] || '';
          const sectionName2 = userInputs[section2.sectionName] || '';
          console.log('Rendering sectionName2 for', section2.sectionName, ':', sectionName2);
          console.log('Section 2 - annualRate2:', annualRate2, 'section2.annualRate:', section2.annualRate);
          const details2 = calculateSavingsDetails(goalAmount2, monthlySavings2, timeToGoal2, section2.calculationMode, annualRate2);
          
          return (
            <div key={`pair-container-${pairIndex}`}>
              {/* Section Divider - except for first pair */}
              {pairIndex > 0 && (
                <div style={styles.sectionDivider}></div>
              )}
              
              {/* Savings Pair */}
              <div key={`pair-${pairIndex}`} style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px'
              }}>
              {/* First Section */}
              <div style={{
                flex: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
              {/* Section Header */}
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: '600',
                fontSize: '14px',
                color: '#002060'
              }}>
                <input
                  style={{
                    backgroundColor: '#fffde7',
                    border: '1px solid #ccc',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#002060',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  type="text"
                  value={sectionName1}
                  onChange={(e) => {
                    console.log('Section name input changed:', e.target.value);
                    handleUserInputChange(section1.sectionName, e.target.value);
                  }}
                  placeholder="Enter your goal name"
                />
              </div>
                
                {/* Section Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {/* Left Column */}
                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                          Goal Amount
                        </label>
                        <div style={styles.inputCellContainer}>
                          <input
                            style={styles.input}
                            type="text"
                            value={goalAmount1 ? `$${formatNumberForInput(goalAmount1)}` : ''}
                            onChange={(e) => handleUserInputChange(section1.goalAmount, e.target.value)}
                            placeholder="Enter goal amount"
                          />
                        </div>
                      </div>
                      
                      {section1.calculationMode === 'time' ? (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Monthly Savings Amount
                          </label>
                          <div style={styles.inputCellContainer}>
                            <input
                              style={styles.input}
                              type="text"
                              value={monthlySavings1 ? `$${formatNumberForInput(monthlySavings1)}` : ''}
                              onChange={(e) => handleUserInputChange(section1.monthlySavings, e.target.value)}
                              placeholder="Enter monthly amount"
                            />
                          </div>
                          <div style={styles.percentageInfo}>
                            {details1.percentage > 0 ? details1.percentage.toFixed(2) : '0.00'}% of Monthly After Tax Income
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Time to Achieve Savings Goal
                          </label>
                          <div style={styles.inputCellContainer}>
                            <input
                              style={styles.input}
                              type="number"
                              min="1"
                              step="1"
                              value={timeToGoal1}
                              onChange={(e) => handleUserInputChange(section1.timeToGoal, e.target.value)}
                              placeholder="Enter months"
                            />
                            <span style={{ marginLeft: '8px', color: '#555', fontSize: '12px' }}>months</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column */}
                    <div>
                      {section1.calculationMode === 'time' ? (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Time to Achieve Savings Goal
                          </label>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            color: '#333',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {details1.timeToGoal > 0 ? `${details1.timeToGoal} Months` : '-'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Monthly Savings Amount
                          </label>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            color: '#333',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {details1.monthlySavings > 0 ? `$${formatCurrency(details1.monthlySavings)}` : '-'}
                          </div>
                          <div style={styles.percentageInfo}>
                            {details1.percentage > 0 ? details1.percentage.toFixed(2) : '0.00'}% of Monthly After Tax Income
                          </div>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                          Annual Earning Rate
                        </label>
                        <div style={styles.inputCellContainer}>
                          <input
                            style={styles.input}
                            type="text"
                            value={annualRate1 ? `${annualRate1}%` : ''}
                            onChange={(e) => {
                              console.log('Annual Rate Input Changed:', e.target.value);
                              handleUserInputChange(section1.annualRate, e.target.value);
                            }}
                            placeholder="Enter rate"
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Required for calculations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Section */}
              <div style={{
                flex: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {/* Section Header */}
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e0e0e0',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#002060'
                }}>
                  <input
                    style={{
                      backgroundColor: '#fffde7',
                      border: '1px solid #ccc',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#002060',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    type="text"
                    value={sectionName2}
                    onChange={(e) => {
                      console.log('Section name 2 input changed:', e.target.value);
                      handleUserInputChange(section2.sectionName, e.target.value);
                    }}
                    placeholder="Enter your goal name"
                  />
                </div>
                
                {/* Section Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {/* Left Column */}
                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                          Goal Amount
                        </label>
                        <div style={styles.inputCellContainer}>
                          <input
                            style={styles.input}
                            type="text"
                            value={goalAmount2 ? `$${formatNumberForInput(goalAmount2)}` : ''}
                            onChange={(e) => handleUserInputChange(section2.goalAmount, e.target.value)}
                            placeholder="Enter goal amount"
                          />
                        </div>
                      </div>
                      
                      {section2.calculationMode === 'time' ? (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Monthly Savings Amount
                          </label>
                          <div style={styles.inputCellContainer}>
                            <input
                              style={styles.input}
                              type="text"
                              value={monthlySavings2 ? `$${formatNumberForInput(monthlySavings2)}` : ''}
                              onChange={(e) => handleUserInputChange(section2.monthlySavings, e.target.value)}
                              placeholder="Enter monthly amount"
                            />
                          </div>
                          <div style={styles.percentageInfo}>
                            {details2.percentage > 0 ? details2.percentage.toFixed(2) : '0.00'}% of Monthly After Tax Income
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Time to Achieve Savings Goal
                          </label>
                          <div style={styles.inputCellContainer}>
                            <input
                              style={styles.input}
                              type="number"
                              min="1"
                              step="1"
                              value={timeToGoal2}
                              onChange={(e) => handleUserInputChange(section2.timeToGoal, e.target.value)}
                              placeholder="Enter months"
                            />
                            <span style={{ marginLeft: '8px', color: '#555', fontSize: '12px' }}>months</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column */}
                    <div>
                      {section2.calculationMode === 'time' ? (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Time to Achieve Savings Goal
                          </label>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            color: '#333',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {details2.timeToGoal > 0 ? `${details2.timeToGoal} Months` : '-'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                            Monthly Savings Amount
                          </label>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            color: '#333',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {details2.monthlySavings > 0 ? `$${formatCurrency(details2.monthlySavings)}` : '-'}
                          </div>
                          <div style={styles.percentageInfo}>
                            {details2.percentage > 0 ? details2.percentage.toFixed(2) : '0.00'}% of Monthly After Tax Income
                          </div>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                          Annual Earning Rate
                        </label>
                        <div style={styles.inputCellContainer}>
                          <input
                            style={styles.input}
                            type="text"
                            value={annualRate2 ? `${annualRate2}%` : ''}
                            onChange={(e) => {
                              console.log('Annual Rate Input Changed:', e.target.value);
                              handleUserInputChange(section2.annualRate, e.target.value);
                            }}
                            placeholder="Enter rate"
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Required for calculations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          );
        })}
        </div>
        
        {/* Close sectionContainer */}
        </div>
        
        </div>
        );
    } catch (error) {
        console.error('Error rendering SavingsForm:', error);
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Error Loading Savings Form</h2>
                <p>There was an error loading the savings form. Please try refreshing the page.</p>
                <p style={{ color: 'red', fontSize: '12px' }}>Error: {error.message}</p>
            </div>
        );
    }
}
