import React, { useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import stateTaxData from '../data/stateTaxData';

export default function Week1StateTax() {
  const { topInputs, financialCalculations } = useBudget();
  
  // Get taxable income from context (this would be C2 in Excel, referencing 'Week 1 - Summary'!C22)
  const taxableIncome = financialCalculations.taxableIncome || 0;
  
  // Get selected state and NYC residence
  const selectedState = topInputs.location || 'TX';
  const residenceInNYC = topInputs.residenceInNYC === 'Yes';
  
  // Calculate state tax brackets and formulas using exact Excel logic
  const stateTaxCalculations = useMemo(() => {
    const calculations = stateTaxData.map((bracket, index) => {
      const nextBracket = stateTaxData[index + 1];
      const prevBracket = stateTaxData[index - 1];
      
      // State Tracker (Column E) - Excel formula: =IF(B7="Week 1 - Budgeting"!$E$8,1,0)
      const stateTracker = bracket.state === selectedState ? 1 : 0;
      
      // Suggested - Applied Tax Brackets Tracker (Column F)
      // Excel formula: =IF(E7=0,0,IF(AND(B7<>B8,$C$2>$D$7),3,IF($C$2>$D$7,2,1)))
      let suggestedAppliedTracker = 0;
      if (stateTracker === 0) {
        suggestedAppliedTracker = 0;
      } else if (bracket.state !== (nextBracket?.state || '') && taxableIncome > bracket.lowerBound) {
        suggestedAppliedTracker = 3;
      } else if (taxableIncome > bracket.lowerBound) {
        suggestedAppliedTracker = 2;
      } else {
        suggestedAppliedTracker = 1;
      }
      
      // Suggested - "2" Tracker (Column G) - Excel formula: =IF(F7=2,1,0)
      const suggestedTracker2 = suggestedAppliedTracker === 2 ? 1 : 0;
      
      // Suggested - State Income Taxes (Column H)
      // Excel formula: =IF(F7=1,$C$2*$C$7,IF(F7=2,($C$2-$D$7)*$C$7,IF(F7=3,($D$8-$D$7)*$C$7,0)))
      let suggestedStateIncomeTax = 0;
      if (suggestedAppliedTracker === 1) {
        suggestedStateIncomeTax = taxableIncome * bracket.rate;
      } else if (suggestedAppliedTracker === 2) {
        suggestedStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (suggestedAppliedTracker === 3) {
        suggestedStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      }
      
      // User - Applied Tax Brackets Tracker (Column I) - Same as Column F for now
      const userAppliedTracker = suggestedAppliedTracker;
      
      // User - "2" Tracker (Column J) - Excel formula: =IF(I7=2,1,0)
      const userTracker2 = userAppliedTracker === 2 ? 1 : 0;
      
      // User - State Income Taxes (Column K)
      // Excel formula: =IF(I7=1,$C$2*$C$7,IF(I7=2,($C$2-$D$7)*$C$7,IF(I7=3,($D$8-$D$7)*$C$7,0)))
      let userStateIncomeTax = 0;
      if (userAppliedTracker === 1) {
        userStateIncomeTax = taxableIncome * bracket.rate;
      } else if (userAppliedTracker === 2) {
        userStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (userAppliedTracker === 3) {
        userStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      }
      
      // 0 Pretax - Applied Tax Brackets Tracker (Column L)
      // Excel formula: =IF(E7=0,0,IF(AND(B7<>B8,$O$2>$D$7),3,IF($O$2>$D$7,2,1)))
      let pretaxAppliedTracker = 0;
      if (stateTracker === 0) {
        pretaxAppliedTracker = 0;
      } else if (bracket.state !== (nextBracket?.state || '') && taxableIncome > bracket.lowerBound) {
        pretaxAppliedTracker = 3;
      } else if (taxableIncome > bracket.lowerBound) {
        pretaxAppliedTracker = 2;
      } else {
        pretaxAppliedTracker = 1;
      }
      
      // 0 Pretax - "2" Tracker (Column M) - Excel formula: =IF(L7=2,1,0)
      const pretaxTracker2 = pretaxAppliedTracker === 2 ? 1 : 0;
      
      // 0 Pretax - State Income Taxes (Column N)
      // Excel formula: =IF(L7=1,(D8-D7)*C7,IF(L7=2,($O$2-$D$7)*C7,IF(L7=3,($D$8-$D$7)*C7,0)))
      let pretaxStateIncomeTax = 0;
      if (pretaxAppliedTracker === 1) {
        pretaxStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      } else if (pretaxAppliedTracker === 2) {
        pretaxStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (pretaxAppliedTracker === 3) {
        pretaxStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      }
      
      return {
        ...bracket,
        stateTracker,
        suggestedAppliedTracker,
        suggestedTracker2,
        suggestedStateIncomeTax,
        userAppliedTracker,
        userTracker2,
        userStateIncomeTax,
        pretaxAppliedTracker,
        pretaxTracker2,
        pretaxStateIncomeTax,
        rowNumber: index + 7 // Starting from row 7 in Excel
      };
    });
    
    return calculations;
  }, [selectedState, taxableIncome]);
  
  // Calculate totals
  const suggestedTotalStateTax = stateTaxCalculations.reduce((sum, calc) => sum + calc.suggestedStateIncomeTax, 0);
  const userTotalStateTax = stateTaxCalculations.reduce((sum, calc) => sum + calc.userStateIncomeTax, 0);
  const pretaxTotalStateTax = stateTaxCalculations.reduce((sum, calc) => sum + calc.pretaxStateIncomeTax, 0);
  
  // NYC City Tax calculations (if applicable)
  const nycCalculations = useMemo(() => {
    if (selectedState !== 'NY' || !residenceInNYC) {
      return null;
    }
    
    // NYC tax brackets (simplified - would need actual NYC data)
    const nycBrackets = [
      { rate: 0.03078, lowerBound: 0 },
      { rate: 0.03762, lowerBound: 12000 },
      { rate: 0.03819, lowerBound: 25000 },
      { rate: 0.03876, lowerBound: 50000 }
    ];
    
    return nycBrackets.map((bracket, index) => {
      const nextBracket = nycBrackets[index + 1];
      
      // State Tracker for NYC - Excel formula: =IF(AND(B173='Week 1 - Budgeting'!$E$8,'Week 1 - Budgeting'!$E$10="Yes"),1,0)
      const stateTracker = (selectedState === 'NY' && residenceInNYC) ? 1 : 0;
      
      // Suggested - Applied Tax Brackets Tracker (Column F)
      // Excel formula: =IF(E173=0,0,IF(AND(B173<>B174,$C$2>D173),3,IF($C$2>=D174,1,2)))
      let suggestedAppliedTracker = 0;
      if (stateTracker === 0) {
        suggestedAppliedTracker = 0;
      } else if (bracket.lowerBound !== (nextBracket?.lowerBound || Infinity) && taxableIncome > bracket.lowerBound) {
        suggestedAppliedTracker = 3;
      } else if (taxableIncome >= (nextBracket?.lowerBound || Infinity)) {
        suggestedAppliedTracker = 1;
      } else {
        suggestedAppliedTracker = 2;
      }
      
      // Suggested - "2" Tracker (Column G) - Excel formula: =IF(F173=2,1,0)
      const suggestedTracker2 = suggestedAppliedTracker === 2 ? 1 : 0;
      
      // Suggested - State Income Taxes (Column H)
      // Excel formula: =IF(F173=1,(D174-D173)*C173,IF(F173=2,($C$2-D173)*C173,IF(F173=3,($C$2-D173)*C173,0)))
      let suggestedStateIncomeTax = 0;
      if (suggestedAppliedTracker === 1) {
        suggestedStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      } else if (suggestedAppliedTracker === 2) {
        suggestedStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (suggestedAppliedTracker === 3) {
        suggestedStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      }
      
      // User calculations (similar structure)
      const userAppliedTracker = suggestedAppliedTracker;
      const userTracker2 = userAppliedTracker === 2 ? 1 : 0;
      let userStateIncomeTax = 0;
      if (userAppliedTracker === 1) {
        userStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      } else if (userAppliedTracker === 2) {
        userStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (userAppliedTracker === 3) {
        userStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      }
      
      // 0 Pretax calculations (similar structure)
      const pretaxAppliedTracker = suggestedAppliedTracker;
      const pretaxTracker2 = pretaxAppliedTracker === 2 ? 1 : 0;
      let pretaxStateIncomeTax = 0;
      if (pretaxAppliedTracker === 1) {
        pretaxStateIncomeTax = ((nextBracket?.lowerBound || bracket.lowerBound) - bracket.lowerBound) * bracket.rate;
      } else if (pretaxAppliedTracker === 2) {
        pretaxStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      } else if (pretaxAppliedTracker === 3) {
        pretaxStateIncomeTax = (taxableIncome - bracket.lowerBound) * bracket.rate;
      }
      
      return {
        ...bracket,
        stateTracker,
        suggestedAppliedTracker,
        suggestedTracker2,
        suggestedStateIncomeTax,
        userAppliedTracker,
        userTracker2,
        userStateIncomeTax,
        pretaxAppliedTracker,
        pretaxTracker2,
        pretaxStateIncomeTax,
        rowNumber: 173 + index // Starting from row 173 in Excel
      };
    });
  }, [selectedState, residenceInNYC, taxableIncome]);
  
  // Calculate NYC totals
  const suggestedTotalCityTax = nycCalculations?.reduce((sum, calc) => sum + calc.suggestedStateIncomeTax, 0) || 0;
  const userTotalCityTax = nycCalculations?.reduce((sum, calc) => sum + calc.userStateIncomeTax, 0) || 0;
  const pretaxTotalCityTax = nycCalculations?.reduce((sum, calc) => sum + calc.pretaxStateIncomeTax, 0) || 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Week 1 - State Tax</h1>
      
      {/* Taxable Income Input Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '5px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Taxable Income (C2)</h3>
        <p style={{ margin: '0', color: '#6c757d' }}>
          <strong>Formula:</strong> ='Week 1 - Summary'!C22
        </p>
        <p style={{ margin: '5px 0 0 0', color: '#495057' }}>
          <strong>Value:</strong> ${taxableIncome.toLocaleString()}
        </p>
      </div>

      {/* Main State Tax Table */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>State Tax Calculation</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            borderCollapse: 'collapse', 
            width: '100%', 
            fontSize: '12px',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Row</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State (B)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Tax Rate (C)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Lower Bound (D)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State Tracker (E)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Suggested Applied Tracker (F)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Suggested "2" Tracker (G)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Suggested State Income Taxes (H)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>User Applied Tracker (I)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>User "2" Tracker (J)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>User State Income Taxes (K)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>0 Pretax Applied Tracker (L)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>0 Pretax "2" Tracker (M)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>0 Pretax State Income Taxes (N)</th>
              </tr>
            </thead>
            <tbody>
              {stateTaxCalculations.slice(0, 20).map((calc, index) => (
                <tr key={index} style={{ backgroundColor: calc.stateTracker ? '#e8f5e8' : '#f8f9fa' }}>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                    {calc.rowNumber}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.state}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {(calc.rate * 100).toFixed(2)}%
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${calc.lowerBound.toLocaleString()}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.stateTracker}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.suggestedAppliedTracker}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.suggestedTracker2}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${calc.suggestedStateIncomeTax.toFixed(2)}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.userAppliedTracker}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.userTracker2}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${calc.userStateIncomeTax.toFixed(2)}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.pretaxAppliedTracker}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {calc.pretaxTracker2}
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${calc.pretaxStateIncomeTax.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
            Showing first 20 rows. Total rows: {stateTaxCalculations.length}
          </p>
        </div>
      </div>

      {/* Totals Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Tax Totals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Suggested - Total State Taxes</h4>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
              ${suggestedTotalStateTax.toFixed(2)}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
              Formula: =SUM($H$7:$H$167)
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>User - Total State Taxes</h4>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
              ${userTotalStateTax.toFixed(2)}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
              Formula: =SUM($K$7:$K$167)
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>0 Pretax - Total State Taxes</h4>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#6f42c1' }}>
              ${pretaxTotalStateTax.toFixed(2)}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
              Formula: =SUM($N$7:$N$167)
            </p>
          </div>
        </div>
      </div>

      {/* NYC City Tax Section (if applicable) */}
      {selectedState === 'NY' && residenceInNYC && nycCalculations && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>2025 NY City Data</h2>
          
          {/* NYC Suggested Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>Suggested - City Tax Calculation</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                borderCollapse: 'collapse', 
                width: '100%', 
                fontSize: '12px',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Row</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State Tracker (E)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Applied Tracker (F)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>"2" Tracker (G)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State Income Taxes (H)</th>
                  </tr>
                </thead>
                <tbody>
                  {nycCalculations.map((calc, index) => (
                    <tr key={index} style={{ backgroundColor: '#e8f5e8' }}>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                        {calc.rowNumber}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.stateTracker}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.suggestedAppliedTracker}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.suggestedTracker2}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                        ${calc.suggestedStateIncomeTax.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NYC User Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>User - City Tax Calculation</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                borderCollapse: 'collapse', 
                width: '100%', 
                fontSize: '12px',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Row</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Applied Tracker (K)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>"2" Tracker (L)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State Income Taxes (M)</th>
                  </tr>
                </thead>
                <tbody>
                  {nycCalculations.map((calc, index) => (
                    <tr key={index} style={{ backgroundColor: '#e8f5e8' }}>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                        {calc.rowNumber}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.userAppliedTracker}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.userTracker2}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                        ${calc.userStateIncomeTax.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NYC 0 Pretax Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>0 Pretax - City Tax Calculation</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                borderCollapse: 'collapse', 
                width: '100%', 
                fontSize: '12px',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Row</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Applied Tracker (O)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>"2" Tracker (P)</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>State Income Taxes (Q)</th>
                  </tr>
                </thead>
                <tbody>
                  {nycCalculations.map((calc, index) => (
                    <tr key={index} style={{ backgroundColor: '#e8f5e8' }}>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                        {calc.rowNumber}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.pretaxAppliedTracker}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {calc.pretaxTracker2}
                      </td>
                      <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>
                        ${calc.pretaxStateIncomeTax.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NYC Totals */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#495057', marginBottom: '15px' }}>NYC City Tax Totals</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                border: '1px solid #dee2e6',
                borderRadius: '5px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Suggested - Total City Taxes</h4>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  ${suggestedTotalCityTax.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                  Formula: =SUM(H173:H176)
                </p>
              </div>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                border: '1px solid #dee2e6',
                borderRadius: '5px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>User - Total City Taxes</h4>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  ${userTotalCityTax.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                  Formula: =SUM(M173:M176)
                </p>
              </div>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                border: '1px solid #dee2e6',
                borderRadius: '5px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>0 Pretax - Total City Taxes</h4>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#6f42c1' }}>
                  ${pretaxTotalCityTax.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                  Formula: =SUM(Q173:Q176)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Reference Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        marginTop: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Key Excel Formulas Implemented</h3>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          <p><strong>State Tracker (E):</strong> =IF(B7="Week 1 - Budgeting"!$E$8,1,0)</p>
          <p><strong>Suggested Applied Tracker (F):</strong> =IF(E7=0,0,IF(AND(B7&lt;&gt;B8,$C$2&gt;$D$7),3,IF($C$2&gt;$D$7,2,1)))</p>
          <p><strong>Suggested "2" Tracker (G):</strong> =IF(F7=2,1,0)</p>
          <p><strong>Suggested State Income Taxes (H):</strong> =IF(F7=1,$C$2*$C$7,IF(F7=2,($C$2-$D$7)*$C$7,IF(F7=3,($D$8-$D$7)*$C$7,0)))</p>
          <p><strong>NYC State Tracker (E):</strong> =IF(AND(B173='Week 1 - Budgeting'!$E$8,'Week 1 - Budgeting'!$E$10="Yes"),1,0)</p>
          <p><strong>Taxable Income (C2):</strong> ='Week 1 - Summary'!C22</p>
        </div>
      </div>
    </div>
  );
}
