import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { calculateFinancials } from '../utils/taxCalculator';

const styles = {
  container: {
    fontSize: '14px',
    maxWidth: 1200,
    margin: '0 auto',
    padding: 24,
    backgroundColor: '#fdfdfd',
    color: '#333'
  },
  header: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '20px 0 10px 0',
    color: '#002060'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: 20,
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
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
  td: {
    border: '1px solid #e0e0e0',
    padding: '10px 12px',
    verticalAlign: 'middle',
    fontSize: '14px',
    textAlign: 'center'
  },
  inputCell: {
    backgroundColor: '#fffde7',
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'right',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box'
  },
  calculatedCell: {
    backgroundColor: '#f5f5f5',
    fontWeight: '500'
  },
  summaryCell: {
    backgroundColor: '#e8f5e9',
    fontWeight: '600'
  },
  sectionTitle: {
    backgroundColor: '#002060',
    color: 'white',
    padding: '12px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '16px'
  }
};

// Tax bracket data from the screenshots
const federalTaxBrackets = [
  { rate: 0.10, lowerBound: 0 },
  { rate: 0.12, lowerBound: 11925 },
  { rate: 0.22, lowerBound: 48475 },
  { rate: 0.24, lowerBound: 103350 },
  { rate: 0.32, lowerBound: 197300 },
  { rate: 0.35, lowerBound: 250525 },
  { rate: 0.37, lowerBound: 626350 }
];

export default function Week1FederalTax() {
  const { topInputs, deductionChoices, financialCalculations } = useBudget();
  
  // Get taxable income from context (this would be P2 in Excel, referencing 'Week 1 - Summary'!C22)
  const taxableIncome = financialCalculations.taxableIncome || 0;
  
  // Calculate tax bracket applications using exact Excel formulas
  const taxCalculations = useMemo(() => {
    const calculations = federalTaxBrackets.map((bracket, index) => {
      const nextBracket = federalTaxBrackets[index + 1];
      const prevBracket = federalTaxBrackets[index - 1];
      
      // Applied Tax Brackets Tracker (Column Q) - Excel formulas from screenshots
      let appliedTracker = 0;
      if (index === 0) {
        // Q7: =IF(AND($P$2>=P7,$P$2<=P8),2,IF($P$2>P8,1,0))
        if (taxableIncome >= bracket.lowerBound && taxableIncome <= (nextBracket?.lowerBound || Infinity)) {
          appliedTracker = 2;
        } else if (taxableIncome > (nextBracket?.lowerBound || Infinity)) {
          appliedTracker = 1;
        } else {
          appliedTracker = 0;
        }
      } else {
        // Q8-Q13: =IF(SUM($R$7:R7)=1,0,IF(AND($P$2>=P8,$P$2<=P9),2,IF($P$2>P9,IF(P8=$P$13,3,1),0)))
        const sumOfPreviousTrackers = calculations.slice(0, index).reduce((sum, calc) => sum + (calc.tracker2 || 0), 0);
        if (sumOfPreviousTrackers === 1) {
          appliedTracker = 0;
        } else if (taxableIncome >= bracket.lowerBound && taxableIncome <= (nextBracket?.lowerBound || Infinity)) {
          appliedTracker = 2;
        } else if (taxableIncome > (nextBracket?.lowerBound || Infinity)) {
          if (bracket.lowerBound === federalTaxBrackets[federalTaxBrackets.length - 1].lowerBound) {
            appliedTracker = 3;
          } else {
            appliedTracker = 1;
          }
        } else {
          appliedTracker = 0;
        }
      }
      
      // "2" Tracker (Column R) - Excel formulas: =IF(Q7=2,1,0)
      const tracker2 = appliedTracker === 2 ? 1 : 0;
      
      // Federal Income Taxes (Column S) - Excel formulas from screenshots
      let federalTax = 0;
      if (appliedTracker === 1) {
        // =IF(Q7=1,(P8-P7)*O7,...)
        const nextLowerBound = nextBracket?.lowerBound || federalTaxBrackets[federalTaxBrackets.length - 1].lowerBound;
        federalTax = (nextLowerBound - bracket.lowerBound) * bracket.rate;
      } else if (appliedTracker === 2) {
        // =IF(Q7=2,($P$2-P7)*O7,...)
        federalTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (appliedTracker === 3) {
        // =IF(Q7=3,($P$2-$P$13)*$O$13,...)
        const lastBracket = federalTaxBrackets[federalTaxBrackets.length - 1];
        federalTax = (taxableIncome - lastBracket.lowerBound) * lastBracket.rate;
      }
      
      return {
        ...bracket,
        appliedTracker,
        tracker2,
        federalTax
      };
    });
    
    return calculations;
  }, [taxableIncome]);
  
  // Calculate totals
  const totalFederalIncomeTax = taxCalculations.reduce((sum, calc) => sum + calc.federalTax, 0);
  const socialSecurityTax = Math.min(taxableIncome * 0.062, 176100 * 0.062);
  const medicareTax = taxableIncome * 0.0145;
  
  const formatCurrency = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPercent = (num) => (num * 100).toFixed(1) + '%';

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Week 1 - Federal Tax</h2>
      
      {/* Input Section - Cell O2 and P2 */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#002060' }}>User Taxable Income</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: '600' }}>User Taxable Income (O2):</label>
          <input
            style={styles.inputCell}
            type="number"
            value={taxableIncome}
            readOnly
            placeholder="='Week 1 - Summary'!C22"
          />
          <span style={{ color: '#666', fontSize: '12px' }}>
            (P2: ='Week 1 - Summary'!C22)
          </span>
        </div>
      </div>

      {/* Main Federal Tax Calculation Table - Columns O-S */}
      <div style={{ marginBottom: '30px' }}>
        <div style={styles.sectionTitle}>Federal Income Tax Calculation</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tax Rate<br/>(Column O)</th>
              <th style={styles.th}>Lower Bound<br/>(Column P)</th>
              <th style={styles.th}>Applied Tax Brackets Tracker<br/>(Column Q)</th>
              <th style={styles.th}>"2" Tracker<br/>(Column R)</th>
              <th style={styles.th}>Federal Income Taxes<br/>(Column S)</th>
            </tr>
          </thead>
          <tbody>
            {taxCalculations.map((calc, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  <strong>O{index + 7}:</strong> {formatPercent(calc.rate)}
                </td>
                <td style={styles.td}>
                  <strong>P{index + 7}:</strong> {formatCurrency(calc.lowerBound)}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}}>
                  <strong>Q{index + 7}:</strong> {calc.appliedTracker}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}}>
                  <strong>R{index + 7}:</strong> {calc.tracker2}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}}>
                  <strong>S{index + 7}:</strong> {formatCurrency(calc.federalTax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Summary Section - Exact Excel Cell References */}
      <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#002060' }}>Tax Payment Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Total Federal Income Tax</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#002060' }}>
              {formatCurrency(totalFederalIncomeTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <strong>S16:</strong> =SUM($S$7:$S$13)
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Federal Social Security Tax Payment</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#002060' }}>
              {formatCurrency(socialSecurityTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <strong>S18:</strong> =MIN('Week 1 - Summary'!$C$4*$B$20,$B$17)
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Federal Medicare Tax Payment</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#002060' }}>
              {formatCurrency(medicareTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <strong>S20:</strong> =$B$23*'Week 1 - Summary'!$C$4
            </div>
          </div>
        </div>
        
        {/* Additional Excel References */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
          <h4 style={{ marginBottom: '10px', color: '#002060' }}>Key Excel Cell References:</h4>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <div><strong>P2:</strong> ='Week 1 - Summary'!C22 (User Taxable Income)</div>
            <div><strong>B17:</strong> 176100 (Social Security Tax Limit)</div>
            <div><strong>B20:</strong> 0.062 (Social Security Tax %)</div>
            <div><strong>B23:</strong> 0.0145 (Federal Medicare Tax %)</div>
            <div><strong>Week 1 - Summary!$C$4:</strong> Annual income reference</div>
          </div>
        </div>
      </div>
    </div>
  );
}
