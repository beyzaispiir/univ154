import React, { useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';

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
    textAlign: 'left'
  },
  tdValue: {
    textAlign: 'right',
    fontWeight: '500'
  },
  calculatedCell: {
    backgroundColor: '#f5f5f5',
    fontWeight: '500'
  },
  sectionTitle: {
    backgroundColor: '#002060',
    color: 'white',
    padding: '12px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '16px'
  },
  sectionHeader: {
    backgroundColor: '#e8f5e9',
    fontWeight: '600',
    textAlign: 'center'
  },
  formulaNote: {
    fontSize: '10px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '2px'
  }
};

export default function Week1Summary() {
  const { topInputs, deductionChoices, financialCalculations, summaryCalculations, userInputs } = useBudget();
  
  const formatCurrency = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Week 1 - Summary</h2>
      
      {/* Main Summary Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Suggested</th>
            <th style={styles.th}>Value</th>
            <th style={styles.th}></th>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Value</th>
          </tr>
        </thead>
        <tbody>
          {/* Row 2: Headers */}
          <tr>
            <td style={{...styles.td, ...styles.sectionHeader}}>B2: Suggested</td>
            <td style={styles.td}></td>
            <td style={styles.td}></td>
            <td style={{...styles.td, ...styles.sectionHeader}}>E2: User</td>
            <td style={styles.td}></td>
          </tr>
          
          {/* Row 4: Pre-tax Income */}
          <tr>
            <td style={styles.td}><strong>B4:</strong> Pre-tax Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C4:</strong> {formatCurrency(summaryCalculations.preTaxIncome)}
              <div style={styles.formulaNote}>= 'Week 1 - Budgeting'!$E$6</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E4:</strong> Pre-tax Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F4:</strong> {formatCurrency(summaryCalculations.preTaxIncome)}
              <div style={styles.formulaNote}>= 'Week 1 - Budgeting'!$E$6</div>
            </td>
          </tr>
          
          {/* Row 6: Standard Deduction */}
          <tr>
            <td style={styles.td}><strong>B6:</strong> Standard Deduction (Single Filers 2025)</td>
            <td style={{...styles.td, ...styles.tdValue}}>
              <strong>C6:</strong> {formatCurrency(summaryCalculations.standardDeduction)}
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E6:</strong> Standard Deduction (Single Filers 2025)</td>
            <td style={{...styles.td, ...styles.tdValue}}>
              <strong>F6:</strong> {formatCurrency(summaryCalculations.standardDeduction)}
            </td>
          </tr>
          
          {/* Row 7: Pre-Tax Expenses */}
          <tr>
            <td style={styles.td}><strong>B7:</strong> Pre-Tax Expenses</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C7:</strong> {formatCurrency(summaryCalculations.suggestedPreTaxExpenses)}
              <div style={styles.formulaNote}>= (('Week 1 - Budgeting'!$G$28+'Week 1 - Budgeting'!$G$38)*12)</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E7:</strong> Pre-Tax Expenses</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F7:</strong> {formatCurrency(summaryCalculations.userPreTaxExpenses)}
              <div style={styles.formulaNote}>= (('Week 1 - Budgeting'!$E$28+'Week 1 - Budgeting'!$E$38)*12)</div>
            </td>
          </tr>
          
          {/* Row 9: Taxable Income */}
          <tr>
            <td style={styles.td}><strong>B9:</strong> Taxable Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C9:</strong> {formatCurrency(summaryCalculations.suggestedTaxableIncome)}
              <div style={styles.formulaNote}>= C4-C6-C7</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E9:</strong> Taxable Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F9:</strong> {formatCurrency(summaryCalculations.userTaxableIncome)}
              <div style={styles.formulaNote}>= F4-F6-F7</div>
            </td>
          </tr>
          
          {/* Row 11: Federal Income Tax Payment */}
          <tr>
            <td style={styles.td}><strong>B11:</strong> Federal Income Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C11:</strong> {formatCurrency(summaryCalculations.suggestedFederalIncomeTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!G16</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E11:</strong> Federal Income Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F11:</strong> {formatCurrency(summaryCalculations.userFederalIncomeTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!M16</div>
            </td>
          </tr>
          
          {/* Row 12: Federal Social Security Tax Payment */}
          <tr>
            <td style={styles.td}><strong>B12:</strong> Federal Social Security Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C12:</strong> {formatCurrency(summaryCalculations.suggestedSocialSecurityTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!G18</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E12:</strong> Federal Social Security Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F12:</strong> {formatCurrency(summaryCalculations.userSocialSecurityTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!M18</div>
            </td>
          </tr>
          
          {/* Row 13: Federal Medicare Tax Payment */}
          <tr>
            <td style={styles.td}><strong>B13:</strong> Federal Medicare Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C13:</strong> {formatCurrency(summaryCalculations.suggestedMedicareTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!G20</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E13:</strong> Federal Medicare Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F13:</strong> {formatCurrency(summaryCalculations.userMedicareTax)}
              <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!M20</div>
            </td>
          </tr>
          
          {/* Row 15: State Income Tax Payment */}
          <tr>
            <td style={styles.td}><strong>B15:</strong> State Income Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C15:</strong> {formatCurrency(summaryCalculations.suggestedStateIncomeTax)}
              <div style={styles.formulaNote}>= 'Week 1 - State Tax'!H169</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E15:</strong> State Income Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F15:</strong> {formatCurrency(summaryCalculations.userStateIncomeTax)}
              <div style={styles.formulaNote}>= 'Week 1 - State Tax'!$L$169</div>
            </td>
          </tr>
          
          {/* Row 16: New York City Tax Payment */}
          <tr>
            <td style={styles.td}><strong>B16:</strong> New York City Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>C16:</strong> {formatCurrency(summaryCalculations.suggestedNYCTax)}
              <div style={styles.formulaNote}>= 'Week 1 - State Tax'!H178</div>
            </td>
            <td style={styles.td}></td>
            <td style={styles.td}><strong>E16:</strong> New York City Tax Payment</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
              <strong>F16:</strong> {formatCurrency(summaryCalculations.userNYCTax)}
              <div style={styles.formulaNote}>= 'Week 1 - State Tax'!M178</div>
            </td>
          </tr>
          
          {/* Row 18: After Tax Income - CRITICAL CELLS */}
          <tr style={{ backgroundColor: '#e8f5e9' }}>
            <td style={{...styles.td, fontWeight: '600'}}><strong>B18:</strong> After Tax Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell, fontWeight: '700', fontSize: '16px'}}>
              <strong>C18:</strong> {formatCurrency(summaryCalculations.suggestedAfterTaxIncome)}
              <div style={styles.formulaNote}>= MAX(C9-SUM(C11:C16)+C6,0)</div>
            </td>
            <td style={styles.td}></td>
            <td style={{...styles.td, fontWeight: '600'}}><strong>E18:</strong> After Tax Income</td>
            <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell, fontWeight: '700', fontSize: '16px'}}>
              <strong>F18:</strong> {formatCurrency(summaryCalculations.userAfterTaxIncome)}
              <div style={styles.formulaNote}>= MAX(F9-SUM(F11:F16)+F6,0)</div>
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* 0 Pretax Expenses Section */}
      <div style={{ marginTop: '30px' }}>
        <div style={styles.sectionTitle}>0 Pretax Expenses Section</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{...styles.td, ...styles.sectionHeader}}><strong>B20:</strong> 0 Pretax Expenses</td>
              <td style={styles.td}></td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B22:</strong> Taxable Income</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C22:</strong> {formatCurrency(summaryCalculations.zeroPretaxTaxableIncome)}
                <div style={styles.formulaNote}>= C4-C6</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B24:</strong> Federal Income Tax Payment</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C24:</strong> {formatCurrency(summaryCalculations.suggestedFederalIncomeTax)}
                <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!T16</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B25:</strong> Federal Social Security Tax Payment</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C25:</strong> {formatCurrency(summaryCalculations.suggestedSocialSecurityTax)}
                <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!T18</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B26:</strong> Federal Medicare Tax Payment</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C26:</strong> {formatCurrency(summaryCalculations.suggestedMedicareTax)}
                <div style={styles.formulaNote}>= 'Week 1 - Federal Tax'!T20</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B28:</strong> State Income Tax Payment</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C28:</strong> {formatCurrency(summaryCalculations.suggestedStateIncomeTax)}
                <div style={styles.formulaNote}>= 'Week 1 - State Tax'!$P$169</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B29:</strong> New York City Tax Payment</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C29:</strong> {formatCurrency(summaryCalculations.suggestedNYCTax)}
                <div style={styles.formulaNote}>= 'Week 1 - State Tax'!Q178</div>
              </td>
            </tr>
            
            <tr>
              <td style={styles.td}><strong>B31:</strong> After Tax Income</td>
              <td style={{...styles.td, ...styles.tdValue, ...styles.calculatedCell}}>
                <strong>C31:</strong> {formatCurrency(summaryCalculations.suggestedAfterTaxIncome)}
                <div style={styles.formulaNote}>= MAX(C22-SUM(C24:C29)+C6,0)</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Key Cell References for Other Sheets */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#002060' }}>Critical Cell References for Other Sheets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#002060', marginBottom: '10px' }}>Referenced by Budgeting Sheet:</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div><strong>C18:</strong> Suggested After Tax Income → Monthly Income formulas</div>
              <div><strong>F18:</strong> User After Tax Income → Monthly Income formulas</div>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#002060', marginBottom: '10px' }}>Referenced by Federal Tax Sheet:</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div><strong>C4:</strong> Pre-tax Income → Social Security/Medicare calculations</div>
              <div><strong>C22:</strong> 0 Pretax Expenses Taxable Income → User Taxable Income</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
