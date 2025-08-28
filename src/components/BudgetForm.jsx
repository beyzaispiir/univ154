import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import stateTaxData from '../data/stateTaxData';

// This data structure now includes all necessary info for rendering the exact layout
const budgetConfig = {
  title: "Week 1 - Budgeting",
  tableHeaders: [
    "Expense Item", 
    "Budgeted Amount Spent (Manually Enter)", 
    "Reccomended Amount Spent", 
    "Reccomended %"
  ],
  sections: [
    {
      title: 'Housing',
      totalPercent: '40.00%',
      items: [
        { id: 'rent', label: 'Rent', recommendedPercent: 0.36 },
        { type: 'subheader', label: 'Utilities (Electricity, Water)' },
        { id: 'electricity', label: 'Electricity', recommendedPercent: 0.0060 },
        { id: 'gas', label: 'Gas', recommendedPercent: 0.0040 },
        { id: 'water', label: 'Water', recommendedPercent: 0.0060 },
        { id: 'sewerTrash', label: 'Sewer/Trash', recommendedPercent: 0.0040 },
        { id: 'phone', label: 'Phone (Cell/Landline)', recommendedPercent: 0.0080 },
        { id: 'internet', label: 'Internet', recommendedPercent: 0.0080 },
        { id: 'miscellaneous_utilities', label: 'Miscellaneous', recommendedPercent: 0.0040 },
      ]
    },
    {
      title: 'Food',
      items: [
        { id: 'food_groceries', label: 'Groceries', recommendedPercent: (housingCostPercent) => housingCostPercent * 0.6 },
        { id: 'food_dining_out', label: 'Dining Out', recommendedPercent: (housingCostPercent) => housingCostPercent * 0.25 },
        { id: 'food_takeout', label: 'Takeout/Delivery', recommendedPercent: (housingCostPercent) => housingCostPercent * 0.1 },
        { id: 'food_miscellaneous', label: 'Miscellaneous', recommendedPercent: (housingCostPercent) => housingCostPercent * 0.05 },
      ]
    },
    {
      title: 'Transportation',
      items: [
        { id: 'transport_car_payment', label: 'Car Payment', recommendedPercent: (transportPercent) => transportPercent * 0.5 },
        { id: 'transport_gas', label: 'Gasoline/Fuel', recommendedPercent: (transportPercent) => transportPercent * 0.2 },
        { id: 'transport_maintenance', label: 'Car Maintenance (Oil, Tires)', recommendedPercent: (transportPercent) => transportPercent * 0.1 },
        { id: 'transport_rideshare', label: 'Rideshare (Uber/Lyft)', recommendedPercent: (transportPercent) => transportPercent * 0.1 },
        { id: 'transport_transit', label: 'Public Transit Passes', recommendedPercent: (transportPercent) => transportPercent * 0.025 },
        { id: 'transport_registration', label: 'Car Registration', recommendedPercent: (transportPercent) => transportPercent * 0.025 },
        { id: 'transport_parking', label: 'Parking Fees', recommendedPercent: (transportPercent) => transportPercent * 0.025 },
        { id: 'transport_miscellaneous', label: 'Miscellaneous', recommendedPercent: (transportPercent) => transportPercent * 0.025 },
      ]
    },
    {
      title: 'Insurance/Health',
      items: [
        { id: 'health_insurance', label: 'Health Insurance', recommendedPercent: (insurancePercent) => insurancePercent * 0.35 },
        { id: 'life_insurance', label: 'Life Insurance', recommendedPercent: (insurancePercent) => insurancePercent * 0.05 },
        { id: 'auto_insurance', label: 'Auto Insurance', recommendedPercent: (insurancePercent) => insurancePercent * 0.15 },
        { id: 'home_insurance', label: 'Home Insurance', recommendedPercent: (insurancePercent) => insurancePercent * 0.05 },
        { id: 'disability_insurance', label: 'Disability Insurance', recommendedPercent: (insurancePercent) => insurancePercent * 0.05 },
        { id: 'otc_meds', label: 'Over-the-Counter Medications', recommendedPercent: (insurancePercent) => insurancePercent * 0.05 },
        { id: 'therapy', label: 'Therapy or Mental Health', recommendedPercent: (insurancePercent) => insurancePercent * 0.1 },
        { id: 'gym', label: 'Gym Membership', recommendedPercent: (insurancePercent) => insurancePercent * 0.1 },
        { id: 'health_miscellaneous', label: 'Miscellaneous', recommendedPercent: (insurancePercent) => insurancePercent * 0.1 },
      ]
    },
    {
      title: 'Unsecured Debt Payments',
      items: [
        { id: 'debt_student_loans', label: 'Student Loans', recommendedPercent: (debtPercent) => debtPercent * 0.4 },
        { id: 'debt_credit_cards', label: 'Credit Card Payments', recommendedPercent: (debtPercent) => debtPercent * 0.3 },
        { id: 'debt_personal_loans', label: 'Personal Loans', recommendedPercent: (debtPercent) => debtPercent * 0.2 },
        { id: 'debt_miscellaneous', label: 'Miscellaneous', recommendedPercent: (debtPercent) => debtPercent * 0.1 },
      ]
    },
    {
      title: 'Savings & Investments',
      items: [
        { id: 'savings_emergency_medical', label: 'Emergency Fund - Medical', recommendedPercent: (savingsPercent) => savingsPercent * 0.2 * 4/3 * 0.2 },
        { id: 'savings_emergency_job_loss', label: 'Emergency Fund - Job Loss', recommendedPercent: (savingsPercent) => savingsPercent * 0.2 * 4/3 * 0.2 },
        { id: 'savings_emergency_home_repair', label: 'Emergency Fund - Home Repair', recommendedPercent: (savingsPercent) => savingsPercent * 0.2 * 4/3 * 0.2 },
        { id: 'savings_emergency_legal', label: 'Emergency Fund - Legal', recommendedPercent: (savingsPercent) => savingsPercent * 0.2 * 4/3 * 0.2 },
        { id: 'savings_emergency_misc', label: 'Emergency Fund - Miscellaneous', recommendedPercent: (savingsPercent) => savingsPercent * 0.2 * 4/3 * 0.2 },
        { id: 'savings_investment_accounts', label: 'Investment Accounts', recommendedPercent: (savingsPercent) => savingsPercent * 0.35 * 4/3 },
        { id: 'savings_user_input_1', label: '[User Input]', recommendedPercent: (savingsPercent) => savingsPercent * 0.1 * 4/3 },
        { id: 'savings_miscellaneous', label: 'Miscellaneous', recommendedPercent: (savingsPercent) => savingsPercent * 0.1 * 4/3 },
      ]
    },
    {
        title: 'Retirement Contributions (401k, IRA, etc.)',
        items: [
            {
                id: 'retirement_traditional_401k',
                label: 'Traditional 401(k) Plan',
                recommendedPercent: ({ afterTaxIncome, housingCosts }) => {
                    let F123 = 0;
                    if (housingCosts === 'Low') F123 = 0.215 * 0.25;
                    if (housingCosts === 'Medium') F123 = 0.20 * 0.25;
                    if (housingCosts === 'High') F123 = 0.185 * 0.25;
                    let F125 = F123;
                    let F127 = F123;
                    let F129 = F123;
                    let E127 = 0, E129 = 0, E131 = 0;
                    for (let i = 0; i < 20; i++) {
                        E127 = (afterTaxIncome * F127 * 0.2 > 23500) ? 23500 / afterTaxIncome : F127 * 0.2;
                        E129 = (afterTaxIncome * F129 * 0.1 > 7000) ? 7000 / afterTaxIncome : F129 * 0.1;
                        E131 = (afterTaxIncome * F123 * 0.2 > 7000) ? 7000 / afterTaxIncome : F123 * 0.2;
                        F125 = F123 - E131 - E127 - E129;
                        F127 = F125;
                        F129 = F125;
                        console.log(`Iter ${i}: F125=${F125}, F127=${F127}, F129=${F129}, E127=${E127}, E129=${E129}, E131=${E131}`);
                    }
                    let E125 = (F125 * afterTaxIncome < 23500) ? F125 : 23500 / afterTaxIncome;
                    console.log('Final E125:', E125, 'F125:', F125, 'afterTaxIncome:', afterTaxIncome);
                    return E125;
                }
            },
            {
                id: 'retirement_roth_401k',
                label: 'Roth 401(k) Plan',
                recommendedPercent: ({ afterTaxIncome, housingCosts }) => {
                    let F127 = 0;
                    if (housingCosts === 'Low') F127 = 0.215 * 0.25;
                    if (housingCosts === 'Medium') F127 = 0.20 * 0.25;
                    if (housingCosts === 'High') F127 = 0.185 * 0.25;
                    return (afterTaxIncome * F127 * 0.2 > 23500) ? 23500 / afterTaxIncome : F127 * 0.2;
                }
            },
            {
                id: 'retirement_traditional_ira',
                label: 'Traditional IRA Plan',
                recommendedPercent: ({ afterTaxIncome, housingCosts }) => {
                    let F129 = 0;
                    if (housingCosts === 'Low') F129 = 0.215 * 0.25;
                    if (housingCosts === 'Medium') F129 = 0.20 * 0.25;
                    if (housingCosts === 'High') F129 = 0.185 * 0.25;
                    return (afterTaxIncome * F129 * 0.1 > 7000) ? 7000 / afterTaxIncome : F129 * 0.1;
                }
            },
            {
                id: 'retirement_roth_ira',
                label: 'Roth IRA Plan',
                recommendedPercent: ({ afterTaxIncome, housingCosts }) => {
                    let F123 = 0;
                    if (housingCosts === 'Low') F123 = 0.215 * 0.25;
                    if (housingCosts === 'Medium') F123 = 0.20 * 0.25;
                    if (housingCosts === 'High') F123 = 0.185 * 0.25;
                    return (afterTaxIncome * F123 * 0.2 > 7000) ? 7000 / afterTaxIncome : F123 * 0.2;
                }
            },
            {
                id: 'retirement_simple_ira',
                label: 'SIMPLE 401(k) Plan',
                recommendedPercent: () => 0 // Excel'de genelde 0, isterseniz formül ekleyebilirsiniz
            },
            { id: 'retirement_403b', label: '403(b) Plan', recommendedPercent: () => 0 },
            { id: 'retirement_457b', label: '457(b) Plan', recommendedPercent: () => 0 },
            { id: 'retirement_thrift', label: 'Thrift Savings Plan', recommendedPercent: () => 0 },
            { id: 'retirement_private_db', label: 'Private-Sector DB Plan', recommendedPercent: () => 0 },
            { id: 'retirement_gov_db', label: 'Government DB Plan', recommendedPercent: () => 0 },
        ]
    },
    {
        title: 'Lifestyle & Entertainment',
        totalPercent: (housingCosts) => {
            if (housingCosts === 'Low') return 0.11;
            if (housingCosts === 'Medium') return 0.105;
            if (housingCosts === 'High') return 0.10;
            return 0;
        },
        items: [
            { id: 'lifestyle_subscriptions', label: 'Subscriptions (Netflix, Spotify)', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_hobbies', label: 'Hobbies', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_travel', label: 'Travel/Vacation', recommendedPercent: (sectionPercent) => sectionPercent * 0.25 },
            { id: 'lifestyle_gifts', label: 'Gifts (Holidays/Birthdays)', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_clothing', label: 'Clothing', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_haircuts', label: 'Haircuts/Salon', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'lifestyle_events', label: 'Sporting, Musical, or other Events', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_grooming', label: 'Personal Care/Grooming', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
            { id: 'lifestyle_miscellaneous', label: 'Miscellaneous', recommendedPercent: (sectionPercent) => sectionPercent * 0.1 },
        ]
    },
    {
        title: 'Other Miscellaneous Expenses',
        totalPercent: (housingCosts) => {
            if (housingCosts === 'Low') return 0.03;
            if (housingCosts === 'Medium') return 0.025;
            if (housingCosts === 'High') return 0.02;
            return 0;
        },
        items: [
            { id: 'misc_charity', label: 'Charity', recommendedPercent: (sectionPercent) => sectionPercent * 0.5 },
            { id: 'misc_user_input_1', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_2', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_3', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_4', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_5', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_6', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_7', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_8', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_9', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
            { id: 'misc_user_input_10', label: '[User Input]', recommendedPercent: (sectionPercent) => sectionPercent * 0.05 },
        ]
    }
  ]
};

const styles = {
  // Main container
  container: { 
    fontSize: '14px',
    maxWidth: 900, 
    margin: '0 auto', 
    padding: 24, 
    backgroundColor: '#fdfdfd',
    color: '#333'
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
    borderCollapse: 'separate', // Needed for border-radius on cells
    borderSpacing: 0,
    marginTop: 20, 
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
  thExpense: { width: '120px' },
  thBudgeted: { width: '120px' },
  thRecommended: { width: '120px' },
  thPercent: { width: '120px' },
  td: { 
    border: '1px solid #e0e0e0',
    padding: '10px 12px', 
    verticalAlign: 'middle',
    fontSize: '14px',
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
    { id: 'preTaxIncome', label: 'Pre-Tax Income', value: '1000000' },
    { id: 'location', label: 'Location (State Abbreviation)', value: 'TX' },
    { id: 'housingCosts', label: 'Housing Costs', value: 'Medium' },
];

const deductionChoiceFields = [
    { id: 'marriageStatus', label: 'Marriage Status', options: ['single', 'married'] },
    { id: 'filedJointly', label: 'Filed Independently or Jointly with spouse', options: ['independently', 'jointly'] },
    { id: 'dependency', label: 'Dependency: head of household or not?', options: ['no', 'yes'] },
    { id: 'age', label: 'Age', options: ['under65', 'over65'] },
    { id: 'blind', label: 'Blindness', options: ['no', 'yes'] },
    { id: 'qualifyingSurvivingSpouse', label: 'Qualifying Surviving Spouse', options: ['no', 'yes'] },
];

export default function BudgetForm() {
    const { 
        topInputs, 
        setTopInputs, 
        deductionChoices, 
        setDeductionChoices, 
        financialCalculations,
        retirementInputs,
        setRetirementInputs
    } = useBudget();

    // housingCostPercent değişkenini burada tanımla
    let housingCostPercent = 0.125; // default Medium
    if (topInputs.housingCosts === 'Low') housingCostPercent = 0.135;
    else if (topInputs.housingCosts === 'Medium') housingCostPercent = 0.125;
    else if (topInputs.housingCosts === 'High') housingCostPercent = 0.115;

    let transportationPercent = 0.05; // default Medium
    if (topInputs.housingCosts === 'Low') transportationPercent = 0.055;
    else if (topInputs.housingCosts === 'Medium') transportationPercent = 0.05;
    else if (topInputs.housingCosts === 'High') transportationPercent = 0.045;

    let insurancePercent = 0.05; // default Medium
    if (topInputs.housingCosts === 'Low') insurancePercent = 0.0525;
    else if (topInputs.housingCosts === 'Medium') insurancePercent = 0.05;
    else if (topInputs.housingCosts === 'High') insurancePercent = 0.0475;

    let debtPercent = 0.045; // default Medium
    if (topInputs.housingCosts === 'Low') debtPercent = 0.0525;
    else if (topInputs.housingCosts === 'Medium') debtPercent = 0.045;
    else if (topInputs.housingCosts === 'High') debtPercent = 0.0375;

    let savingsPercent = 0.15; // default Medium
    if (topInputs.housingCosts === 'Low') savingsPercent = 0.215 * 0.75;
    else if (topInputs.housingCosts === 'Medium') savingsPercent = 0.20 * 0.75;
    else if (topInputs.housingCosts === 'High') savingsPercent = 0.185 * 0.75;

    let retirementPercent = 0.05; // default Medium
    if (topInputs.housingCosts === 'Low') retirementPercent = 0.215 * 0.25;
    else if (topInputs.housingCosts === 'Medium') retirementPercent = 0.20 * 0.25;
    else if (topInputs.housingCosts === 'High') retirementPercent = 0.185 * 0.25;

    const [userInputs, setUserInputs] = useState(
        budgetConfig.sections.flatMap(s => s.items).reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
    );
    
    const [showDeductionChoices, setShowDeductionChoices] = useState(false);
    
    const afterTaxIncome = financialCalculations.afterTaxIncome;

    const dynamicNoteText = useMemo(() => {
      const {
          marriageStatus,
          filedJointly,
          dependency,
          age,
          blind,
          qualifyingSurvivingSpouse
      } = deductionChoices;

      let statusDescription;

      if (qualifyingSurvivingSpouse === 'yes') {
          statusDescription = 'a qualifying surviving spouse';
      } else if (marriageStatus === 'married') {
          statusDescription = `a taxpayer filing as married (${filedJointly === 'jointly' ? 'filing jointly' : 'filing separately'})`;
      } else { // marriageStatus is 'single'
          if (dependency === 'yes') {
              statusDescription = 'a head of household';
          } else {
              statusDescription = 'a single taxpayer';
          }
      }
      
      const additions = [];
      if (age === 'over65') {
          additions.push('over 65');
      }
      if (blind === 'yes') {
          additions.push('blind');
      }

      if (additions.length > 0) {
          statusDescription += `, who is ${additions.join(' and ')}`;
      }

      return `Taxes are calculated based on your selections: ${statusDescription}.`;
    }, [deductionChoices]);

    const tableCalculations = useMemo(() => {
        const recommended = {};
        const entered = {};
        const sectionTotals = {};
        let grandTotalEntered = 0;

        budgetConfig.sections.forEach(section => {
          let sectionEnteredTotal = 0;
          let sectionRecommendedTotal = 0;
          if (section.title === 'Other Miscellaneous Expenses') {
            const sectionPercent = section.totalPercent(topInputs.housingCosts);
            section.items.forEach(item => {
              const recommendedValue = afterTaxIncome * item.recommendedPercent(sectionPercent);
              recommended[item.id] = recommendedValue;
              sectionRecommendedTotal += recommendedValue;
              const enteredValue = parseFloat(userInputs[item.id]) || 0;
              entered[item.id] = enteredValue;
              sectionEnteredTotal += enteredValue;
            });
          } else {
            section.items.forEach(item => {
              let recommendedValue = 0;
              if (section.title === 'Food' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(housingCostPercent);
              } else if (section.title === 'Transportation' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(transportationPercent);
              } else if (section.title === 'Insurance/Health' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(insurancePercent);
              } else if (section.title === 'Unsecured Debt Payments' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(debtPercent);
              } else if (section.title === 'Savings & Investments' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(savingsPercent);
              } else if (section.title === 'Retirement Contributions (401k, IRA, etc.)' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent({ afterTaxIncome, housingCosts: topInputs.housingCosts });
              } else if (section.title === 'Lifestyle & Entertainment' && typeof item.recommendedPercent === 'function') {
                recommendedValue = afterTaxIncome * item.recommendedPercent(section.totalPercent(topInputs.housingCosts));
              } else {
                recommendedValue = afterTaxIncome * (item.recommendedPercent || 0);
              }
              recommended[item.id] = recommendedValue;
              sectionRecommendedTotal += recommendedValue;
              const enteredValue = parseFloat(userInputs[item.id]) || 0;
              entered[item.id] = enteredValue;
              sectionEnteredTotal += enteredValue;
            });
          }
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
        setUserInputs(prev => ({ ...prev, [id]: numericValue }));
        // If this is a retirement plan input, update context too
        if (id.startsWith('retirement_')) {
          setRetirementInputs(prev => ({ ...prev, [id]: numericValue }));
        }
    };
    
    const handleTopInputChange = (id, value) => {
        setTopInputs(prev => ({ ...prev, [id]: value }));
    };
    
    const handleDeductionChange = (id, value) => {
        setDeductionChoices(prev => ({ ...prev, [id]: value }));
    };

    const formatCurrency = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (num) => (num * 100).toFixed(2) + '%';

    // 1. Section expanded state
    const initialExpanded = Object.fromEntries(budgetConfig.sections.map(s => [s.title, true]));
    const [expandedSections, setExpandedSections] = useState(initialExpanded);
    const toggleSection = (title) => setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));

    return (
        <div style={styles.container}>
          <div style={styles.infoBox}>
            <InfoIcon />
            <span>{dynamicNoteText}</span>
          </div>
        
        <div style={{width: '450px'}}>
            <h3 style={styles.header}>User Inputted Data</h3>
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
                ) : (
                  <input
                    style={styles.topInput}
                    value={topInputs[field.id]}
                    onChange={e => handleTopInputChange(field.id, e.target.value)}
                  />
                )}
            </div>
            ))}
            
            <button 
              onClick={() => setShowDeductionChoices(!showDeductionChoices)}
              style={{...styles.header, cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            >
              <span>Standard Deduction Choices</span>
              <span>{showDeductionChoices ? '▲' : '▼'}</span>
            </button>

            {showDeductionChoices && (
              <div>
                {deductionChoiceFields.map(field => (
                <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', alignItems: 'center' }}>
                    <label style={styles.deductionLabel}>{field.label}</label>
                    <select 
                    style={styles.selectInput} 
                    value={deductionChoices[field.id]} 
                    onChange={(e) => handleDeductionChange(field.id, e.target.value)}
                    >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{...styles.afterTaxRow, flexGrow: 1}}>
                <span>After Tax Income</span>
                <span>${formatCurrency(afterTaxIncome)}</span>
              </div>
              {tableCalculations.grandTotalEntered > afterTaxIncome && (
                <div style={styles.floatingWarning}>
                  Over Budget! Your total budgeted expenses exceed your after-tax income.
                </div>
              )}
            </div>
        </div>
        
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={{...styles.th, ...styles.thExpense}}>Expense Item</th>
                <th style={{...styles.th, ...styles.thBudgeted}}>Budgeted Amount Spent (Manually Enter)</th>
                <th style={{...styles.th, ...styles.thRecommended}}>Recommended Amount Spent</th>
                <th style={{...styles.th, ...styles.thPercent}}>Recommended %</th>
            </tr>
            </thead>
            <tbody>
              {budgetConfig.sections.map((section, sectionIndex) => (
                <React.Fragment key={section.title}>
                  <tr>
                    <td style={{...styles.td, ...styles.sectionHeader, fontWeight: 'bold', cursor: 'pointer'}} colSpan="4"
                        onClick={() => toggleSection(section.title)}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>{section.title}</span>
                        <span>
                          {section.title === 'Food'
                            ? formatPercent(housingCostPercent)
                            : section.title === 'Transportation'
                              ? formatPercent(transportationPercent)
                              : section.title === 'Insurance/Health'
                                ? formatPercent(insurancePercent)
                                : section.title === 'Unsecured Debt Payments'
                                  ? formatPercent(debtPercent)
                                  : section.title === 'Savings & Investments'
                                    ? formatPercent(savingsPercent)
                                    : section.title === 'Retirement Contributions (401k, IRA, etc.)'
                                      ? formatPercent(retirementPercent)
                                      : (typeof section.totalPercent === 'function'
                                          ? (section.totalPercent(topInputs.housingCosts) * 100).toFixed(2) + '%'
                                          : (section.totalPercent || ''))}
                          <span style={{marginLeft: 12, fontWeight: 'bold', fontSize: 18}}>
                            {expandedSections[section.title] ? '▼' : '►'}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedSections[section.title] && (
                    <>
                      {section.items.map((item, index) => {
                        if (item.type === 'subheader') {
                          return (
                            <tr key={`${item.label}-${index}`}>
                              <td style={{...styles.td, fontWeight: 'bold'}}>{item.label}</td>
                              <td style={styles.td}></td>
                              <td style={styles.td}></td>
                              <td style={styles.td}></td>
                            </tr>
                          )
                        }
                        let percentValue = '-';
                        if (tableCalculations.recommended[item.id] && afterTaxIncome) {
                          percentValue = formatPercent(tableCalculations.recommended[item.id] / afterTaxIncome);
                        }
                        return (
                          <tr key={item.id}>
                            <td style={{...styles.td, paddingLeft: '40px'}}>{item.label}</td>
                            <td style={styles.td}>
                              <div style={styles.inputCellContainer}>
                                <input
                                  style={styles.input}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={userInputs[item.id]}
                                  onChange={(e) => handleUserInputChange(item.id, e.target.value)}
                                />
                                <span style={styles.currencySymbol}>$</span>
                              </div>
                            </td>
                            <td style={{...styles.td, ...styles.readOnly}}>{formatCurrency(tableCalculations.recommended[item.id])}</td>
                            <td style={{...styles.td, ...styles.readOnly}}>{percentValue}</td>
                          </tr>
                        )
                      })}
                      {/* Section Total Row */}
                      <tr style={styles.totalRow}>
                        <td style={{...styles.td, fontWeight: 'bold'}}>Total</td>
                        <td style={styles.td}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>$</span>
                            <span>
                              {tableCalculations.sectionTotals[section.title].entered > 0 ? formatCurrency(tableCalculations.sectionTotals[section.title].entered) : '-'}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>$</span>
                            <span>
                              {tableCalculations.sectionTotals[section.title].recommended > 0 ? formatCurrency(tableCalculations.sectionTotals[section.title].recommended) : '-'}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}></td>
                      </tr>
                    </>
                  )}
                  {/* Spacer row for visual separation between sections */}
                  {sectionIndex < budgetConfig.sections.length - 1 && (
                    <tr style={{height: '20px'}}>
                        <td colSpan="4" style={{border: 'none'}}></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
        </table>
        
        </div>
    );
} 