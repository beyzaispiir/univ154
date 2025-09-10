import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import stateTaxData from '../data/stateTaxData';

// This data structure now includes all necessary info for rendering the exact layout
const budgetConfig = {
  title: "Monthly Budget",
  tableHeaders: [
    "Expense Items", 
    "Examples/Info", 
    "Budgeted Spend", 
    "Recommended Spend $", 
    "% of Monthly After-Tax Income"
  ],
  sections: [
    // Pre-Tax Expense Items
    {
      title: 'Pre-Tax Expense Items',
      isPreTax: true,
      items: [
        {
          title: 'Insurance',
          items: [
            { id: 'health_insurance', label: 'Health Insurance', explanation: 'Limits amount paid for medical bills' },
            { id: 'life_insurance', label: 'Life Insurance', explanation: 'Pay beneficiaries upon policyholder\'s death' },
            { id: 'disability_insurance', label: 'Disability Insurance', explanation: 'Income in case you are unable to work' },
          ]
        },
        {
          title: 'Retirement Contributions',
          items: [
            { id: 'traditional_401k', label: 'Traditional 401(k), 403(b), 457(b), or Thrift Savings Plan', explanation: '$23,500 Max Contribution' },
            { id: 'traditional_ira', label: 'Traditional IRA', explanation: '$7,000 Max Contribution' },
          ],
          note: 'Roth 401k & Roth IRA listed under After-Tax'
        }
      ]
    },
    {
      title: 'After-Tax Expense Items',
      items: [
        {
          title: 'Retirement Contributions',
          items: [
            { id: 'roth_401k', label: 'Roth 401(k) Plan', explanation: '$23,500 Max Contribution' },
            { id: 'roth_ira', label: 'Roth IRA Plan', explanation: '$7,000 Max Contribution' },
          ]
        },
        {
          title: 'Savings & Investments',
          items: [
            { id: 'emergency_fund', label: 'Emergency Fund', explanation: 'Job loss, medical emergencies, urgent' },
            { id: 'down_payment', label: 'Down Payment', explanation: 'Savings Goals' },
            { id: 'car', label: 'Car', explanation: 'Savings Goals' },
            { id: 'wedding', label: 'Wedding', explanation: 'Savings Goals' },
            { id: 'advanced_degree', label: 'Advanced Degree', explanation: 'Savings Goals' },
            { id: 'vacation', label: 'Vacation', explanation: 'Savings Goals' },
            { id: 'miscellaneous', label: 'Miscellaneous', explanation: 'Savings Goals' },
          ]
        },
        {
          title: 'Debt Payments',
          items: [
            { id: 'student_loans', label: 'Student Loans', explanation: 'Monthly student loan payments' },
            { id: 'credit_card_payments', label: 'Credit Card Payments', explanation: 'Monthly credit card payments' },
            { id: 'personal_loans', label: 'Personal Loans', explanation: 'Monthly personal loan payments' },
            { id: 'miscellaneous_debt', label: 'Miscellaneous', explanation: 'Other debt payments' },
          ]
        },
        {
          title: 'Housing',
          items: [
            { id: 'rent', label: 'Rent', explanation: 'House, apartment' },
            { id: 'electricity', label: 'Electricity', explanation: 'Appliances, lighting, heating/cooling systems' },
            { id: 'gas', label: 'Gas', explanation: 'Heating, hot water, cooking' },
            { id: 'water', label: 'Water', explanation: 'Drinking, bathing, cooking, laundry' },
            { id: 'sewer_trash', label: 'Sewer/Trash', explanation: 'Sewer maintenance, trash/recycling collection' },
            { id: 'phone', label: 'Phone (Cell/Landline)', explanation: 'Voice, text, landline' },
            { id: 'internet', label: 'Internet', explanation: 'Wi-Fi' },
            { id: 'housing_miscellaneous', label: 'Miscellaneous', explanation: 'Other housing expenses' },
          ]
        },
        {
          title: 'Transportation',
          items: [
            { id: 'car_payment', label: 'Car Payment', explanation: 'Principal & interest on auto loan' },
            { id: 'gasoline_fuel', label: 'Gasoline/Fuel', explanation: 'Automobile fuel' },
            { id: 'car_maintenance', label: 'Car Maintenance', explanation: 'Oil changes, tire replacement, battery check' },
            { id: 'parking_fees', label: 'Parking Fees', explanation: 'Metered parking, garage fees, permit fees' },
            { id: 'rideshare', label: 'Rideshare', explanation: 'Uber, Lyft' },
            { id: 'public_transit', label: 'Public Transit Passes', explanation: 'Buses, subways, trains, light rail services' },
            { id: 'transportation_miscellaneous', label: 'Miscellaneous', explanation: 'Other transportation expenses' },
          ]
        },
        {
          title: 'Insurance/Health',
          items: [
            { id: 'auto_insurance', label: 'Auto Insurance', explanation: 'Required vehicle coverage for damage' },
            { id: 'renters_insurance', label: 'Renter\'s Insurance', explanation: 'Protection for residence & belongings' },
            { id: 'otc_medications', label: 'Over-the-Counter Medications', explanation: 'Pain relievers, cold medicine, allergy meds' },
            { id: 'mental_health', label: 'Mental Health', explanation: 'Therapist, wellness apps, psychiatric care' },
            { id: 'physical_health', label: 'Physical Health', explanation: 'Gym membership, equipment, personal training' },
            { id: 'insurance_miscellaneous', label: 'Miscellaneous', explanation: 'Other insurance/health expenses' },
          ]
        },
        {
          title: 'Food',
          items: [
            { id: 'groceries', label: 'Groceries', explanation: 'Food & drinks' },
            { id: 'dining_out', label: 'Dining Out', explanation: 'Eating at restaurants' },
            { id: 'takeout', label: 'Takeout', explanation: 'Restaurant delivery, DoorDash' },
            { id: 'food_miscellaneous', label: 'Miscellaneous', explanation: 'Other food expenses' },
          ]
        },
        {
          title: 'Lifestyle & Entertainment',
          items: [
            { id: 'subscriptions', label: 'Subscriptions', explanation: 'Netflix, Spotify, Apps' },
            { id: 'hobbies', label: 'Hobbies', explanation: 'Supplies, gear, classes' },
            { id: 'travel_vacation', label: 'Travel/Vacation', explanation: 'Flights, lodging, transportation' },
            { id: 'gifts', label: 'Gifts', explanation: 'Holidays, birthdays, weddings' },
            { id: 'clothing', label: 'Clothing', explanation: 'Everyday clothes, shoes, outerwear' },
            { id: 'haircuts_salon', label: 'Haircuts/Salon', explanation: 'Barbershop visits, styling, hair coloring' },
            { id: 'personal_care', label: 'Personal Care/Grooming', explanation: 'Skincare, shaving products, toiletries' },
            { id: 'events', label: 'Sporting, Musical, or other Events', explanation: 'Tickets, souvenirs' },
            { id: 'lifestyle_miscellaneous', label: 'Miscellaneous', explanation: 'Other lifestyle expenses' },
          ]
        },
        {
          title: 'Charity',
          items: [
            { id: 'charity', label: 'Charity', explanation: 'Churches, nonprofits, fundraisers' },
          ]
        },
        {
          title: 'Other Miscellaneous Expenses',
          items: [
            { id: 'user_input_1', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_2', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_3', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_4', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_5', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_6', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_7', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_8', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_9', label: 'Enter your custom expense name', explanation: 'Additional description' },
            { id: 'user_input_10', label: 'Enter your custom expense name', explanation: 'Additional description' },
          ]
        }
      ]
    }
  ]
};

const styles = {
  // Main container
  container: { 
    fontSize: '14px',
    maxWidth: 1200, 
    margin: '0 auto', 
    padding: 24, 
    backgroundColor: '#fdfdfd',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  
  // Top "User Inputted Data" section
  header: { 
    fontSize: '14px', 
    fontWeight: '600',
    margin: '20px 0 10px 0', 
    color: '#333' 
  },
  topInput: { 
    border: '1px solid #ccc', 
    backgroundColor: '#fffde7', // Softer yellow
    padding: '6px 10px', 
    width: '200px', 
    borderRadius: '6px', // Rounded corners
    boxSizing: 'border-box'
  },
  selectInput: { border: '1px solid #ccc', backgroundColor: 'white', padding: '6px 10px', width: '200px', borderRadius: '6px', boxSizing: 'border-box' },
  afterTaxRow: { 
    backgroundColor: '#e8f5e9', // Softer green
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '8px 12px', 
    border: '1px solid #dcedc8', // Soft border
    width: '450px', 
    marginTop: '10px', 
    borderRadius: '6px', // Rounded corners
    fontWeight: '600',
    color: '#2e7d32'
  },

  // Main table
  table: { 
    width: '100%', 
    maxWidth: '1200px',
    borderCollapse: 'separate', // Needed for border-radius on cells
    borderSpacing: 0,
    marginTop: 20, 
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '12px', // Rounded corners for the table
    overflow: 'hidden', // Ensures inner elements conform to border-radius
    border: '1px solid #e0e0e0' // Soft gray border for the whole table
  },
  th: { 
    backgroundColor: '#002060',
    color: 'white', 
    padding: '12px', 
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center', 
    fontWeight: '600',
    fontSize: '14px',
  },
  thExpense: { width: '200px' },
  thBudgeted: { width: '180px' },
  thRecommended: { width: '240px' },
  thPercent: { width: '120px' },
  td: { 
    border: '1px solid #e0e0e0',
    padding: '10px 12px', 
    verticalAlign: 'middle',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  
  // Table row types
  sectionHeader: { 
    fontWeight: '600',
    backgroundColor: '#f5f5f5', // Reverted back to soft gray to match total rows
    color: '#002060', // Match nav link color for consistency
    fontSize: '14px'
  },
  totalRow: { 
    backgroundColor: '#f5f5f5', // Consistent soft gray
    fontWeight: '600',
    fontSize: '14px'
  },

  // Input fields within the table
  input: { 
    width: '100%', 
    border: '1px solid #ccc', 
    padding: '8px', 
    textAlign: 'right', 
    backgroundColor: '#fffde7', // Softer yellow
    borderRadius: '6px', // Rounded corners
    boxSizing: 'border-box'
  },
  readOnly: { 
    textAlign: 'right', 
    paddingRight: '12px',
    color: '#555'
  },
  deductionLabel: {
    width: '240px',
  },
  inputCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    marginLeft: '8px',
    color: '#555',
  },
  warningBox: {
    marginTop: '20px',
    padding: '12px',
    border: '1px solid #f5c6cb',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  floatingWarning: {
    position: 'fixed',
    left: '50%',
    bottom: '32px',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '16px 32px',
    fontWeight: 'bold',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    fontSize: '14px',
  },
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

const userInputFields = [
    { id: 'preTaxIncome', label: 'Annual Pre-Tax Income', value: '1000000' },
    { id: 'location', label: 'Location (State Abbreviation)', value: 'NY' },
    { id: 'residenceInNYC', label: 'Residence in New York City', value: 'No' },
    { id: 'housingCosts', label: 'Housing Costs', value: 'High' },
];

// Note: deductionChoiceFields removed as deductionChoices is not available in current context

export default function BudgetForm() {
    const { 
        topInputs, 
        setTopInputs, 
        financialCalculations,
        summaryCalculations,
        retirementInputs,
        setRetirementInputs,
        userPreTaxInputs,
        setUserPreTaxInputs,
        saveBudgetData,
        loadBudgetData
    } = useBudget();

    // Handler functions for save/load
    const handleSaveBudget = async () => {
        try {
            const result = await saveBudgetData(userInputs, customExpenseNames, expandedSections);
            if (result.success) {
                alert('Budget saved successfully! 💾');
            } else {
                alert('Error saving budget: ' + result.error);
            }
        } catch (error) {
            alert('Error saving budget: ' + error.message);
        }
    };

    const handleLoadBudget = async () => {
        try {
            const result = await loadBudgetData();
            if (result.success && result.data) {
                // Load top inputs
                if (result.data.top_inputs) {
                    setTopInputs(result.data.top_inputs);
                }
                // Load user inputs
                if (result.data.user_inputs) {
                    setUserInputs(result.data.user_inputs);
                }
                // Load custom expense names
                if (result.data.custom_expense_names) {
                    setCustomExpenseNames(result.data.custom_expense_names);
                }
                // Load section states
                if (result.data.section_states) {
                    setExpandedSections(result.data.section_states);
                }
                alert('Budget loaded successfully! 📁');
            } else {
                alert('No saved budget found or error loading: ' + (result.error || 'No data'));
            }
        } catch (error) {
            alert('Error loading budget: ' + error.message);
        }
    };

    const [userInputs, setUserInputs] = useState(
        budgetConfig.sections.flatMap(s => s.items).flatMap(subsection => subsection.items).reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
    );

    // Initialize userInputs with context values for pre-tax items
    React.useEffect(() => {
      setUserInputs(prev => {
        const updated = { ...prev };
        Object.keys(userPreTaxInputs).forEach(key => {
          if (userPreTaxInputs[key] !== undefined && userPreTaxInputs[key] !== '') {
            updated[key] = userPreTaxInputs[key];
          }
        });
        return updated;
      });
    }, [userPreTaxInputs]);
    
    // Note: showDeductionChoices removed as deductionChoices section is not available
    
    const afterTaxIncome = financialCalculations.afterTaxIncome;

    // Note: dynamicNoteText removed as deductionChoices is not available in current context

    const tableCalculations = useMemo(() => {
        const recommended = {};
        const entered = {};
        const sectionTotals = {};
        let grandTotalEntered = 0;

        budgetConfig.sections.forEach(section => {
          let sectionEnteredTotal = 0;
          let sectionRecommendedTotal = 0;
          
          section.items.forEach(subsection => {
            subsection.items.forEach(item => {
              if (item.id) {
                const recommendedValue = item.recommendedAmount || 0;
                recommended[item.id] = recommendedValue;
                sectionRecommendedTotal += recommendedValue;
                const enteredValue = parseFloat(userInputs[item.id]) || 0;
                entered[item.id] = enteredValue;
                sectionEnteredTotal += enteredValue;
              }
            });
          });
          
          sectionTotals[section.title] = {
            entered: sectionEnteredTotal,
            recommended: sectionRecommendedTotal
          };
          grandTotalEntered += sectionEnteredTotal;
        });

        return { recommended, entered, sectionTotals, grandTotalEntered };
    }, [userInputs, afterTaxIncome, topInputs.housingCosts]);

    // On mount, initialize local userInputs for retirement plans from context if available
    React.useEffect(() => {
      setUserInputs(prev => {
        const updated = { ...prev };
        Object.keys(retirementInputs).forEach(key => {
          if (retirementInputs[key] !== undefined && retirementInputs[key] !== '') {
            updated[key] = retirementInputs[key];
          }
        });
        return updated;
      });
    }, []);

    const handleUserInputChange = (id, value) => {
        // Only allow numbers and at most one decimal point
        const sanitized = value.replace(/[^0-9.]/g, '');
        // Prevent multiple decimals
        const parts = sanitized.split('.');
        let numericValue = parts[0];
        if (parts.length > 1) {
          numericValue += '.' + parts[1].slice(0, 2); // allow up to 2 decimals
        }
        
        // Data validation based on Excel constraints
        const numValue = parseFloat(numericValue);
        
        // Rule 1: Must be a number (if user entered something)
        if (numericValue && isNaN(numValue)) {
          alert('⚠️ Must be a number');
          return;
        }
        
        if (numericValue && !isNaN(numValue)) {
          // Excel validation rules: 1. Number, 2. >= 0, 3. <= Monthly Pre-Tax Income
          if (numValue < 0) {
            alert('⚠️ Must be >= 0');
            return;
          }
          if (numValue > monthlyPreTaxIncome) {
            alert(`⚠️ Must be <= Monthly Pre-Tax Income ($${formatCurrency(monthlyPreTaxIncome)})`);
            return;
          }
          
          // Validate retirement contribution limits
          if (id === 'traditional_401k' && numValue > 23500) {
            alert('Traditional 401(k) maximum contribution is $23,500 annually');
            return;
          }
          if (id === 'traditional_ira' && numValue > 7000) {
            alert('Traditional IRA maximum contribution is $7,000 annually');
            return;
          }
          if (id === 'roth_401k' && numValue > 23500) {
            alert('Roth 401(k) maximum contribution is $23,500 annually');
            return;
          }
          if (id === 'roth_ira' && numValue > 7000) {
            alert('Roth IRA maximum contribution is $7,000 annually');
            return;
          }
        }
        
        setUserInputs(prev => ({ ...prev, [id]: numericValue }));
        // If this is a retirement plan input, update context too
        if (id.startsWith('retirement_')) {
          setRetirementInputs(prev => ({ ...prev, [id]: numericValue }));
        }
        // If this is a pre-tax expense item, update context too
        if (['health_insurance', 'life_insurance', 'disability_insurance', 'traditional_401k', 'traditional_ira'].includes(id)) {
          setUserPreTaxInputs(prev => ({ ...prev, [id]: numericValue }));
        }
    };
    
    const handleTopInputChange = (id, value) => {
        // Data validation for top inputs
        if (id === 'preTaxIncome') {
          const numValue = parseFloat(value);
          if (value && !isNaN(numValue) && numValue <= 0) {
            alert('Pre-tax income must be a positive number');
            return;
          }
        }
        setTopInputs(prev => ({ ...prev, [id]: value }));
    };
    
    // Note: handleDeductionChange removed as deductionChoices is not available in current context

    const formatCurrency = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (num) => (num * 100).toFixed(2) + '%';
    
    // Format number for input display (with commas, no .00 if whole number)
    const formatNumberForInput = (num) => {
      if (!num || num === '') return '';
      const number = parseFloat(num);
      if (isNaN(number)) return num;
      
      // Check if it's a whole number
      if (number % 1 === 0) {
        return number.toLocaleString('en-US');
      } else {
        return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    };
    
    // Parse number from formatted input (remove commas)
    const parseNumberFromInput = (str) => {
      if (!str) return '';
      return str.replace(/,/g, '');
    };

    // Calculate monthly pre-tax income for formula calculations
    const monthlyPreTaxIncome = parseFloat(topInputs.preTaxIncome || 0) / 12;

    // Calculate monthly after-tax income for After-Tax Expense Items
    const monthlyAfterTaxIncome = summaryCalculations.suggestedAfterTaxIncome / 12;
    
    // Debug After-Tax Retirement Contributions calculations
    React.useEffect(() => {
      console.log('=== AFTER-TAX RETIREMENT CONTRIBUTIONS DEBUG ===', new Date().toISOString());
      console.log('preTaxIncome:', topInputs.preTaxIncome);
      console.log('suggestedAfterTaxIncome:', summaryCalculations.suggestedAfterTaxIncome);
      console.log('monthlyAfterTaxIncome:', monthlyAfterTaxIncome);
      
      // Test the calculation functions directly
      const testRoth401k = calculateRecommendedAmount({ id: 'roth_401k' });
      const testRothIRA = calculateRecommendedAmount({ id: 'roth_ira' });
      const testRoth401kPercent = calculateRecommendedPercent({ id: 'roth_401k' });
      const testRothIRAPercent = calculateRecommendedPercent({ id: 'roth_ira' });

      console.log('Direct function calls:');
      console.log('Roth 401k Amount:', testRoth401k);
      console.log('Roth IRA Amount:', testRothIRA);
      console.log('Roth 401k Percentage:', testRoth401kPercent);
      console.log('Roth IRA Percentage:', testRothIRAPercent);
    }, [topInputs.preTaxIncome, monthlyAfterTaxIncome, summaryCalculations.suggestedAfterTaxIncome]);

    // Helper function to calculate other percentages for Down Payment and Car calculations
    const calculateOtherPercentages = () => {
      // This calculates the total percentage used by other sections
      // Based on Excel formula: (1-(I50+I54+I82+I104+I122+I138+I150+I172+I198))
      // Where I50 = Retirement Contributions Total, I54 = Emergency Fund, etc.
      
      // Calculate actual percentages from our current calculations
      const retirementPercent = calculateRecommendedPercent({ id: 'roth_401k' }) + calculateRecommendedPercent({ id: 'roth_ira' });
      const emergencyFundPercent = calculateRecommendedPercent({ id: 'emergency_fund' });
      
      // Debt Payments - these are user input only, so their percentage is 0 for recommended
      const debtPaymentsPercent = 0; // I82 in Excel
      
      // Housing - calculate actual percentage based on housingCosts selection
      let housingTotalPercent = 0;
      if (topInputs.housingCosts === 'Low') housingTotalPercent = 0.30; // 30%
      else if (topInputs.housingCosts === 'Medium') housingTotalPercent = 0.35; // 35%
      else if (topInputs.housingCosts === 'High') housingTotalPercent = 0.40; // 40%
      
      const housingPercent = housingTotalPercent;
      
      // Transportation - calculate actual percentage
      const transportationPercent = calculateRecommendedPercent({ id: 'car_payment' }) + 
        calculateRecommendedPercent({ id: 'gasoline_fuel' }) + 
        calculateRecommendedPercent({ id: 'car_maintenance' }) + 
        calculateRecommendedPercent({ id: 'parking_fees' }) + 
        calculateRecommendedPercent({ id: 'rideshare' }) + 
        calculateRecommendedPercent({ id: 'public_transit' }) + 
        calculateRecommendedPercent({ id: 'transportation_miscellaneous' });
      
      // Insurance/Health - calculate actual percentage
      const insuranceHealthPercent = calculateRecommendedPercent({ id: 'auto_insurance' }) + 
        calculateRecommendedPercent({ id: 'renters_insurance' }) + 
        calculateRecommendedPercent({ id: 'otc_medications' }) + 
        calculateRecommendedPercent({ id: 'mental_health' }) + 
        calculateRecommendedPercent({ id: 'physical_health' }) + 
        calculateRecommendedPercent({ id: 'insurance_miscellaneous' });
      
      // Food - calculate actual percentage
      const foodPercent = calculateRecommendedPercent({ id: 'groceries' }) + 
        calculateRecommendedPercent({ id: 'dining_out' }) + 
        calculateRecommendedPercent({ id: 'takeout' }) + 
        calculateRecommendedPercent({ id: 'food_miscellaneous' });
      
      // Lifestyle & Entertainment - calculate actual percentage
      const lifestyleEntertainmentPercent = calculateRecommendedPercent({ id: 'subscriptions' }) + 
        calculateRecommendedPercent({ id: 'hobbies' }) + 
        calculateRecommendedPercent({ id: 'travel_vacation' }) + 
        calculateRecommendedPercent({ id: 'gifts' }) + 
        calculateRecommendedPercent({ id: 'clothing' }) + 
        calculateRecommendedPercent({ id: 'haircuts_salon' }) + 
        calculateRecommendedPercent({ id: 'personal_care' }) + 
        calculateRecommendedPercent({ id: 'events' }) + 
        calculateRecommendedPercent({ id: 'lifestyle_miscellaneous' });
      
      // Charity - calculate actual percentage
      const charityPercent = calculateRecommendedPercent({ id: 'charity' });
      
      return retirementPercent + emergencyFundPercent + debtPaymentsPercent + housingPercent + transportationPercent + insuranceHealthPercent + foodPercent + lifestyleEntertainmentPercent + charityPercent;
    };

    // Helper function to calculate Down Payment percentage
    const calculateDownPaymentPercent = () => {
      const otherPercentages = calculateOtherPercentages();
      const remainingPercentage = Math.max(0, 1 - otherPercentages);
      return remainingPercentage * 0.7; // 70% of remaining
    };

    // Helper function to calculate Car percentage
    const calculateCarPercent = () => {
      const otherPercentages = calculateOtherPercentages();
      const remainingPercentage = Math.max(0, 1 - otherPercentages);
      return remainingPercentage * 0.3; // 30% of remaining
    };

    // Function to calculate recommended amount based on Excel formulas
    const calculateRecommendedAmount = (item) => {
      // For After-Tax items, use monthly after-tax income as the base
      if (['roth_401k', 'roth_ira', 'rent', 'electricity', 'gas', 'water', 'sewer_trash', 'phone', 'internet', 'housing_miscellaneous', 'car_payment', 'gasoline_fuel', 'car_maintenance', 'parking_fees', 'rideshare', 'public_transit', 'transportation_miscellaneous', 'auto_insurance', 'renters_insurance', 'otc_medications', 'mental_health', 'physical_health', 'insurance_miscellaneous', 'groceries', 'dining_out', 'takeout', 'food_miscellaneous', 'subscriptions', 'hobbies', 'travel_vacation', 'gifts', 'clothing', 'haircuts_salon', 'personal_care', 'events', 'lifestyle_miscellaneous', 'student_loans', 'credit_card_payments', 'personal_loans', 'miscellaneous_debt', 'charity', 'user_input_1', 'user_input_2', 'user_input_3', 'user_input_4', 'user_input_5', 'user_input_6', 'user_input_7', 'user_input_8', 'user_input_9', 'user_input_10', 'emergency_fund', 'down_payment', 'car', 'wedding', 'advanced_degree', 'vacation', 'miscellaneous'].includes(item.id)) {
        if (monthlyAfterTaxIncome <= 0) return 0;
        
        if (item.id === 'roth_401k') {
          // Excel: =MIN('Week 1 - Budgeting'!$G$40*(1/20),1958.33)
          // This is 5% of monthly after-tax income, capped at $1,958.33 (monthly max for $23,500 annual)
          return Math.min(monthlyAfterTaxIncome * 0.05, 1958.33);
        }
        if (item.id === 'roth_ira') {
          // Excel: =IF(G46=1958.33,MIN('Week 1 - Budgeting'!$G$40*(0.05-I46),583.33),0)
          // Only contribute to Roth IRA if Roth 401k is at its maximum
          const roth401kAmount = Math.min(monthlyAfterTaxIncome * 0.05, 1958.33);
          if (roth401kAmount === 1958.33) {
            // Calculate Roth 401k percentage first
            const roth401kPercent = roth401kAmount / monthlyAfterTaxIncome;
            // Then calculate Roth IRA: 5% total - Roth 401k percentage, capped at $583.33
            return Math.min(monthlyAfterTaxIncome * (0.05 - roth401kPercent), 583.33);
          }
          return 0;
        }
        // Housing - Excel formulas
        if (['rent', 'electricity', 'gas', 'water', 'sewer_trash', 'phone', 'internet', 'housing_miscellaneous'].includes(item.id)) {
          if (item.id === 'rent') {
            // Excel: =I86*'Week 1 - Budgeting'!G40
            // The total housing percentage is dynamic based on housingCosts selection
            let housingTotalPercent = 0;
            if (topInputs.housingCosts === 'Low') housingTotalPercent = 0.30; // 30%
            else if (topInputs.housingCosts === 'Medium') housingTotalPercent = 0.35; // 35%
            else if (topInputs.housingCosts === 'High') housingTotalPercent = 0.40; // 40%
            
            // Calculate total fixed utilities cost
            const utilitiesTotal = 125 + 25 + 60 + 25 + 120 + 65 + 0; // electricity + gas + water + sewer/trash + phone + internet + miscellaneous
            const utilitiesPercent = utilitiesTotal / monthlyAfterTaxIncome;
            
            // Rent should be the remaining percentage after utilities
            const rentPercent = Math.max(0, housingTotalPercent - utilitiesPercent);
            return monthlyAfterTaxIncome * rentPercent;
          }
          if (item.id === 'electricity') return 125; // Fixed value from Excel
          if (item.id === 'gas') return 25; // Fixed value from Excel
          if (item.id === 'water') return 60; // Fixed value from Excel
          if (item.id === 'sewer_trash') return 25; // Fixed value from Excel
          if (item.id === 'phone') return 120; // Fixed value from Excel
          if (item.id === 'internet') return 65; // Fixed value from Excel
          if (item.id === 'housing_miscellaneous') return 0; // Fixed value from Excel
        }
        
        // Transportation - Excel formulas
        if (['car_payment', 'gasoline_fuel', 'car_maintenance', 'parking_fees', 'rideshare', 'public_transit', 'transportation_miscellaneous'].includes(item.id)) {
          if (item.id === 'car_payment') return 250; // Fixed value from Excel
          if (item.id === 'gasoline_fuel') return 80; // Fixed value from Excel
          if (item.id === 'car_maintenance') return 120; // Fixed value from Excel
          if (item.id === 'parking_fees') return 120; // Fixed value from Excel
          if (item.id === 'rideshare') return 60; // Fixed value from Excel
          if (item.id === 'public_transit') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.0025,50)
            return Math.min(monthlyAfterTaxIncome * 0.0025, 50);
          }
          if (item.id === 'transportation_miscellaneous') return 0; // Fixed value from Excel
        }
        
        // Insurance/Health - Excel formulas (fixed values)
        if (['auto_insurance', 'renters_insurance', 'otc_medications', 'mental_health', 'physical_health', 'insurance_miscellaneous'].includes(item.id)) {
          if (item.id === 'auto_insurance') return 125;
          if (item.id === 'renters_insurance') return 50;
          if (item.id === 'otc_medications') return 25;
          if (item.id === 'mental_health') return 65;
          if (item.id === 'physical_health') return 120;
          if (item.id === 'insurance_miscellaneous') return 0;
        }
        
        // Food - Excel formulas with MIN functions
        if (['groceries', 'dining_out', 'takeout', 'food_miscellaneous'].includes(item.id)) {
          if (item.id === 'groceries') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.07,1250)
            return Math.min(monthlyAfterTaxIncome * 0.07, 1250);
          }
          if (item.id === 'dining_out') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.03,1500)
            return Math.min(monthlyAfterTaxIncome * 0.03, 1500);
          }
          if (item.id === 'takeout') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.0125,500)
            return Math.min(monthlyAfterTaxIncome * 0.0125, 500);
          }
          if (item.id === 'food_miscellaneous') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.005,100)
            return Math.min(monthlyAfterTaxIncome * 0.005, 100);
          }
        }
        
        // Lifestyle & Entertainment - Excel formulas
        if (['subscriptions', 'hobbies', 'travel_vacation', 'gifts', 'clothing', 'haircuts_salon', 'personal_care', 'events', 'lifestyle_miscellaneous'].includes(item.id)) {
          if (item.id === 'subscriptions') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.01,200)
            return Math.min(monthlyAfterTaxIncome * 0.01, 200);
          }
          if (item.id === 'hobbies') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.01,1000)
            return Math.min(monthlyAfterTaxIncome * 0.01, 1000);
          }
          if (item.id === 'travel_vacation') {
            // Excel: ='Week 1 - Budgeting'!$G$40*0.025
            return monthlyAfterTaxIncome * 0.025;
          }
          if (item.id === 'gifts') {
            // Excel: ='Week 1 - Budgeting'!$G$40*0.01
            return monthlyAfterTaxIncome * 0.01;
          }
          if (item.id === 'clothing') {
            // Excel: ='Week 1 - Budgeting'!$G$40*0.01
            return monthlyAfterTaxIncome * 0.01;
          }
          if (item.id === 'haircuts_salon') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.005,500)
            return Math.min(monthlyAfterTaxIncome * 0.005, 500);
          }
          if (item.id === 'personal_care') {
            // Excel: ='Week 1 - Budgeting'!$G$40*0.01
            return monthlyAfterTaxIncome * 0.01;
          }
          if (item.id === 'events') {
            // Excel: ='Week 1 - Budgeting'!$G$40*0.01
            return monthlyAfterTaxIncome * 0.01;
          }
          if (item.id === 'lifestyle_miscellaneous') {
            // Excel: =MIN('Week 1 - Budgeting'!$G$40*0.05,100)
            return Math.min(monthlyAfterTaxIncome * 0.05, 100);
          }
        }
        
        // Debt Payments - these are user input only, no recommended amounts
      if (['student_loans', 'credit_card_payments', 'personal_loans', 'miscellaneous_debt'].includes(item.id)) {
          return 0; // No recommended amounts for debt payments
        }
        
        // Charity - Excel formula
        if (['charity'].includes(item.id)) {
          // Excel: ='Week 1 - Budgeting'!$G$40*0.01
          return monthlyAfterTaxIncome * 0.01;
        }
        
        // User Input items - these are user input only, no recommended amounts
        if (['user_input_1', 'user_input_2', 'user_input_3', 'user_input_4', 'user_input_5', 'user_input_6', 'user_input_7', 'user_input_8', 'user_input_9', 'user_input_10'].includes(item.id)) {
          return 0; // No recommended amounts for user input items
        }
        
        if (item.id === 'emergency_fund') {
          // Excel: ='Week 1 - Budgeting'!$G$40*0.02
          // 2% of monthly after-tax income
          return monthlyAfterTaxIncome * 0.02;
        }
        if (item.id === 'down_payment') {
          // Excel: =I58*'Week 1 - Budgeting'!$G$40
          // Where I58 = (1-(I50+I54+I82+I104+I122+I138+I150+I172+I198))*0.7
          const downPaymentPercent = calculateDownPaymentPercent();
          return monthlyAfterTaxIncome * downPaymentPercent;
        }
        if (item.id === 'car') {
          // Excel: =I60*'Week 1 - Budgeting'!$G$40
          // Where I60 = (1-(I50+I54+I82+I104+I122+I138+I150+I172+I198))*0.3
          const carPercent = calculateCarPercent();
          return monthlyAfterTaxIncome * carPercent;
        }
        // Wedding, Advanced Degree, Vacation, Miscellaneous are 0 in Excel
        if (['wedding', 'advanced_degree', 'vacation', 'miscellaneous'].includes(item.id)) {
          return 0;
        }
        return 0;
      }
      
      // For Pre-Tax items, use monthly pre-tax income as the base
      if (monthlyPreTaxIncome <= 0) return 0;
      
      // Pre-Tax Insurance section - use static values from Excel
      if (['health_insurance', 'life_insurance', 'disability_insurance'].includes(item.id)) {
        // Health Insurance: $150/month (1.8% of $8,333.33)
        if (item.id === 'health_insurance') {
          return 150.00;
        }
        // Life and Disability Insurance: $0 (not recommended)
        return 0;
      }
      
      // Pre-Tax Retirement section - use static values from Excel
      if (['traditional_401k', 'traditional_ira'].includes(item.id)) {
        return 0; // Not recommended in Pre-Tax section
      }
      
      // For other items, use static recommended amount if available
      return item.recommendedAmount || 0;
    };

    // Function to calculate recommended percentage based on Excel formulas
    const calculateRecommendedPercent = (item) => {
      // For After-Tax items, use monthly after-tax income as the base (Excel: =G46/'Week 1 - Budgeting'!$G$40)
      if (['roth_401k', 'roth_ira', 'rent', 'electricity', 'gas', 'water', 'sewer_trash', 'phone', 'internet', 'housing_miscellaneous', 'car_payment', 'gasoline_fuel', 'car_maintenance', 'parking_fees', 'rideshare', 'public_transit', 'transportation_miscellaneous', 'auto_insurance', 'renters_insurance', 'otc_medications', 'mental_health', 'physical_health', 'insurance_miscellaneous', 'groceries', 'dining_out', 'takeout', 'food_miscellaneous', 'subscriptions', 'hobbies', 'travel_vacation', 'gifts', 'clothing', 'haircuts_salon', 'personal_care', 'events', 'lifestyle_miscellaneous', 'student_loans', 'credit_card_payments', 'personal_loans', 'miscellaneous_debt', 'charity', 'user_input_1', 'user_input_2', 'user_input_3', 'user_input_4', 'user_input_5', 'user_input_6', 'user_input_7', 'user_input_8', 'user_input_9', 'user_input_10', 'emergency_fund', 'down_payment', 'car', 'wedding', 'advanced_degree', 'vacation', 'miscellaneous'].includes(item.id)) {
        if (monthlyAfterTaxIncome > 0) {
          // For Down Payment and Car, use the helper functions to get the exact percentage
          if (item.id === 'down_payment') {
            return calculateDownPaymentPercent();
          }
          if (item.id === 'car') {
            return calculateCarPercent();
          }
          // For other items, calculate from amount
      const recommendedAmount = calculateRecommendedAmount(item);
          return recommendedAmount / monthlyAfterTaxIncome;
        }
        return 0;
      }
      
      // For Pre-Tax items, use monthly pre-tax income as the base
      if (monthlyPreTaxIncome > 0) {
      const recommendedAmount = calculateRecommendedAmount(item);
        return recommendedAmount / monthlyPreTaxIncome;
      }
      return 0;
    };

    // 1. Section expanded state
    const initialExpanded = Object.fromEntries(budgetConfig.sections.map(s => [s.title, true]));
    const [expandedSections, setExpandedSections] = useState(initialExpanded);
    const toggleSection = (title) => setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));

    // 1.5. Subsection expanded state
    const initialSubsectionExpanded = {};
    budgetConfig.sections.forEach(section => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach(subsection => {
          if (subsection.title) {
            initialSubsectionExpanded[subsection.title] = true;
          }
        });
      }
    });
    const [expandedSubsections, setExpandedSubsections] = useState(initialSubsectionExpanded);
    const toggleSubsection = (title) => setExpandedSubsections(prev => ({ ...prev, [title]: !prev[title] }));

  // 2. Custom expense names state for Other Miscellaneous Expenses
  const [customExpenseNames, setCustomExpenseNames] = useState({
    user_input_1: '',
    user_input_1_label: '',
    user_input_2: '',
    user_input_2_label: '',
    user_input_3: '',
    user_input_3_label: '',
    user_input_4: '',
    user_input_4_label: '',
    user_input_5: '',
    user_input_5_label: '',
    user_input_6: '',
    user_input_6_label: '',
    user_input_7: '',
    user_input_7_label: '',
    user_input_8: '',
    user_input_8_label: '',
    user_input_9: '',
    user_input_9_label: '',
    user_input_10: '',
    user_input_10_label: '',
  });

  const handleExpenseNameChange = (itemId, newName) => {
    setCustomExpenseNames(prev => ({
      ...prev,
      [itemId]: newName
    }));
  };


    // Debug function to show all calculated values
    const debugCalculations = () => {
        const preTaxIncome = parseFloat(topInputs.preTaxIncome || 0);
        const monthlyPreTaxIncome = preTaxIncome / 12;
        const standardDeduction = 15000;
        
        // Pre-Tax Expenses
        const suggestedPreTaxExpenses = 150 * 12; // $1,800
        const userPreTaxExpenses = (
            (parseFloat(userPreTaxInputs.health_insurance) || 0) +
            (parseFloat(userPreTaxInputs.life_insurance) || 0) +
            (parseFloat(userPreTaxInputs.disability_insurance) || 0) +
            (parseFloat(userPreTaxInputs.traditional_401k) || 0) +
            (parseFloat(userPreTaxInputs.traditional_ira) || 0)
        ) * 12;
        
        // Taxable Income
        const suggestedTaxableIncome = preTaxIncome - standardDeduction - suggestedPreTaxExpenses;
        const userTaxableIncome = preTaxIncome - standardDeduction - userPreTaxExpenses;
        
        console.log('=== DEBUG CALCULATIONS FOR $1,000,000 ===');
        console.log('Pre-Tax Income:', preTaxIncome);
        console.log('Monthly Pre-Tax Income:', monthlyPreTaxIncome);
        console.log('Standard Deduction:', standardDeduction);
        console.log('Suggested Pre-Tax Expenses:', suggestedPreTaxExpenses);
        console.log('User Pre-Tax Expenses:', userPreTaxExpenses);
        console.log('Suggested Taxable Income:', suggestedTaxableIncome);
        console.log('User Taxable Income:', userTaxableIncome);
        console.log('Summary Calculations:', summaryCalculations);
        console.log('==========================================');
    };

    // Function to calculate total expenses (sum of all Budgeted Spend values - user inputs)
    const calculateTotalExpenses = () => {
      // Sum all user inputs from Budgeted Spend column
      let total = 0;
      
      // Sum all user input values
      Object.values(userInputs).forEach(value => {
        const numValue = parseFloat(value) || 0;
        total += numValue;
      });
      
      return total;
    };

    // Function to calculate budget checker (E40 - E200)
    const calculateBudgetChecker = () => {
      const monthlyIncome = summaryCalculations.userAfterTaxIncome / 12; // E40 - User's monthly after-tax income
      const totalExpenses = calculateTotalExpenses(); // E200 (sum of all Budgeted Spend values)
      const difference = monthlyIncome - totalExpenses;
      
      if (difference > 0) {
        return `Under Budget by $${formatCurrency(difference)}`;
      } else if (difference < 0) {
        return `Over Budget by $${formatCurrency(Math.abs(difference))}`;
      } else {
        return `Exactly on Budget`;
      }
    };

    // Call debug function when component mounts or inputs change
    React.useEffect(() => {
        if (topInputs.preTaxIncome === '1000000') {
            debugCalculations();
        }
        // Debug userInputs to see what's in there
        console.log('userInputs state:', userInputs);
        Object.entries(userInputs).forEach(([key, value]) => {
          if (value && value !== '') {
            console.log(`userInputs[${key}] = "${value}"`);
          }
        });
    }, [topInputs.preTaxIncome, userPreTaxInputs, summaryCalculations, userInputs]);

    return (
        <div style={styles.container}>
        
        <div style={{width: '1200px', maxWidth: '1200px'}}>
            <div style={{width: '450px', marginBottom: '20px'}}>
            <h3 style={styles.header}>User Inputted Data</h3>
            <div style={{fontSize: '12px', color: '#666', marginBottom: '10px', fontStyle: 'italic'}}>
                Taxes calculated based on single taxpayer filing status
            </div>
            {userInputFields.map(field => (
            <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', alignItems: 'center' }}>
                <label>{field.label}</label>
                {field.id === 'location' ? (
                  <select
                    style={styles.topInput}
                    value={topInputs[field.id]}
                    onChange={e => handleTopInputChange(field.id, e.target.value)}
                  >
                    {Array.from(new Set(stateTaxData.map(row => row.state))).map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                ) : field.id === 'residenceInNYC' ? (
                  <select
                    style={styles.topInput}
                    value={topInputs[field.id]}
                    onChange={e => handleTopInputChange(field.id, e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : field.id === 'housingCosts' ? (
                  <select
                    style={styles.topInput}
                    value={topInputs[field.id]}
                    onChange={e => handleTopInputChange(field.id, e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <input
                    style={styles.topInput}
                    type="text"
                    value={field.id === 'preTaxIncome' ? formatNumberForInput(topInputs[field.id]) : topInputs[field.id]}
                    onChange={e => handleTopInputChange(field.id, field.id === 'preTaxIncome' ? parseNumberFromInput(e.target.value) : e.target.value)}
                  />
                )}
            </div>
            ))}
            
            {/* Monthly Pre-Tax Income - Row 14 equivalent */}
            <div style={{...styles.afterTaxRow, flexGrow: 1, marginTop: '10px', backgroundColor: '#e8f5e9'}}>
              <span>Monthly Pre-Tax Income</span>
              <span>${formatCurrency(parseFloat(topInputs.preTaxIncome || 0) / 12)}</span>
            </div>
            
            {/* Note: Standard Deduction Choices section removed as deductionChoices is not available in current context */}
        </div>
        
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={{...styles.th, ...styles.thExpense}}>Expense Items</th>
                <th style={{...styles.th, ...styles.thBudgeted}}>Examples/Info</th>
                <th style={{...styles.th, ...styles.thRecommended}}>Budgeted Spend</th>
                <th style={{...styles.th, ...styles.thPercent}}>Recommended Spend $</th>
                <th style={{...styles.th, ...styles.thPercent}}>% of Monthly Income</th>
            </tr>
            </thead>
            <tbody>
              {budgetConfig.sections.map((section, sectionIndex) => {
                return (
                <React.Fragment key={section.title}>
                  <tr>
                    <td style={{...styles.td, ...styles.sectionHeader, fontWeight: 'bold', cursor: 'pointer'}} colSpan="5"
                        onClick={() => toggleSection(section.title)}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>{section.title}</span>
                        <span>
                          <span style={{marginLeft: 12, fontWeight: 'bold', fontSize: 18}}>
                            {expandedSections[section.title] ? '▼' : '►'}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedSections[section.title] && (
                    <>
                      {section.items.map((subsection, subIndex) => (
                        <React.Fragment key={subsection.title}>
                          <tr>
                            <td style={{...styles.td, ...styles.sectionHeader, fontWeight: 'bold', paddingLeft: '20px', cursor: 'pointer'}} colSpan="5" onClick={() => toggleSubsection(subsection.title)}>
                              {expandedSubsections[subsection.title] ? '▼' : '▶'} {subsection.title}
                            </td>
                          </tr>
                          {expandedSubsections[subsection.title] && subsection.items.map((item, index) => {
                            if (item.type === 'subheader') {
                              return (
                                <tr key={`${item.label}-${index}`}>
                                  <td style={{...styles.td, fontWeight: 'bold', paddingLeft: '40px'}}>{item.label}</td>
                                  <td style={styles.td}></td>
                                  <td style={styles.td}></td>
                                  <td style={styles.td}></td>
                                  <td style={styles.td}></td>
                                </tr>
                              )
                            }
                            return (
                              <tr key={item.id}>
                                <td style={{...styles.td, paddingLeft: '60px', textAlign: 'left'}}>
                                  {item.id.startsWith('user_input_') ? (
                                    <input
                                      style={{
                                        ...styles.input,
                                        width: '100%',
                                        minWidth: '150px',
                                        fontSize: '14px',
                                        padding: '4px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        textAlign: 'left'
                                      }}
                                      type="text"
                                      value={customExpenseNames[item.id] || ''}
                                      onChange={(e) => handleExpenseNameChange(item.id, e.target.value)}
                                      placeholder="Enter expense name"
                                    />
                                  ) : (
                                    item.label
                                  )}
                                </td>
                                <td style={{...styles.td, textAlign: 'left'}}>
                                  {item.id.startsWith('user_input_') ? (
                                    <input
                                      style={{
                                        ...styles.input,
                                        width: '100%',
                                        minWidth: '150px',
                                        fontSize: '14px',
                                        padding: '4px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        textAlign: 'left',
                                        color: '#666',
                                        backgroundColor: '#fffde7'
                                      }}
                                      type="text"
                                      value={customExpenseNames[item.id + '_label'] || ''}
                                      onChange={(e) => handleExpenseNameChange(item.id + '_label', e.target.value)}
                                      placeholder="Additional description"
                                    />
                                  ) : (
                                    item.explanation
                                  )}
                                </td>
                                <td style={styles.td}>
                                  <div style={styles.inputCellContainer}>
                                    <input
                                      style={styles.input}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={userInputs[item.id] || ''}
                                      onChange={(e) => handleUserInputChange(item.id, e.target.value)}
                                    />
                                    <span style={styles.currencySymbol}>$</span>
                                  </div>
                                </td>
                                <td style={{...styles.td, ...styles.readOnly}}>
                                  {(() => {
                                    const calculatedAmount = calculateRecommendedAmount(item);
                                    return calculatedAmount > 0 ? formatCurrency(calculatedAmount) : '-';
                                  })()}
                                </td>
                                <td style={{...styles.td, ...styles.readOnly}}>
                                  {(() => {
                                    const calculatedPercent = calculateRecommendedPercent(item);
                                    return calculatedPercent > 0 ? formatPercent(calculatedPercent) : '-';
                                  })()}
                                </td>
                              </tr>
                            )
                          })}
                          {subsection.note && (
                            <tr>
                              <td style={{...styles.td, fontStyle: 'italic', paddingLeft: '40px'}} colSpan="5">
                                {subsection.note}
                              </td>
                            </tr>
                          )}
                          {/* Subsection Total Row */}
                          {expandedSubsections[subsection.title] && (
                          <tr style={styles.totalRow}>
                            <td style={{...styles.td, fontWeight: 'bold', paddingLeft: '40px'}}>Total</td>
                            <td style={styles.td}></td>
                            <td style={styles.td}>
                              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span>$</span>
                                <span>
                                  {subsection.items
                                    .filter(item => item.id)
                                    .reduce((sum, item) => sum + (parseFloat(userInputs[item.id]) || 0), 0) > 0 
                                    ? formatCurrency(subsection.items
                                        .filter(item => item.id)
                                        .reduce((sum, item) => sum + (parseFloat(userInputs[item.id]) || 0), 0)) 
                                    : '-'}
                                </span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span>$</span>
                                <span>
                                  {(() => {
                                    const totalRecommended = subsection.items
                                      .filter(item => item.id)
                                      .reduce((sum, item) => sum + calculateRecommendedAmount(item), 0);
                                    return totalRecommended > 0 ? formatCurrency(totalRecommended) : '-';
                                  })()}
                                </span>
                              </div>
                            </td>
                            <td style={{...styles.td, ...styles.readOnly}}>
                              {(() => {
                                const totalPercent = subsection.items
                                  .filter(item => item.id)
                                  .reduce((sum, item) => sum + calculateRecommendedPercent(item), 0);
                                return totalPercent > 0 ? formatPercent(totalPercent) : '-';
                              })()}
                            </td>
                          </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  
                  {/* Monthly Income (After Taxes & Pre-Tax Expense Items) - Row 40 equivalent */}
                  {section.title === 'Pre-Tax Expense Items' && (
                    <>
                      <tr style={{height: '20px'}}>
                        <td colSpan="5" style={{border: 'none'}}></td>
                      </tr>
                      <tr style={{backgroundColor: '#e8f5e9'}}>
                        <td style={{...styles.td, fontWeight: 'bold', backgroundColor: '#e8f5e9'}}>
                          Monthly Income (After Taxes & Pre-Tax Expense Items)
                        </td>
                        <td style={{...styles.td, backgroundColor: '#e8f5e9'}}></td>
                        <td style={{...styles.td, backgroundColor: '#e8f5e9'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>$</span>
                            <span>{formatCurrency(summaryCalculations.userAfterTaxIncome / 12)}</span>
                          </div>
                        </td>
                        <td style={{...styles.td, backgroundColor: '#e8f5e9'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>$</span>
                            <span>{formatCurrency(summaryCalculations.suggestedAfterTaxIncome / 12)}</span>
                          </div>
                        </td>
                        <td style={{...styles.td, backgroundColor: '#e8f5e9'}}></td>
                      </tr>
                    </>
                  )}
                  
                  {/* Spacer row for visual separation between sections */}
                  {sectionIndex < budgetConfig.sections.length - 1 && (
                    <tr style={{height: '20px'}}>
                        <td colSpan="5" style={{border: 'none'}}></td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
            </tbody>
        </table>
        </div>
        
        {/* Total Expenses Section */}
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '1px solid #a7f3d0'
          }}>
            <span>Total Expenses</span>
            <span>${formatCurrency(calculateTotalExpenses())}</span>
          </div>
        </div>
        
        {/* User Budget Checker Section */}
        <div style={{marginTop: '10px', display: 'flex', justifyContent: 'center'}}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span style={{color: '#374151'}}>User Budget Checker</span>
            <div style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              padding: '6px 12px',
              borderRadius: '4px',
              color: '#374151',
              fontWeight: 'bold',
              fontSize: '14px',
              minWidth: '300px',
              textAlign: 'center',
              marginLeft: '20px'
            }}>
              {calculateBudgetChecker()}
            </div>
          </div>
        </div>
        
        {/* Info Message */}
        <div style={{
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#374151',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            💡 <strong>Tip:</strong> Save your budget to keep your data. Next time you login, click "Load Budget" to restore your inputs.
          </div>
        </div>

        {/* Save/Load Buttons */}
        <div style={{marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px'}}>
          <button
            onClick={handleSaveBudget}
            style={{
              backgroundColor: '#002060',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💾 Save Budget
          </button>
          <button
            onClick={handleLoadBudget}
            style={{
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📁 Load Budget
          </button>
        </div>
        
        </div>
    );
} 