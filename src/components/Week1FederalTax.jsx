import React, { useState, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { calculateFinancials } from '../utils/taxCalculator';

const styles = {
  container: {
    fontSize: '14px',
    maxWidth: 1400,
    margin: '0 auto',
    padding: '32px 24px',
    backgroundColor: '#fafafa',
    color: '#111827',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 32px 0',
    color: '#111827',
    letterSpacing: '-0.01em',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: 24,
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  th: {
    background: '#0d1a4b',
    color: 'white',
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '13px',
    letterSpacing: '0.01em',
  },
  td: {
    borderBottom: '1px solid #f3f4f6',
    padding: '14px 16px',
    verticalAlign: 'middle',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: 'white',
    transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  inputCell: {
    backgroundColor: '#fffde7',
    border: '1px solid #d1d5db',
    padding: '10px 14px',
    textAlign: 'right',
    borderRadius: '8px',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
  },
  calculatedCell: {
    backgroundColor: '#f9fafb',
    fontWeight: '500',
    color: '#374151',
  },
  summaryCell: {
    backgroundColor: '#f0fdf4',
    fontWeight: '600',
    color: '#166534',
  },
  sectionTitle: {
    background: '#0d1a4b',
    color: 'white',
    padding: '16px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '16px',
    letterSpacing: '0.01em',
  }
};

// Tax bracket data - Updated for 2026 tax year
const federalTaxBrackets = [
  { rate: 0.10, lowerBound: 0 },
  { rate: 0.12, lowerBound: 12400 },
  { rate: 0.22, lowerBound: 50400 },
  { rate: 0.24, lowerBound: 105700 },
  { rate: 0.32, lowerBound: 201775 },
  { rate: 0.35, lowerBound: 256225 },
  { rate: 0.37, lowerBound: 640600 }
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
      
      {/* Input Section - Cell O2 and P2 - Modern Card */}
      <div style={{ 
        marginBottom: '32px', 
        padding: '24px', 
        backgroundColor: 'white', 
        borderRadius: '10px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#111827', fontSize: '18px', fontWeight: '600' }}>User Taxable Income</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>User Taxable Income (O2):</label>
          <input
            style={styles.inputCell}
            type="number"
            value={taxableIncome}
            readOnly
            placeholder="='Week 1 - Summary'!C22"
          />
          <span style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>
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
              <tr 
                key={index}
                onMouseEnter={(e) => {
                  Array.from(e.currentTarget.children).forEach(td => {
                    if (!td.style.backgroundColor.includes('f9fafb')) {
                      td.style.backgroundColor = '#f9fafb';
                    }
                  });
                }}
                onMouseLeave={(e) => {
                  Array.from(e.currentTarget.children).forEach(td => {
                    if (td.style.backgroundColor === '#f9fafb') {
                      td.style.backgroundColor = td.classList.contains('calculated') ? '#f9fafb' : 'white';
                    }
                  });
                }}
              >
                <td style={styles.td}>
                  <strong style={{color: '#0d1a4b'}}>O{index + 7}:</strong> {formatPercent(calc.rate)}
                </td>
                <td style={styles.td}>
                  <strong style={{color: '#0d1a4b'}}>P{index + 7}:</strong> {formatCurrency(calc.lowerBound)}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}} className="calculated">
                  <strong style={{color: '#0d1a4b'}}>Q{index + 7}:</strong> {calc.appliedTracker}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}} className="calculated">
                  <strong style={{color: '#0d1a4b'}}>R{index + 7}:</strong> {calc.tracker2}
                </td>
                <td style={{...styles.td, ...styles.calculatedCell}} className="calculated">
                  <strong style={{color: '#0d1a4b'}}>S{index + 7}:</strong> {formatCurrency(calc.federalTax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Summary Section - Modern Card Design */}
      <div style={{ 
        padding: '32px', 
        backgroundColor: 'white', 
        borderRadius: '10px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        marginTop: '32px'
      }}>
        <h3 style={{ marginBottom: '24px', color: '#111827', fontSize: '20px', fontWeight: '600' }}>Tax Payment Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>Total Federal Income Tax</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#0d1a4b', marginBottom: '8px' }}>
              {formatCurrency(totalFederalIncomeTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontFamily: 'monospace' }}>
              <strong>S16:</strong> =SUM($S$7:$S$13)
            </div>
          </div>
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>Federal Social Security Tax Payment</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#0d1a4b', marginBottom: '8px' }}>
              {formatCurrency(socialSecurityTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontFamily: 'monospace' }}>
              <strong>S18:</strong> =MIN('Week 1 - Summary'!$C$4*$B$20,$B$17)
            </div>
          </div>
          <div style={{ 
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#6b7280' }}>Federal Medicare Tax Payment</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#0d1a4b', marginBottom: '8px' }}>
              {formatCurrency(medicareTax)}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontFamily: 'monospace' }}>
              <strong>S20:</strong> =$B$23*'Week 1 - Summary'!$C$4
            </div>
          </div>
        </div>
        
        {/* Additional Excel References - Modern Info Box */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '10px',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{ marginBottom: '12px', color: '#1e40af', fontSize: '16px', fontWeight: '600' }}>Key Excel Cell References:</h4>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
            <div><strong style={{color: '#1e40af'}}>P2:</strong> ='Week 1 - Summary'!C22 (User Taxable Income)</div>
            <div><strong style={{color: '#1e40af'}}>B17:</strong> 176100 (Social Security Tax Limit)</div>
            <div><strong style={{color: '#1e40af'}}>B20:</strong> 0.062 (Social Security Tax %)</div>
            <div><strong style={{color: '#1e40af'}}>B23:</strong> 0.0145 (Federal Medicare Tax %)</div>
            <div><strong style={{color: '#1e40af'}}>Week 1 - Summary!$C$4:</strong> Annual income reference</div>
          </div>
        </div>
      </div>
    </div>
  );
}
