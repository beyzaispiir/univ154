import React from 'react';
import { useBudget } from '../contexts/BudgetContext';

const Week4 = () => {
  const { saveBudgetData, loadBudgetData, summaryCalculations, topInputs } = useBudget();
  
  // Get Week 1 SUGGESTED data directly from summaryCalculations (Week 1 B - Summary)
  const week4Data = {
    // C4: Pre-tax Income
    preTaxIncome: summaryCalculations.preTaxIncome || 0,
    
    // C6: Standard Deduction (Single Filers 2025)
    standardDeduction: summaryCalculations.standardDeduction || 0,
    
    // C7: Pre-Tax Expenses (Health Insurance, Tr. 401k, Tr. IRA) * 12 - SUGGESTED
    preTaxExpenses: summaryCalculations.suggestedPreTaxExpenses || 0,
    
    // C9: Taxable Income - SUGGESTED
    taxableIncome: summaryCalculations.suggestedTaxableIncome || 0,
    
    // C11: Federal Income Tax Payment - SUGGESTED
    federalIncomeTax: summaryCalculations.suggestedFederalIncomeTax || 0,
    
    // C12: Federal Social Security Tax Payment - SUGGESTED
    federalSocialSecurityTax: summaryCalculations.suggestedSocialSecurityTax || 0,
    
    // C13: Federal Medicare Tax Payment - SUGGESTED
    federalMedicareTax: summaryCalculations.suggestedMedicareTax || 0,
    
    // C15: State Income Tax Payment - SUGGESTED
    stateIncomeTax: summaryCalculations.suggestedStateIncomeTax || 0,
    
    // C16: NY City Income Tax Payment - SUGGESTED
    nyCityIncomeTax: summaryCalculations.suggestedNYCTax || 0,
    
    // C18: After Tax Income - SUGGESTED
    afterTaxIncome: summaryCalculations.suggestedAfterTaxIncome || 0
  };

  // Handler functions for save/load
  const handleSaveWeek4 = async () => {
    try {
      const dataToSave = {
        week: 4,
        week4Data,
        timestamp: new Date().toISOString()
      };
      
      await saveBudgetData(dataToSave, {}, {});
      alert('Week 4 data saved successfully!');
    } catch (error) {
      console.error('Error saving Week 4 data:', error);
      alert('Error saving Week 4 data. Please try again.');
    }
  };

  const handleLoadWeek4 = async () => {
    try {
      const result = await loadBudgetData();
      if (result && result.success) {
        alert('Week 4 data loaded successfully! Data is automatically pulled from Week 1 calculations.');
      } else {
        alert('No saved data found. Week 4 uses live data from Week 1 calculations.');
      }
    } catch (error) {
      console.error('Error loading Week 4 data:', error);
      alert('Error loading Week 4 data. Please try again.');
    }
  };

  // Federal tax brackets for 2025 (matching BudgetContext)
  const federalTaxBrackets = [
    { rate: 0.10, over: 0, butNotOver: 11925 },
    { rate: 0.12, over: 11925, butNotOver: 48475 },
    { rate: 0.22, over: 48475, butNotOver: 103350 },
    { rate: 0.24, over: 103350, butNotOver: 197300 },
    { rate: 0.32, over: 197300, butNotOver: 250525 },
    { rate: 0.35, over: 250525, butNotOver: 626350 },
    { rate: 0.37, over: 626350, butNotOver: Infinity }
  ];

  // Function to calculate taxes paid per bracket (matching Excel logic)
  const calculateTaxesPaidPerBracket = (taxableIncome, bracket) => {
    if (taxableIncome <= bracket.over) {
      return 0; // No tax in this bracket
    } else if (taxableIncome >= bracket.butNotOver) {
      // Full bracket: (butNotOver - over) * rate
      return (bracket.butNotOver - bracket.over) * bracket.rate;
    } else {
      // Partial bracket: (taxableIncome - over) * rate
      return (taxableIncome - bracket.over) * bracket.rate;
    }
  };

  // Complete state tax data (matching 'Week 1 B - State Tax' sheet structure)
  // Column B: State, Column C: Tax Rate, Column D: Over (income threshold)
  const stateTaxData = [
    { state: 'AL', rate: 0.02, over: 0 }, { state: 'AL', rate: 0.04, over: 500 }, { state: 'AL', rate: 0.05, over: 3000 },
    { state: 'AK', rate: 0.00, over: 0 },
    { state: 'AZ', rate: 0.025, over: 0 },
    { state: 'AR', rate: 0.02, over: 0 }, { state: 'AR', rate: 0.039, over: 4500 },
    { state: 'CA', rate: 0.01, over: 0 }, { state: 'CA', rate: 0.02, over: 10756 }, { state: 'CA', rate: 0.04, over: 25499 }, { state: 'CA', rate: 0.06, over: 40245 }, { state: 'CA', rate: 0.08, over: 55866 }, { state: 'CA', rate: 0.093, over: 70606 }, { state: 'CA', rate: 0.103, over: 360659 }, { state: 'CA', rate: 0.113, over: 432787 }, { state: 'CA', rate: 0.123, over: 721314 }, { state: 'CA', rate: 0.133, over: 1000000 },
    { state: 'CO', rate: 0.044, over: 0 },
    { state: 'CT', rate: 0.02, over: 0 }, { state: 'CT', rate: 0.045, over: 10000 }, { state: 'CT', rate: 0.055, over: 50000 }, { state: 'CT', rate: 0.06, over: 100000 }, { state: 'CT', rate: 0.065, over: 200000 }, { state: 'CT', rate: 0.069, over: 250000 }, { state: 'CT', rate: 0.0699, over: 500000 },
    { state: 'DE', rate: 0.022, over: 0 }, { state: 'DE', rate: 0.039, over: 2000 }, { state: 'DE', rate: 0.048, over: 5000 }, { state: 'DE', rate: 0.052, over: 10000 }, { state: 'DE', rate: 0.0555, over: 20000 }, { state: 'DE', rate: 0.066, over: 25000 },
    { state: 'FL', rate: 0.00, over: 0 },
    { state: 'GA', rate: 0.0539, over: 0 },
    { state: 'HI', rate: 0.014, over: 0 }, { state: 'HI', rate: 0.032, over: 2400 }, { state: 'HI', rate: 0.055, over: 4800 }, { state: 'HI', rate: 0.064, over: 9600 }, { state: 'HI', rate: 0.068, over: 14400 }, { state: 'HI', rate: 0.072, over: 19200 }, { state: 'HI', rate: 0.076, over: 24000 }, { state: 'HI', rate: 0.079, over: 36000 }, { state: 'HI', rate: 0.0825, over: 48000 }, { state: 'HI', rate: 0.09, over: 150000 }, { state: 'HI', rate: 0.10, over: 175000 }, { state: 'HI', rate: 0.11, over: 200000 },
    { state: 'ID', rate: 0.05695, over: 0 },
    { state: 'IL', rate: 0.0495, over: 0 },
    { state: 'IN', rate: 0.03, over: 0 },
    { state: 'IA', rate: 0.038, over: 0 },
    { state: 'KS', rate: 0.052, over: 0 }, { state: 'KS', rate: 0.0558, over: 15000 },
    { state: 'KY', rate: 0.04, over: 0 },
    { state: 'LA', rate: 0.03, over: 0 },
    { state: 'ME', rate: 0.058, over: 0 }, { state: 'ME', rate: 0.0675, over: 23000 }, { state: 'ME', rate: 0.0715, over: 54000 },
    { state: 'MD', rate: 0.02, over: 0 }, { state: 'MD', rate: 0.03, over: 1000 }, { state: 'MD', rate: 0.04, over: 2000 }, { state: 'MD', rate: 0.0475, over: 3000 }, { state: 'MD', rate: 0.05, over: 100000 }, { state: 'MD', rate: 0.0525, over: 125000 }, { state: 'MD', rate: 0.055, over: 150000 }, { state: 'MD', rate: 0.0575, over: 250000 },
    { state: 'MA', rate: 0.05, over: 0 }, { state: 'MA', rate: 0.09, over: 1000000 },
    { state: 'MI', rate: 0.0425, over: 0 },
    { state: 'MN', rate: 0.0535, over: 0 }, { state: 'MN', rate: 0.068, over: 30070 }, { state: 'MN', rate: 0.0785, over: 98760 }, { state: 'MN', rate: 0.0985, over: 183340 },
    { state: 'MS', rate: 0.044, over: 0 },
    { state: 'MO', rate: 0.02, over: 0 }, { state: 'MO', rate: 0.025, over: 1000 }, { state: 'MO', rate: 0.03, over: 2000 }, { state: 'MO', rate: 0.035, over: 3000 }, { state: 'MO', rate: 0.04, over: 4000 }, { state: 'MO', rate: 0.045, over: 5000 }, { state: 'MO', rate: 0.047, over: 6000 },
    { state: 'MT', rate: 0.047, over: 0 }, { state: 'MT', rate: 0.059, over: 19500 },
    { state: 'NE', rate: 0.0246, over: 0 }, { state: 'NE', rate: 0.0351, over: 3700 }, { state: 'NE', rate: 0.0501, over: 22230 }, { state: 'NE', rate: 0.052, over: 35730 },
    { state: 'NV', rate: 0.00, over: 0 },
    { state: 'NH', rate: 0.00, over: 0 },
    { state: 'NJ', rate: 0.014, over: 0 }, { state: 'NJ', rate: 0.0175, over: 20000 }, { state: 'NJ', rate: 0.035, over: 35000 }, { state: 'NJ', rate: 0.05525, over: 40000 }, { state: 'NJ', rate: 0.0637, over: 75000 }, { state: 'NJ', rate: 0.0897, over: 500000 }, { state: 'NJ', rate: 0.1075, over: 1000000 },
    { state: 'NM', rate: 0.015, over: 0 }, { state: 'NM', rate: 0.032, over: 5500 }, { state: 'NM', rate: 0.043, over: 11000 }, { state: 'NM', rate: 0.047, over: 16000 }, { state: 'NM', rate: 0.049, over: 21000 }, { state: 'NM', rate: 0.059, over: 26000 },
    { state: 'NY', rate: 0.04, over: 0 }, { state: 'NY', rate: 0.045, over: 8500 }, { state: 'NY', rate: 0.0525, over: 11700 }, { state: 'NY', rate: 0.055, over: 13900 }, { state: 'NY', rate: 0.06, over: 80650 }, { state: 'NY', rate: 0.0685, over: 215400 }, { state: 'NY', rate: 0.0965, over: 1077550 }, { state: 'NY', rate: 0.103, over: 5000000 }, { state: 'NY', rate: 0.109, over: 25000000 },
    { state: 'NC', rate: 0.0425, over: 0 },
    { state: 'ND', rate: 0.0195, over: 0 }, { state: 'ND', rate: 0.025, over: 41000 },
    { state: 'OH', rate: 0.0275, over: 0 }, { state: 'OH', rate: 0.035, over: 26050 },
    { state: 'OK', rate: 0.0025, over: 0 }, { state: 'OK', rate: 0.0075, over: 1000 }, { state: 'OK', rate: 0.0175, over: 2500 }, { state: 'OK', rate: 0.0275, over: 3750 }, { state: 'OK', rate: 0.0375, over: 4900 }, { state: 'OK', rate: 0.0475, over: 7200 },
    { state: 'OR', rate: 0.0475, over: 0 }, { state: 'OR', rate: 0.0675, over: 4050 }, { state: 'OR', rate: 0.0875, over: 10200 }, { state: 'OR', rate: 0.099, over: 125000 },
    { state: 'PA', rate: 0.0307, over: 0 },
    { state: 'RI', rate: 0.0375, over: 0 }, { state: 'RI', rate: 0.0475, over: 68200 }, { state: 'RI', rate: 0.0599, over: 155050 },
    { state: 'SC', rate: 0.00, over: 0 }, { state: 'SC', rate: 0.03, over: 3200 }, { state: 'SC', rate: 0.062, over: 16040 },
    { state: 'SD', rate: 0.00, over: 0 },
    { state: 'TN', rate: 0.00, over: 0 },
    { state: 'TX', rate: 0.00, over: 0 },
    { state: 'UT', rate: 0.0455, over: 0 },
    { state: 'VT', rate: 0.0335, over: 0 }, { state: 'VT', rate: 0.066, over: 42050 }, { state: 'VT', rate: 0.076, over: 102200 }, { state: 'VT', rate: 0.0875, over: 213150 },
    { state: 'VA', rate: 0.02, over: 0 }, { state: 'VA', rate: 0.03, over: 3000 }, { state: 'VA', rate: 0.05, over: 5000 }, { state: 'VA', rate: 0.0575, over: 17000 },
    { state: 'WA', rate: 0.00, over: 0 },
    { state: 'WV', rate: 0.0222, over: 0 }, { state: 'WV', rate: 0.0296, over: 10000 }, { state: 'WV', rate: 0.0333, over: 25000 }, { state: 'WV', rate: 0.0444, over: 40000 }, { state: 'WV', rate: 0.0482, over: 60000 },
    { state: 'WI', rate: 0.035, over: 0 }, { state: 'WI', rate: 0.044, over: 12760 }, { state: 'WI', rate: 0.053, over: 25520 }, { state: 'WI', rate: 0.0765, over: 280950 },
    { state: 'WY', rate: 0.00, over: 0 },
    { state: 'DC', rate: 0.04, over: 0 }, { state: 'DC', rate: 0.06, over: 10000 }, { state: 'DC', rate: 0.065, over: 40000 }, { state: 'DC', rate: 0.085, over: 60000 }, { state: 'DC', rate: 0.0925, over: 250000 }, { state: 'DC', rate: 0.0975, over: 500000 }, { state: 'DC', rate: 0.1075, over: 1000000 }
  ];

  // Function to filter state tax rates (matching Excel FILTER formula)
  const getStateTaxRates = (selectedState) => {
    // =FILTER('Week 1 B - State Tax'!C7:C167, 'Week 1 B - State Tax'!B7:B167=F16)
    return stateTaxData
      .filter(item => item.state === selectedState)
      .map(item => item.rate);
  };

  // Function to filter state tax "Over" values (matching Excel FILTER formula)
  const getStateTaxOverValues = (selectedState) => {
    // =FILTER('Week 1 B - State Tax'!D7:D167, 'Week 1 B - State Tax'!B7:B167=F16)
    return stateTaxData
      .filter(item => item.state === selectedState)
      .map(item => item.over);
  };

  // Function to get "But Not Over" values (matching Excel LET/VSTACK/DROP formula)
  const getStateTaxButNotOverValues = (selectedState) => {
    // =LET(x, FILTER('Week 1 B - State Tax'!$D$7:$D$167, 'Week 1 B - State Tax'!$B$7:$B$167=$F$16), VSTACK(DROP(x,1), "…"))
    const overValues = getStateTaxOverValues(selectedState);
    
    if (overValues.length === 0) return [];
    
    // DROP(x,1) - remove first element, then add "…" at the end
    const butNotOverValues = overValues.slice(1); // Remove first element
    butNotOverValues.push("…"); // Add "…" at the end
    
    return butNotOverValues;
  };

  // Function to calculate "Taxes Paid Per Bracket" values (matching Excel FILTER formula)
  const getStateTaxPaidPerBracket = (selectedState, taxableIncome) => {
    // =FILTER('Week 1 B - State Tax'!H7:H167, 'Week 1 B - State Tax'!B7:B167=F16)
    const stateBrackets = stateTaxData.filter(item => item.state === selectedState);
    
    return stateBrackets.map((bracket, index) => {
      // Calculate taxes paid in this bracket
      if (taxableIncome <= bracket.over) {
        return 0; // No taxes in this bracket
      }
      
      // Get the "but not over" value (next bracket's "over" value, or infinity for highest bracket)
      const nextBracket = stateBrackets[index + 1];
      const butNotOver = nextBracket ? nextBracket.over : Infinity;
      
      // Calculate taxable amount in this bracket
      const taxableInBracket = Math.min(taxableIncome, butNotOver) - bracket.over;
      
      // Calculate taxes in this bracket
      return Math.max(0, taxableInBracket * bracket.rate);
    });
  };

  // Get dynamic state tax data based on Week 1 location (matching Excel FILTER formula)
  const stateTaxRates = getStateTaxRates(topInputs.location);
  const stateTaxOverValues = getStateTaxOverValues(topInputs.location);
  const stateTaxButNotOverValues = getStateTaxButNotOverValues(topInputs.location);
  const stateTaxPaidPerBracket = getStateTaxPaidPerBracket(topInputs.location, week4Data.taxableIncome);
  
  // Get dynamic table title based on state
  const getStateTaxTableTitle = (state) => {
    const stateNames = {
      'NY': 'NY State Income Tax',
      'CA': 'CA State Income Tax', 
      'TX': 'TX State Income Tax',
      'FL': 'FL State Income Tax',
      'WA': 'WA State Income Tax',
      'NV': 'NV State Income Tax',
      'SD': 'SD State Income Tax',
      'WY': 'WY State Income Tax',
      'TN': 'TN State Income Tax',
      'NH': 'NH State Income Tax'
    };
    return stateNames[state] || `${state} State Income Tax`;
  };

  // Styling matching Week 1, Week 2, and Week 3 patterns exactly
  const styles = {
    container: {
      minHeight: 'auto',
      backgroundColor: '#f8f9fa',
      padding: '10px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    },
    enhancedHeader: {
      backgroundColor: '#002060',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '18px',
      textAlign: 'center',
      marginBottom: '12px',
      boxShadow: '0 4px 8px rgba(0, 32, 96, 0.3)'
    },
    sectionDivider: {
      height: '3px',
      background: 'linear-gradient(90deg, #002060, #ff9500, #002060)',
      margin: '20px 0',
      borderRadius: '2px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '10px'
    },
    leftSection: {
      backgroundColor: '#f8f9fa',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    rightSection: {
      backgroundColor: '#f8f9fa',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '15px',
      paddingBottom: '8px',
      borderBottom: '2px solid #002060'
    },
    dataRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e9ecef'
    },
    dataLabel: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '500'
    },
    dataValue: {
      fontSize: '14px',
      color: '#002060',
      fontWeight: '600',
      backgroundColor: '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid #e9ecef',
      minWidth: '100px',
      textAlign: 'right'
    },
    highlightRow: {
      backgroundColor: '#e3f2fd',
      padding: '8px',
      borderRadius: '6px',
      margin: '10px 0',
      border: '2px solid #002060'
    },
    tableContainer: {
      marginTop: '16px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    },
    tableHeader: {
      backgroundColor: '#002060',
      color: 'white',
      padding: '8px',
      textAlign: 'center',
      fontWeight: '600'
    },
    tableCell: {
      border: '1px solid #e9ecef',
      padding: '6px',
      textAlign: 'center'
    },
    noteBox: {
      backgroundColor: '#fffde7',
      border: '1px solid #f9fbe7',
      borderRadius: '6px',
      padding: '12px',
      marginTop: '20px',
      fontSize: '12px',
      color: '#374151'
    }
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
        Data from Week 1 calculations. Review and adjust as needed.
      </div>

      <div style={styles.container}>
          {/* Section Container - matching Week 1, 2, 3 layered design */}
          <div style={styles.sectionContainer}>
            {/* Enhanced Header */}
            <div style={styles.enhancedHeader}>
              📊 Week 4 - Income Taxes
            </div>
            
            {/* Note about calculations */}
            <div style={styles.noteBox}>
              <strong>Note:</strong> Tax calculations exclude detailed state/city rules and provide a close estimate of After-Tax Income rather than exact figures.
            </div>

            {/* Main Content Grid */}
            <div style={styles.mainContent}>
              {/* Left Section - After-Tax Income Summary */}
              <div style={styles.leftSection}>
                <div style={styles.sectionTitle}>
                  After-Tax Income Summary
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Pre-tax Income</span>
                  <span style={styles.dataValue}>${week4Data.preTaxIncome.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Standard Deduction (Single Filers 2025)</span>
                  <span style={styles.dataValue}>${week4Data.standardDeduction.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Pre-Tax Expenses (Health Insurance, Tr. 401k, Tr. IRA)</span>
                  <span style={styles.dataValue}>${week4Data.preTaxExpenses.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Taxable Income</span>
                  <span style={styles.dataValue}>${week4Data.taxableIncome.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Federal Income Tax Payment</span>
                  <span style={styles.dataValue}>${week4Data.federalIncomeTax.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Federal Social Security Tax Payment</span>
                  <span style={styles.dataValue}>${week4Data.federalSocialSecurityTax.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Federal Medicare Tax Payment</span>
                  <span style={styles.dataValue}>${week4Data.federalMedicareTax.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>State Income Tax Payment</span>
                  <span style={styles.dataValue}>${week4Data.stateIncomeTax.toLocaleString()}</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>NY City Income Tax Payment</span>
                  <span style={styles.dataValue}>${week4Data.nyCityIncomeTax.toLocaleString()}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '20px',
                  margin: '20px 0',
                  border: '2px solid #28a745',
                  boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#155724',
                    fontWeight: '700'
                  }}>After Tax Income</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#155724',
                    fontWeight: '700',
                    backgroundColor: 'white',
                    padding: '4px 4px',
                    borderRadius: '6px',
                    border: '1px solid #28a745',
                    minWidth: '120px',
                    textAlign: 'right'
                  }}>
                    ${week4Data.afterTaxIncome.toLocaleString()}
                  </span>
                </div>
                
                <div style={styles.noteBox}>
                  <strong>Note:</strong> Adjust Week 1 Budget based on this week's insights.
                </div>
              </div>

              {/* Right Section - Tax Tables */}
              <div style={styles.rightSection}>
                {/* Federal Income Tax Table */}
                <div style={styles.tableContainer}>
                  <div style={styles.sectionTitle}>
                    Federal Income Tax
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Tax Rate</th>
                        <th style={styles.tableHeader}>Over</th>
                        <th style={styles.tableHeader}>But Not Over</th>
                        <th style={styles.tableHeader}>Taxes Paid Per Bracket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {federalTaxBrackets.map((bracket, index) => {
                        const taxesPaid = calculateTaxesPaidPerBracket(week4Data.taxableIncome, bracket);
                        return (
                          <tr key={index}>
                            <td style={styles.tableCell}>{(bracket.rate * 100).toFixed(1)}%</td>
                            <td style={styles.tableCell}>${bracket.over.toLocaleString()}</td>
                            <td style={styles.tableCell}>
                              {bracket.butNotOver === Infinity ? '...' : `$${bracket.butNotOver.toLocaleString()}`}
                            </td>
                            <td style={styles.tableCell}>
                              ${taxesPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic State Income Tax Table */}
                <div style={styles.tableContainer}>
                  <div style={styles.sectionTitle}>
                    {getStateTaxTableTitle(topInputs.location)}
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Tax Rate</th>
                        <th style={styles.tableHeader}>Over</th>
                        <th style={styles.tableHeader}>But Not Over</th>
                        <th style={styles.tableHeader}>Taxes Paid Per Bracket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stateTaxRates.map((rate, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>{(rate * 100).toFixed(2)}%</td>
                          <td style={styles.tableCell}>${stateTaxOverValues[index].toLocaleString()}</td>
                          <td style={styles.tableCell}>
                            {stateTaxButNotOverValues[index] === "…" ? 
                              "…" : 
                              `$${stateTaxButNotOverValues[index].toLocaleString()}`
                            }
                          </td>
                          <td style={styles.tableCell}>
                            {stateTaxPaidPerBracket[index] > 0 ? 
                              `$${stateTaxPaidPerBracket[index].toLocaleString()}` : 
                              "TBD"
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
              </div>
            </div>
          </div>
          
          {/* Section Divider */}
          <div style={styles.sectionDivider}></div>

          {/* Save/Load Buttons - enhanced like Week 1/2/3 */}
          <div style={{
            marginTop: '15px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={handleSaveWeek4}
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
              💾 Save Week 4 Data
            </button>
            <button
              onClick={handleLoadWeek4}
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
              📁 Load Week 4 Data
            </button>
          </div>
        </div>

      {/* Note */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
        marginTop: '20px',
        maxWidth: '1200px',
        margin: '20px auto'
      }}>
        Note: Adjust Week 1 Budget based on this week's insights
      </div>
    </>
  );
};

export default Week4;
