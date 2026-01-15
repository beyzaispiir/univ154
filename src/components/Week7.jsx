import React, { useState, useMemo } from 'react';

const Week7 = () => {
  // State for insurance comparison
  const [expectedMedicalExpenses, setExpectedMedicalExpenses] = useState(11000);
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Format number for input display (with commas, preserve decimals for cents)
  const formatNumberForInput = (num) => {
    if (!num || num === '') return '';
    
    // Keep as string to preserve decimal input exactly as user types
    const numStr = num.toString();
    
    // If it's just a decimal point, return it as-is
    if (numStr === '.') return '.';
    
    const number = parseFloat(num);
    if (isNaN(number)) return numStr;
    
    // If it has a decimal point, preserve it exactly (don't force 2 decimals)
    if (numStr.includes('.')) {
      const parts = numStr.split('.');
      const intPart = parts[0] || '';
      const decPart = parts[1] || '';
      
      // If intPart is empty (user typing ".5"), don't format
      if (intPart === '') {
        return '.' + decPart;
      }
      
      // Format integer part with commas, keep decimal part as-is
      const formattedInt = parseInt(intPart).toLocaleString('en-US');
      return decPart ? `${formattedInt}.${decPart}` : formattedInt + '.';
    } else {
      // Whole number - format with commas
      return parseInt(numStr).toLocaleString('en-US');
    }
  };

  // Definitions for tooltips
  const definitions = {
    'Annual Premium': 'Yearly "membership fee" you pay just to have insurance',
    'Deductible': 'Amount you pay first before insurance helps',
    'Coinsurance Rate': 'Percentage of each bill you still pay after deductible',
    'Max Paid Out-of-Pocket': 'Maximum you\'ll ever pay in a year; after that, insurance pays 100%',
    'Employer HSA Contribution': 'Free money from your employer for medical costs',
    'Out-of-Pocket Medical Costs': 'What you actually pay for care in a year',
    'Less Employer HSA Contribution': 'Subtract employer\'s HSA money to see true yearly cost'
  };
  const [hdhpPlan, setHdhpPlan] = useState({
    annualPremium: 6000,
    deductible: 5000,
    coinsuranceRate: 20, // 20% stored as percentage (20)
    maxOutOfPocket: 8000,
    employerHSA: 500,
    // Recommendation values
    annualPremiumRec: 6000,
    deductibleRec: 5000,
    coinsuranceRateRec: 20,
    maxOutOfPocketRec: 8000,
    employerHSARec: 500
  });
  const [normalPlan, setNormalPlan] = useState({
    annualPremium: 8000,
    deductible: 1000,
    coinsuranceRate: 20, // 20% stored as percentage (20)
    maxOutOfPocket: 4000,
    employerHSA: 0,
    // Recommendation values
    annualPremiumRec: 8000,
    deductibleRec: 1000,
    coinsuranceRateRec: 20,
    maxOutOfPocketRec: 4000,
    employerHSARec: 0
  });

  // Calculate costs for each plan using Excel formula: =MIN(C10 + (MAX(C4-C10,0)*(C12/100)), C14)
  // Where: C10=deductible, C4=medicalExpenses, C12=coinsuranceRate, C14=maxOutOfPocket
  const calculatePlanCosts = (plan, medicalExpenses) => {
    if (!plan) {
      return { outOfPocketCosts: 0, totalAnnualCost: 0 };
    }
    
    const { annualPremium, deductible, coinsuranceRate, maxOutOfPocket, employerHSA } = plan;
    
    // Excel formula breakdown:
    // C10 = deductible
    // C4 = medicalExpenses  
    // C12 = coinsuranceRate
    // C14 = maxOutOfPocket
    
    // Calculate coinsurance amount: MAX(C4-C10,0)*(C12/100)
    // Only apply coinsurance if medical expenses exceed deductible
    // Note: coinsuranceRate is 20 (20%), so we divide by 100 to get decimal
    const coinsuranceAmount = Math.max(medicalExpenses - deductible, 0) * (coinsuranceRate / 100);
    
    // Calculate total out-of-pocket: C10 + coinsuranceAmount
    const totalOutOfPocket = deductible + coinsuranceAmount;
    
    // Apply max out-of-pocket limit: MIN(totalOutOfPocket, C14)
    const outOfPocketCosts = Math.min(totalOutOfPocket, maxOutOfPocket);
    
    const totalAnnualCost = annualPremium + outOfPocketCosts - employerHSA;
    
    return {
      outOfPocketCosts,
      totalAnnualCost
    };
  };

  // Memoize calculations to prevent unnecessary recalculations
  const hdhpCosts = useMemo(() => {
    try {
      return calculatePlanCosts(hdhpPlan, expectedMedicalExpenses);
    } catch (error) {
      console.error('Error calculating HDHP costs:', error);
      return { outOfPocketCosts: 0, totalAnnualCost: 0 };
    }
  }, [hdhpPlan, expectedMedicalExpenses]);

  const normalCosts = useMemo(() => {
    try {
      return calculatePlanCosts(normalPlan, expectedMedicalExpenses);
    } catch (error) {
      console.error('Error calculating Normal costs:', error);
      return { outOfPocketCosts: 0, totalAnnualCost: 0 };
    }
  }, [normalPlan, expectedMedicalExpenses]);

  const savings = useMemo(() => {
    return normalCosts.totalAnnualCost - hdhpCosts.totalAnnualCost;
  }, [normalCosts.totalAnnualCost, hdhpCosts.totalAnnualCost]);

  const cheaperPlan = savings > 0 ? 'HDHP Plan' : 'Traditional Plan';

  // Handler functions for save/load using localStorage
  const handleSaveWeek7 = () => {
    try {
      const week7Data = {
        week: 7,
        expectedMedicalExpenses,
        hdhpPlan,
        normalPlan,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('week7_data', JSON.stringify(week7Data));
      alert('✅ Week 7 data saved successfully!');
    } catch (error) {
      console.error('Error saving Week 7 data:', error);
      alert('❌ Error saving Week 7 data. Please try again.');
    }
  };

  const handleLoadWeek7 = () => {
    try {
      const savedData = localStorage.getItem('week7_data');
      if (savedData) {
        const week7Data = JSON.parse(savedData);
        setExpectedMedicalExpenses(week7Data.expectedMedicalExpenses || 11000);
        if (week7Data.hdhpPlan) setHdhpPlan(week7Data.hdhpPlan);
        if (week7Data.normalPlan) setNormalPlan(week7Data.normalPlan);
        alert('✅ Week 7 data loaded successfully!');
      } else {
        alert('ℹ️ No saved data found for Week 7.');
      }
    } catch (error) {
      console.error('Error loading Week 7 data:', error);
      alert('❌ Error loading Week 7 data. Please try again.');
    }
  };

  // Styling matching Week 6 patterns exactly
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontSize: '14px',
      color: '#333',
    },
    sectionContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '30px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    },
    enhancedHeader: {
      backgroundColor: '#002060',
      color: 'white',
      padding: '20px 24px',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '18px',
      textAlign: 'center',
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 32, 96, 0.3)'
    },
    sectionDivider: {
      height: '3px',
      background: 'linear-gradient(90deg, #002060, #ff9500, #002060)',
      margin: '40px 0',
      borderRadius: '2px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      marginTop: 10,
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e0e0e0',
      marginBottom: 18,
    },
    th: {
      backgroundColor: '#002060',
      color: 'white',
      padding: '12px',
      borderBottom: '1px solid #e0e0e0',
      textAlign: 'center',
      fontWeight: 600,
    },
    td: {
      border: '1px solid #e0e0e0',
      padding: '10px 12px',
      verticalAlign: 'middle',
      textAlign: 'center',
    },
    input: {
      width: '100px',
      border: '1px solid #ccc',
      padding: '6px',
      textAlign: 'right',
      backgroundColor: '#fffde7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      fontSize: '13px',
    },
    readOnly: {
      textAlign: 'right',
      paddingRight: '12px',
      color: '#555',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px',
    },
    subHeader: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#002060',
      margin: '18px 0 10px 0',
    },
  };

  return (
    <div>
      {/* CSS Animation for tooltip */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 0.95; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
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

      {/* Tooltip */}
      {hoveredTerm && (
        <div style={{
          position: 'fixed',
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y - 60}px`,
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: '#002060',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          maxWidth: '280px',
          boxShadow: '0 8px 24px rgba(0, 32, 96, 0.4)',
          border: '1px solid #003d82',
          pointerEvents: 'none',
          opacity: 0.95,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {/* Arrow pointing down */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #002060'
          }}></div>
          
          <div style={{ lineHeight: '1.4', fontSize: '12px' }}>{definitions[hoveredTerm]}</div>
        </div>
      )}

      <div style={styles.container}>
        {/* Real Estate Section */}
          <div style={styles.sectionContainer}>
            {/* Enhanced Header */}
            <div style={styles.enhancedHeader}>
              🛡️ Insurance & Risk Management
            </div>
            
          {/* Expected Annual Medical Expenses Input */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e9ecef',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              textAlign: 'center',
              color: '#002060'
            }}>
              Expected Annual Medical Expenses
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="text"
                value={expectedMedicalExpenses ? `$${formatNumberForInput(expectedMedicalExpenses)}` : ''}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/[$,]/g, '');
                  const sanitized = cleanValue.replace(/[^0-9.]/g, '');
                  
                  if (sanitized === '') {
                    setExpectedMedicalExpenses(0);
                    return;
                  }
                  
                  const firstDotIndex = sanitized.indexOf('.');
                  let numericValue = '';
                  
                  if (firstDotIndex === -1) {
                    numericValue = sanitized;
                  } else {
                    const intPart = sanitized.substring(0, firstDotIndex);
                    const decPart = sanitized.substring(firstDotIndex + 1).slice(0, 2);
                    numericValue = intPart + '.' + decPart;
                  }
                  
                  if (sanitized === '.' || (firstDotIndex !== -1 && sanitized.substring(firstDotIndex + 1) === '')) {
                    setExpectedMedicalExpenses(numericValue || 0);
                    return;
                  }
                  
                  const numValue = parseFloat(numericValue) || 0;
                  setExpectedMedicalExpenses(numValue);
                }}
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  width: '150px',
                  backgroundColor: '#fffde7',
                  textAlign: 'right'
                }}
              />
            </div>
          </div>

          {/* Insurance Plan Comparison Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e9ecef',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '8px', 
              textAlign: 'center',
              color: '#002060'
            }}>
              Plan Comparison
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              marginBottom: '16px',
              fontStyle: 'italic'
            }}>
              
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>HDHP Plan</th>
                    <th style={styles.th}>Traditional Plan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td 
                      style={{
                        ...styles.td,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTerm('Annual Premium');
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTerm(null)}
                    >
                      Annual Premium
                      <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px'}}>
                        Reccomendation
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={hdhpPlan.annualPremium ? `$${hdhpPlan.annualPremium}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setHdhpPlan({...hdhpPlan, annualPremium: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${hdhpPlan.annualPremiumRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={normalPlan.annualPremium ? `$${normalPlan.annualPremium}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setNormalPlan({...normalPlan, annualPremium: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${normalPlan.annualPremiumRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td 
                      style={{
                        ...styles.td,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTerm('Deductible');
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTerm(null)}
                    >
                      Deductible
                      <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px'}}>
                        Reccomendation
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={hdhpPlan.deductible ? `$${hdhpPlan.deductible}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setHdhpPlan({...hdhpPlan, deductible: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${hdhpPlan.deductibleRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={normalPlan.deductible ? `$${normalPlan.deductible}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setNormalPlan({...normalPlan, deductible: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${normalPlan.deductibleRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td 
                      style={{
                        ...styles.td,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTerm('Coinsurance Rate');
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTerm(null)}
                    >
                      Coinsurance Rate
                      <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px'}}>
                        Reccomendation
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={hdhpPlan.coinsuranceRate ? `${hdhpPlan.coinsuranceRate}%` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[%,\s]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              const numValue = Number(cleanValue) || 0;
                              if (numValue >= 0 && numValue <= 100) {
                                setHdhpPlan({...hdhpPlan, coinsuranceRate: numValue});
                              }
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          {hdhpPlan.coinsuranceRateRec}%
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={normalPlan.coinsuranceRate ? `${normalPlan.coinsuranceRate}%` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[%,\s]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              const numValue = Number(cleanValue) || 0;
                              if (numValue >= 0 && numValue <= 100) {
                                setNormalPlan({...normalPlan, coinsuranceRate: numValue});
                              }
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          {normalPlan.coinsuranceRateRec}%
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td 
                      style={{
                        ...styles.td,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTerm('Max Paid Out-of-Pocket');
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTerm(null)}
                    >
                      Max Paid Out-of-Pocket
                      <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px'}}>
                        Reccomendation
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={hdhpPlan.maxOutOfPocket ? `$${hdhpPlan.maxOutOfPocket}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setHdhpPlan({...hdhpPlan, maxOutOfPocket: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${hdhpPlan.maxOutOfPocketRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={normalPlan.maxOutOfPocket ? `$${normalPlan.maxOutOfPocket}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setNormalPlan({...normalPlan, maxOutOfPocket: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${normalPlan.maxOutOfPocketRec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td 
                      style={{
                        ...styles.td,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        setHoveredTerm('Employer HSA Contribution');
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredTerm(null)}
                    >
                      Employer HSA Contribution
                      <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px'}}>
                        Reccomendation
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={hdhpPlan.employerHSA ? `$${hdhpPlan.employerHSA}` : ''}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setHdhpPlan({...hdhpPlan, employerHSA: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${hdhpPlan.employerHSARec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <input
                          type="text"
                          value={normalPlan.employerHSA !== undefined ? `$${normalPlan.employerHSA}` : '$0'}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[$,]/g, '');
                            if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
                              setNormalPlan({...normalPlan, employerHSA: Number(cleanValue) || 0});
                            }
                          }}
                          style={styles.input}
                        />
                        <div style={{fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '2px', textAlign: 'right'}}>
                          ${normalPlan.employerHSARec.toLocaleString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          {/* Total Annual Cost Calculation - Clean Design */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e9ecef',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Clean Header */}
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#002060',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Total Annual Cost Calculation
            </div>
            
            {/* Clean Grid Layout */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px'
            }}>
              {/* HDHP Plan Costs - Clean Card */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#002060',
                  marginBottom: '16px'
                }}>
                  HDHP Plan
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Out-of-Pocket Medical Costs:</span>
                  <span style={{ fontWeight: '600', color: '#002060' }}>
                    ${hdhpCosts.outOfPocketCosts.toLocaleString()}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Less Employer HSA Contribution:</span>
                  <span style={{ fontWeight: '600', color: '#28a745' }}>
                    (${hdhpPlan.employerHSA.toLocaleString()})
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Annual Premium:</span>
                  <span style={{ fontWeight: '600', color: '#002060' }}>
                    ${hdhpPlan.annualPremium.toLocaleString()}
                  </span>
                </div>
                
                <div style={{ 
                  borderTop: '1px solid #002060', 
                  paddingTop: '12px', 
                  marginTop: '12px',
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '700',
                  color: '#002060'
                }}>
                  <span>Total Annual Cost:</span>
                  <span>${hdhpCosts.totalAnnualCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Normal Plan Costs - Clean Card */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#002060',
                  marginBottom: '16px'
                }}>
                  Traditional Plan
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Out-of-Pocket Medical Costs:</span>
                  <span style={{ fontWeight: '600', color: '#002060' }}>
                    ${normalCosts.outOfPocketCosts.toLocaleString()}
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Less Employer HSA Contribution:</span>
                  <span style={{ fontWeight: '600', color: '#28a745' }}>
                    (${normalPlan.employerHSA.toLocaleString()})
                  </span>
                </div>
                
                <div style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#495057' }}>Annual Premium:</span>
                  <span style={{ fontWeight: '600', color: '#002060' }}>
                    ${normalPlan.annualPremium.toLocaleString()}
                  </span>
                </div>
                
                <div style={{ 
                  borderTop: '1px solid #002060', 
                  paddingTop: '12px', 
                  marginTop: '12px',
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '700',
                  color: '#002060'
                }}>
                  <span>Total Annual Cost:</span>
                  <span>${normalCosts.totalAnnualCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{
            backgroundColor: savings > 0 ? '#f8f9fa' : '#f8d7da',
            border: `1px solid ${savings > 0 ? '#28a745' : '#dc3545'}`,
            borderRadius: '6px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ 
              margin: '0',
              color: savings > 0 ? '#155724' : '#721c24',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              {savings > 0 ? '' : '❌'} {cheaperPlan} is cheaper by ${Math.abs(savings).toLocaleString()}
            </div>
          </div>

          {/* Note */}
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solidrgb(233, 239, 235)',
            borderRadius: '6px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ 
              margin: '0', 
              color: '#374151', 
              fontWeight: '500', 
              fontSize: '14px'
            }}>
              <strong>Note:</strong> Adjust Week 1 Budget based on this week's insights
            </div>
          </div>
          
          {/* Section Divider */}
          <div style={styles.sectionDivider}></div>

          {/* Save/Load Buttons */}
          <div style={{
            marginTop: '30px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <button
              onClick={handleSaveWeek7}
              style={{
                padding: '12px 24px',
                backgroundColor: '#002060',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#003080'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#002060'}
            >
              💾 Save Week 7 Data
            </button>
            <button
              onClick={handleLoadWeek7}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              📂 Load Week 7 Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Week7;