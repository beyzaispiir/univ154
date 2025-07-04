import React, { useState, useMemo } from 'react';
import { calculateFinancials } from '../utils/taxCalculator';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BudgetProvider } from '../contexts/BudgetContext';
import BudgetForm from './BudgetForm';
import CalculationDetails from './CalculationDetails';

// This data structure now includes all necessary info for rendering the exact layout
const budgetConfig = {
  title: "Week 1 - Budgeting",
  userInputFields: [
    { id: 'preTaxIncome', label: 'Pre-Tax Income', value: '1000000' },
    { id: 'location', label: 'Location (State Abbreviation)', value: 'TX' },
    { id: 'housingCosts', label: 'Housing Costs', value: 'Medium' },
  ],
  deductionChoiceFields: [
    { id: 'marriageStatus', label: 'Marriage Status', options: ['single', 'married'] },
    { id: 'filedJointly', label: 'Filed Independently or Jointly with spouse', options: ['independently', 'jointly'] },
    { id: 'dependency', label: 'Dependency: head of household or not?', options: ['no', 'yes'] },
    { id: 'age', label: 'Age', options: ['under65', 'over65'] },
    { id: 'blind', label: 'Blindness', options: ['no', 'yes'] },
    { id: 'qualifyingSurvivingSpouse', label: 'Qualifying Surviving Spouse', options: ['no', 'yes'] },
  ],
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
      ]
    },
    {
      title: 'Utilities (Electricity, Water)',
      items: [
        { id: 'electricity', label: 'Electricity', recommendedPercent: 0.0060 },
        { id: 'gas', label: 'Gas', recommendedPercent: 0.0040 },
        { id: 'water', label: 'Water', recommendedPercent: 0.0060 },
        { id: 'sewerTrash', label: 'Sewer/Trash', recommendedPercent: 0.0040 },
        { id: 'phone', label: 'Phone (Cell/Landline)', recommendedPercent: 0.0080 },
        { id: 'internet', label: 'Internet', recommendedPercent: 0.0080 },
        { id: 'miscellaneous', label: 'Miscellaneous', recommendedPercent: 0.0040 },
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
    backgroundColor: '#002060', // Reverted to original dark blue
    color: 'white', 
    padding: '12px', 
    borderBottom: '1px solid #e0e0e0', // Separator line
    textAlign: 'center', 
    fontWeight: '600' 
  },
  td: { 
    border: '1px solid #e0e0e0', // Soft gray lines
    padding: '10px 12px', 
    verticalAlign: 'middle' 
  },
  
  // Table row types
  sectionHeader: { 
    fontWeight: '600',
    backgroundColor: '#f5f5f5', // Soft gray background
    color: '#333'
  },
  totalRow: { 
    backgroundColor: '#f5f5f5', // Consistent soft gray
    fontWeight: '600' 
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

  nav: {
    padding: '10px 24px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    display: 'flex',
    gap: '20px',
    maxWidth: 900, 
    margin: '0 auto', 
  },
  link: {
    textDecoration: 'none',
    color: '#002060',
    fontWeight: '600',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  activeLink: {
    backgroundColor: '#e0e0e0',
  }
};

const Week1BudgetingWrapper = () => {
    const location = useLocation();
    
    // Determine the base path for link construction.
    // If we are in '/details', the base path should be one level up.
    const basePath = location.pathname.includes('/details') 
        ? location.pathname.replace('/details', '') 
        : location.pathname;

    // Normalize to prevent double slashes
    const detailsPath = `${basePath.replace(/\/$/, '')}/details`;

  return (
    <div>
      <nav style={styles.nav}>
        <Link 
            to={basePath} 
            style={{
                ...styles.link, 
                fontSize: '16px',
                ...(!location.pathname.includes('/details') ? styles.activeLink : {})
            }}
        >
            Budget Calculator
        </Link>
        <Link 
            to={detailsPath} 
            style={{
                ...styles.link, 
                fontSize: '16px',
                ...(location.pathname.includes('/details') ? styles.activeLink : {})
            }}
        >
            Calculation Details
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<BudgetForm />} />
        <Route path="/details" element={<CalculationDetails />} />
      </Routes>
    </div>
  );
}

export default function Week1Budgeting() {
  return (
    <BudgetProvider>
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
      <Week1BudgetingWrapper />
    </BudgetProvider>
  );
} 