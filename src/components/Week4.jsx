import React, { useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import stateTaxData from '../data/stateTaxData';

const Week4 = () => {
  const { summaryCalculations, topInputs } = useBudget();
  
  // Auto-save function (without alert)
  const autoSaveWeek4 = () => {
    try {
      const week4Data = {
        // Week 4 is read-only, but we can save the summary calculations
        summaryCalculations: summaryCalculations,
        topInputs: topInputs,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage silently
      localStorage.setItem('week4_data', JSON.stringify(week4Data));
    } catch (error) {
      console.error('Error auto-saving Week 4 data:', error);
    }
  };

  // Auto-save with debounce (500ms delay)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      autoSaveWeek4();
    }, 500); // Wait 500ms after last change before saving

    return () => clearTimeout(saveTimer);
  }, [summaryCalculations, topInputs]);
  
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


  // Federal tax brackets for 2026 (matching BudgetContext)
  const federalTaxBrackets = [
    { rate: 0.10, over: 0, butNotOver: 12400 },
    { rate: 0.12, over: 12400, butNotOver: 50400 },
    { rate: 0.22, over: 50400, butNotOver: 105700 },
    { rate: 0.24, over: 105700, butNotOver: 201775 },
    { rate: 0.32, over: 201775, butNotOver: 256225 },
    { rate: 0.35, over: 256225, butNotOver: 640600 },
    { rate: 0.37, over: 640600, butNotOver: Infinity }
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
      .map(item => item.lowerBound);
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
      if (taxableIncome <= bracket.lowerBound) {
        return 0; // No taxes in this bracket
      }
      
      // Get the "but not over" value (next bracket's "lowerBound" value, or infinity for highest bracket)
      const nextBracket = stateBrackets[index + 1];
      const butNotOver = nextBracket ? nextBracket.lowerBound : Infinity;
      
      // Calculate taxable amount in this bracket
      const taxableInBracket = Math.min(taxableIncome, butNotOver) - bracket.lowerBound;
      
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
              📊 Income Taxes
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
                            ${stateTaxPaidPerBracket[index].toLocaleString()}
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
        </div>

        {/* Save/Load Buttons */}
        <div style={{
          marginTop: '30px', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '1200px',
          margin: '30px auto'
        }}>
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
