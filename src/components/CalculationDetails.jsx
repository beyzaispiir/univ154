import React from 'react';
import { useBudget } from '../contexts/BudgetContext';

const styles = {
  container: { fontFamily: 'Arial, sans-serif', maxWidth: 900, margin: '0 auto', padding: 24, backgroundColor: '#fdfdfd', fontSize: '14px', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 20 },
  td: { border: '1px solid #bfbfbf', padding: '8px', verticalAlign: 'middle' },
  labelCell: { width: '40%' },
  valueCell: { width: '20%', textAlign: 'right' },
  totalRow: { backgroundColor: '#e7e6e6', fontWeight: 'bold' },
};

const formatCurrency = (num, showNegativeInParentheses = false) => {
  if (showNegativeInParentheses && num < 0) {
    return `(${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  }
  if (num === 0) return '-';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CalculationDetails() {
  const { financialCalculations } = useBudget();
  const {
    preTaxIncome,
    standardDeduction,
    taxableIncome,
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    stateIncomeTax,
    afterTaxIncome,
    totalTax
  } = financialCalculations;

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Calculation Details</h2>
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Pre-tax Income</td>
            <td style={styles.td}>$</td>
            <td style={{...styles.td, ...styles.valueCell}}>{formatCurrency(preTaxIncome)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Standard Deduction (Single Filers 2025)</td>
            <td style={styles.td}>$</td>
            <td style={{...styles.td, ...styles.valueCell}}>{formatCurrency(standardDeduction)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Taxable Income</td>
            <td style={{...styles.td, ...styles.valueCell}} colSpan="2">{formatCurrency(taxableIncome, true)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Federal Income Tax Payment</td>
            <td style={{...styles.td, ...styles.valueCell}} colSpan="2">{formatCurrency(federalIncomeTax, true)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Federal Social Security Tax Payment</td>
            <td style={{...styles.td, ...styles.valueCell}} colSpan="2">{formatCurrency(socialSecurityTax, true)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, ...styles.labelCell}}>Federal Medicare Tax Payment</td>
            <td style={{...styles.td, ...styles.valueCell}} colSpan="2">{formatCurrency(medicareTax, true)}</td>
          </tr>
           <tr>
            <td style={{...styles.td, ...styles.labelCell}}>State Income Tax Payment</td>
             <td style={{...styles.td, ...styles.valueCell}} colSpan="2">{formatCurrency(stateIncomeTax)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, ...styles.labelCell}}>After Tax Income</td>
            <td style={styles.td}>$</td>
            <td style={{...styles.td, ...styles.valueCell}}>{formatCurrency(afterTaxIncome)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 