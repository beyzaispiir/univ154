import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useBudget } from '../contexts/BudgetContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Week3CreditCard = () => {
  // Get save/load functions from context
  const { saveBudgetData, loadBudgetData } = useBudget();
  
  // State for user inputs (yellow cells) - Default values from Excel
  const [debtAmount, setDebtAmount] = useState('10000');
  const [annualInterestRate, setAnnualInterestRate] = useState('24.35');
  const [userPayment, setUserPayment] = useState('290');
  
  // State for General Loans section
  const [generalLoanAmount, setGeneralLoanAmount] = useState('50000');
  const [generalAnnualRate, setGeneralAnnualRate] = useState('0.08');
  const [generalTerm, setGeneralTerm] = useState('60');

  // Calculated values
  // Minimum payment = Interest for Month 1 (Week 3.1 B - AM Table!E4)
  const monthlyRate = (parseFloat(annualInterestRate) || 0) / 100 / 12;
  const minimumPayment = Math.round(((parseFloat(debtAmount) || 0) * monthlyRate) * 100) / 100;

  // Handler functions for save/load
  const handleSaveWeek3 = async () => {
    try {
      const week3Data = {
        debtAmount,
        annualInterestRate,
        userPayment,
        generalLoanAmount,
        generalAnnualRate,
        generalTerm
      };
      
      const result = await saveBudgetData(week3Data, {}, {});
      if (result.success) {
        alert('Week 3 data saved successfully! 💾');
      } else {
        alert('Error saving Week 3 data: ' + result.error);
      }
    } catch (error) {
      alert('Error saving Week 3 data: ' + error.message);
    }
  };

  const handleLoadWeek3 = async () => {
    try {
      const result = await loadBudgetData();
      if (result.success && result.data) {
        // Load Week 3 specific data from user_inputs
        if (result.data.user_inputs) {
          if (result.data.user_inputs.debtAmount) setDebtAmount(result.data.user_inputs.debtAmount);
          if (result.data.user_inputs.annualInterestRate) setAnnualInterestRate(result.data.user_inputs.annualInterestRate);
          if (result.data.user_inputs.userPayment) setUserPayment(result.data.user_inputs.userPayment);
          if (result.data.user_inputs.generalLoanAmount) setGeneralLoanAmount(result.data.user_inputs.generalLoanAmount);
          if (result.data.user_inputs.generalAnnualRate) setGeneralAnnualRate(result.data.user_inputs.generalAnnualRate);
          if (result.data.user_inputs.generalTerm) setGeneralTerm(result.data.user_inputs.generalTerm);
        }
        
        alert('Week 3 data loaded successfully! 📁');
      } else {
        alert('No saved Week 3 data found or error loading: ' + (result.error || 'No data'));
      }
    } catch (error) {
      alert('Error loading Week 3 data: ' + error.message);
    }
  };

  // General Loans amortization calculation (Week 3.2 B - AM Table)
  const calculateGeneralLoanAmortization = () => {
    const principal = parseFloat(generalLoanAmount) || 0;
    const monthlyRate = (parseFloat(generalAnnualRate) || 0) / 12;
    const numPayments = parseInt(generalTerm) || 0;

    if (principal <= 0 || monthlyRate <= 0 || numPayments <= 0) {
      return { amortizationTable: [], summary: { interestPaid: 0, principalPaid: 0, totalAmountPaid: 0 } };
    }

    // Calculate monthly payment using PMT formula
    // PMT(rate, nper, pv, fv) = PMT(monthlyRate, numPayments, -principal, 0)
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    const amortizationTable = [];
    let loanAmount = principal;
    let isPaidOff = false;
    let month = 1;

    while (!isPaidOff && month <= 600) { // Max 50 years (Excel limit)
      const interest = loanAmount * monthlyRate;
      
      // First month: use full PMT, subsequent months: MIN(PMT, balance + interest)
      const actualPayment = month === 1 ? monthlyPayment : Math.min(monthlyPayment, loanAmount + interest);
      const principalPayment = actualPayment - interest;
      const balance = loanAmount - principalPayment;
      const zeroCounter = Math.abs(balance) <= 0.01 ? 1 : 0;

      amortizationTable.push({
        month,
        loanAmount: loanAmount,
        payment: actualPayment,
        interest: interest,
        principal: principalPayment,
        balance: balance,
        zeroCounter: zeroCounter,
        isPaidOff: zeroCounter === 1
      });

      if (zeroCounter === 1) {
        isPaidOff = true;
      } else {
        loanAmount = balance;
        month++;
      }
    }

    const totalInterest = amortizationTable.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = amortizationTable.reduce((sum, row) => sum + row.principal, 0);
    const totalAmountPaid = amortizationTable.reduce((sum, row) => sum + row.payment, 0);

    return {
      amortizationTable,
      summary: {
        interestPaid: totalInterest,
        principalPaid: totalPrincipal,
        totalAmountPaid: totalAmountPaid
      }
    };
  };

  // Amortization calculation functions
  const calculateUserPaymentAmortization = () => {
    const principal = parseFloat(debtAmount) || 0;
    const monthlyRate = (parseFloat(annualInterestRate) || 0) / 100 / 12;
    const payment = parseFloat(userPayment) || 0;
    
    if (principal <= 0 || monthlyRate <= 0 || payment <= 0) {
      return { amortizationTable: [], summary: { interestPaid: 0, principalPaid: 0, totalAmountPaid: 0 } };
    }

    const amortizationTable = [];
    let month = 1;
    let loanAmount = principal; // C4: Initial loan amount
    let isPaidOff = false;

    while (!isPaidOff && month <= 600) { // Max 50 years (Excel limit)
      // Calculate interest: E4 = C4 * (Annual Interest Rate / 12)
      const interest = loanAmount * monthlyRate;
      
      // Calculate payment: D4 = User Payment (first month), D5+ = MIN(User Payment, Current Balance + Current Interest)
      // Excel: D5 = MIN('Week 3.1 - Credit Card Debt'!$G$7,G4+E5) where G4 is previous balance, E5 is current interest
      // Allow negative principal as per Excel logic
      const actualPayment = month === 1 ? payment : Math.min(payment, loanAmount + interest);
      
      // Calculate principal: F4 = D4 - E4
      const principalPayment = actualPayment - interest;
      
      // Calculate balance: G4 = C4 - F4
      const balance = loanAmount - principalPayment;
      
      // Check if paid off: H4 = IF(G4=ROUND(0,2),1,0)
      const zeroCounter = Math.abs(balance) <= 0.01 ? 1 : 0;
      
      amortizationTable.push({
        month,
        loanAmount: loanAmount, // C4, C5, etc.
        payment: actualPayment, // D4, D5, etc.
        interest: interest, // E4, E5, etc.
        principal: principalPayment, // F4, F5, etc.
        balance: balance, // G4, G5, etc.
        zeroCounter: zeroCounter, // H4, H5, etc.
        isPaidOff: zeroCounter === 1
      });

      if (zeroCounter === 1) {
        isPaidOff = true;
      } else {
        // Next month's loan amount: C5 = G4 (previous balance)
        loanAmount = balance;
        month++;
      }
    }

    // Calculate totals by summing all values from the amortization table (like =SUM('Week 3.1 B - AM Table'!E607:E1048576))
    const totalInterest = amortizationTable.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = amortizationTable.reduce((sum, row) => sum + row.principal, 0);
    const totalAmountPaid = amortizationTable.reduce((sum, row) => sum + row.payment, 0);

    return {
      amortizationTable,
      summary: {
        interestPaid: totalInterest,
        principalPaid: totalPrincipal,
        totalAmountPaid: totalAmountPaid
      }
    };
  };

  const calculateMinimumPaymentAmortization = () => {
    const principal = parseFloat(debtAmount) || 0;
    const monthlyRate = (parseFloat(annualInterestRate) || 0) / 100 / 12;
    const minPayment = minimumPayment;
    
    if (principal <= 0 || monthlyRate <= 0 || minPayment <= 0) {
      return { amortizationTable: [], summary: { interestPaid: 0, principalPaid: 0, totalAmountPaid: 0 } };
    }

    const amortizationTable = [];
    let month = 1;
    let loanAmount = principal; // C4: Initial loan amount
    let isPaidOff = false;

    while (!isPaidOff && month <= 600) { // Max 50 years (Excel limit)
      // Calculate interest: O4 = MIN(N4, M4 * (Annual Interest Rate / 12))
      // Excel: O4 = MIN(N4,M4*('Week 3.1 - Credit Card Debt'!$C$7/12))
      const calculatedInterest = loanAmount * monthlyRate;
      
      // Calculate payment: N4 = Minimum Payment (first month), N5+ = MIN(Minimum Payment, Previous Balance + Current Interest)
      // Excel: N5 = MIN('Week 3.1 - Credit Card Debt'!$G$5,Q4+M4*('Week 3.1 - Credit Card Debt'!$C$7/12))
      const actualPayment = month === 1 ? minPayment : Math.min(minPayment, loanAmount + calculatedInterest);
      
      // Calculate interest paid: O4 = MIN(N4, M4 * (Annual Interest Rate / 12))
      const interestPaid = Math.min(actualPayment, calculatedInterest);
      
      // Calculate principal: P4 = MAX(N4-O4,0)
      // Excel: P4 = MAX(N4-O4,0) - never negative!
      const principalPayment = Math.max(actualPayment - interestPaid, 0);
      
      // Calculate balance: Q4 = M4 - P4
      const balance = loanAmount - principalPayment;
      
      // Check if paid off: R4 = IF(Q4=ROUND(0,2),1,0)
      const zeroCounter = Math.abs(balance) <= 0.01 ? 1 : 0;
      
      amortizationTable.push({
        month,
        loanAmount: loanAmount, // M4, M5, etc.
        payment: actualPayment, // N4, N5, etc.
        interest: interestPaid, // O4, O5, etc.
        principal: principalPayment, // P4, P5, etc.
        balance: balance, // Q4, Q5, etc.
        zeroCounter: zeroCounter, // R4, R5, etc.
        isPaidOff: zeroCounter === 1
      });

      if (zeroCounter === 1) {
        isPaidOff = true;
      } else {
        // Next month's loan amount: C5 = G4 (previous balance)
        loanAmount = balance;
        month++;
      }
    }

    // Calculate totals by summing all values from the amortization table (like =SUM('Week 3.1 B - AM Table'!E607:E1048576))
    const totalInterest = amortizationTable.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = amortizationTable.reduce((sum, row) => sum + row.principal, 0);
    const totalAmountPaid = amortizationTable.reduce((sum, row) => sum + row.payment, 0);

    return {
      amortizationTable,
      summary: {
        interestPaid: totalInterest,
        principalPaid: totalPrincipal,
        totalAmountPaid: totalAmountPaid
      }
    };
  };

  // Calculate amortization data
  const userPaymentData = calculateUserPaymentAmortization();
  const minimumPaymentData = calculateMinimumPaymentAmortization();
  const generalLoanData = calculateGeneralLoanAmortization();


  // Styling matching Week 1 and Week 2 patterns exactly
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionDivider: {
      height: '3px',
      background: 'linear-gradient(90deg, #002060, #ff9500, #002060)',
      margin: '40px 0',
      borderRadius: '2px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
    inputSection: {
      backgroundColor: 'white',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      marginBottom: '8px',
      maxWidth: '100%'
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    inputColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    inputLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      minWidth: '100px'
    },
    input: {
      width: '120px',
      border: '1px solid #ccc',
      padding: '8px',
      textAlign: 'right',
      backgroundColor: '#fffde7', // Yellow background for editable fields
      borderRadius: '6px',
      boxSizing: 'border-box',
      fontWeight: '600',
      fontSize: '12px'
    },
    readOnlyInput: {
      width: '120px',
      border: '1px solid #ccc',
      padding: '8px 12px',
      textAlign: 'right',
      backgroundColor: '#f5f5f5', // Gray background for read-only
      borderRadius: '6px',
      boxSizing: 'border-box',
      fontSize: '14px',
      fontWeight: '600',
      color: '#555'
    },
    calculatedValue: {
      width: '120px',
      textAlign: 'right',
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      padding: '8px 0px'
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '36px',
      maxWidth: '100%'
    },
    leftSection: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    rightSection: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '0',
      paddingTop: '0'
    },
    summaryCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #e9ecef',
      marginTop: '0',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    summaryCardEnhanced: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #e9ecef',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    summaryCardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '2px solid #f1f3f4'
    },
    summaryCardIcon: {
      width: '24px',
      height: '24px',
      marginRight: '8px',
      color: '#002060'
    },
    summaryTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      margin: '0',
      textAlign: 'center'
    },
    chartsSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
      maxWidth: '100%'
    },
    chartCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '2px solid #e9ecef',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    chartCardEnhanced: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '2px solid #e9ecef',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
      marginBottom: '20px',
      position: 'relative'
    },
    chartHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #f1f3f4'
    },
    chartIcon: {
      width: '20px',
      height: '20px',
      marginRight: '8px',
      color: '#002060'
    },
    chartTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      margin: '0',
      textAlign: 'center'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '12px',
      textAlign: 'center'
    },
    summaryTable: {
      marginBottom: '12px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #e0e0e0'
    },
    summaryLabel: {
      fontSize: '14px',
      color: '#666'
    },
    summaryValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060'
    },
    chartContainer: {
      height: '200px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      marginTop: '8px'
    },
    note: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#374151',
      fontWeight: '500'
    },
    // General Loans Section Styles
    generalLoansSection: {
      marginBottom: '20px'
    },
    generalLoansHeader: {
      backgroundColor: '#002060',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '10px'
    },
    generalLoansContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px'
    },
    ratesTable: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    ratesTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '12px',
      textAlign: 'center'
    },
    ratesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    rateItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #e0e0e0'
    },
    rateLabel: {
      fontSize: '14px',
      color: '#666'
    },
    rateValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060'
    },
    loanDetails: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    loanDetailsTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '12px',
      textAlign: 'center'
    },
    loanDetailsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    loanDetailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #e0e0e0'
    },
    loanDetailLabel: {
      fontSize: '14px',
      color: '#666'
    },
    loanInput: {
      width: '120px',
      border: '1px solid #ccc',
      padding: '8px',
      textAlign: 'right',
      backgroundColor: '#fffde7',
      borderRadius: '6px',
      fontWeight: '600',
      boxSizing: 'border-box',
      fontSize: '12px'
    },
    paymentSummary: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    paymentSummaryTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '12px',
      textAlign: 'center'
    },
    paymentSummaryList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    paymentSummaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #e0e0e0'
    },
    paymentSummaryLabel: {
      fontSize: '14px',
      color: '#666'
    },
    paymentSummaryValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060'
    }
  };

  return (
    <div style={styles.container}>
      {/* Credit Card Section */}
      <div style={styles.sectionContainer}>
        {/* Enhanced Header */}
        <div style={styles.enhancedHeader}>
          💳 Credit Card Debt Management
          </div>

      {/* Main Content - Left and Right Layout like Excel */}
      <div style={styles.mainLayout}>
        {/* Left Side: Input Parameters */}
        <div style={styles.leftSection}>
          <div style={styles.inputSection}>
            <div style={styles.inputGrid}>
              {/* Left Column */}
              <div style={styles.inputColumn}>
                <div style={styles.inputRow}>
                  <div style={styles.inputLabel}>Amount of Credit Card Debt</div>
                  <input
                    type="text"
                    value={debtAmount ? `$${parseFloat(debtAmount).toLocaleString('en-US')}` : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[$,]/g, '');
                      setDebtAmount(value);
                    }}
                    style={styles.input}
                    placeholder="$Enter amount"
                  />
                </div>
                <div style={styles.inputRow}>
                  <div style={styles.inputLabel}>Annual Interest Rate</div>
                  <input
                    type="text"
                    value={annualInterestRate ? `${annualInterestRate}%` : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace('%', '');
                      setAnnualInterestRate(value);
                    }}
                    style={styles.input}
                    placeholder="%Enter rate"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div style={styles.inputColumn}>
                <div style={styles.inputRow}>
                  <div style={styles.inputLabel}>Minimum Payment</div>
                  <div style={styles.calculatedValue}>
                    ${minimumPayment.toFixed(2)}
                  </div>
                </div>
                <div style={styles.inputRow}>
                  <div style={styles.inputLabel}>User Input Payment</div>
                  <input
                    type="text"
                    value={userPayment ? `$${userPayment}` : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[$,]/g, '');
                      
                      // Always allow any input while typing (including deletion)
                      setUserPayment(value);
                    }}
                    onBlur={(e) => {
                      // Only validate when user finishes typing (onBlur)
                      const value = e.target.value.replace(/[$,]/g, '');
                      const numericValue = parseFloat(value);
                      
                      if (value !== '' && !isNaN(numericValue) && numericValue >= 0) {
                        if (numericValue < minimumPayment) {
                          alert(`User Input Payment must be at least the minimum payment amount of $${minimumPayment.toFixed(2)}`);
                          // Reset to minimum payment
                          setUserPayment(minimumPayment.toString());
                        }
                      }
                    }}
                    style={{
                      ...styles.input,
                      borderColor: parseFloat(userPayment) < minimumPayment && userPayment !== '' ? '#dc3545' : '#ccc'
                    }}
                    placeholder="$Enter amount"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Summary Results - Side by Side */}
        <div style={styles.rightSection}>
          <div style={styles.summaryGrid}>
            {/* User Input Payment Summary */}
            <div style={styles.summaryCardEnhanced}>
              <div style={styles.summaryCardHeader}>
                <div style={styles.summaryCardIcon}>💳</div>
              <h3 style={styles.summaryTitle}>User Input Payment</h3>
              </div>
              <div style={styles.summaryTable}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Interest Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.interestPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Principal Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.principalPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Total Amount Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.totalAmountPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Months to Pay Off</div>
                  <div style={styles.summaryValue}>
                    {userPaymentData.amortizationTable.length === 600 ? 'Never (600+ months)' : `${userPaymentData.amortizationTable.length} months`}
                  </div>
                </div>
              </div>
            </div>

            {/* Minimum Input Payment Summary */}
            <div style={styles.summaryCardEnhanced}>
              <div style={styles.summaryCardHeader}>
                <div style={styles.summaryCardIcon}>⚠️</div>
              <h3 style={styles.summaryTitle}>Minimum Input Payment</h3>
              </div>
              <div style={styles.summaryTable}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Interest Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.interestPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Principal Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.principalPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Total Amount Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.totalAmountPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Months to Pay Off</div>
                  <div style={styles.summaryValue}>
                    {minimumPaymentData.amortizationTable.length === 600 ? 'Never (600+)' : `${minimumPaymentData.amortizationTable.length}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Side by Side like Excel */}
      <div style={styles.chartsSection}>
        {/* Left Chart: User Input Payment */}
        <div style={styles.chartCardEnhanced}>
          <div style={styles.chartHeader}>
            <div style={styles.chartIcon}>📊</div>
          <h3 style={styles.chartTitle}>Debt Payments: Interest vs Principal</h3>
          </div>
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px', fontWeight: '600' }}>User Input Payment</div>
          <div style={styles.chartContainer}>
            <Bar 
              data={{
                labels: userPaymentData.amortizationTable.map((_, index) => index + 1),
                datasets: [
                  {
                    label: 'Principal Payment',
                    data: userPaymentData.amortizationTable.map(month => month.principal),
                    backgroundColor: '#002060',
                    stack: 'stack1'
                  },
                  {
                    label: 'Interest Payment',
                    data: userPaymentData.amortizationTable.map(month => month.interest),
                    backgroundColor: '#ff9500',
                    stack: 'stack1'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Payment'
                    },
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toFixed(2);
                      }
                    }
                  }
                }
              }}
              style={{ height: '200px' }}
            />
          </div>
        </div>

        {/* Right Chart: Minimum Input Payment */}
        <div style={styles.chartCardEnhanced}>
          <div style={styles.chartHeader}>
            <div style={styles.chartIcon}>📈</div>
          <h3 style={styles.chartTitle}>Debt Payments: Interest vs Principal</h3>
          </div>
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px', fontWeight: '600' }}>Minimum Payment</div>
          <div style={styles.chartContainer}>
            <Bar 
              data={{
                labels: minimumPaymentData.amortizationTable.slice(0, 100).map((_, index) => index + 1),
                datasets: [
                  {
                    label: 'Principal Payment',
                    data: minimumPaymentData.amortizationTable.slice(0, 100).map(month => month.principal),
                    backgroundColor: '#002060',
                    stack: 'stack2'
                  },
                  {
                    label: 'Interest Payment',
                    data: minimumPaymentData.amortizationTable.slice(0, 100).map(month => month.interest),
                    backgroundColor: '#ff9500',
                    stack: 'stack2'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Payment'
                    },
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toFixed(2);
                      }
                    }
                  }
                }
              }}
              style={{ height: '200px' }}
            />
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div style={styles.sectionDivider}></div>

      {/* General Loans Section */}
      <div style={styles.sectionContainer}>
        {/* Enhanced Header */}
        <div style={styles.enhancedHeader}>
          🏦 General Loans
        </div>
        
        <div style={styles.generalLoansContent}>
          {/* Left: Average Interest Rates */}
          <div style={styles.ratesTable}>
            <h3 style={styles.ratesTitle}>Average Interest Rates</h3>
            <div style={styles.ratesList}>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>New Car</span>
                <span style={styles.rateValue}>6.73%</span>
              </div>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Used Car</span>
                <span style={styles.rateValue}>11.87%</span>
              </div>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Student Loans</span>
                <span style={styles.rateValue}>6.39%</span>
              </div>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Unsecured Loans</span>
                <span style={styles.rateValue}>12.57%</span>
              </div>
            </div>
          </div>

          {/* Middle: Loan Details */}
          <div style={styles.loanDetails}>
            <h3 style={styles.loanDetailsTitle}>Loan Details</h3>
            <div style={styles.loanDetailsList}>
              <div style={styles.loanDetailItem}>
                <span style={styles.loanDetailLabel}>Loan Amount</span>
                <input
                  type="text"
                  value={generalLoanAmount ? `$${parseFloat(generalLoanAmount).toLocaleString('en-US')}` : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[$,]/g, '');
                    setGeneralLoanAmount(value);
                  }}
                  style={styles.loanInput}
                  placeholder="$Enter amount"
                />
              </div>
              <div style={styles.loanDetailItem}>
                <span style={styles.loanDetailLabel}>Annual Interest Rate</span>
                <input
                  type="text"
                  value={generalAnnualRate ? `${(parseFloat(generalAnnualRate) * 100).toFixed(0)}%` : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[%,]/g, '');
                    const numericValue = parseFloat(rawValue);
                    if (!isNaN(numericValue)) {
                      // Store as decimal for calculations (e.g., 8 -> 0.08)
                      setGeneralAnnualRate((numericValue / 100).toString());
                    } else {
                      setGeneralAnnualRate('');
                    }
                  }}
                  style={styles.loanInput}
                  placeholder="Enter percentage"
                />
              </div>
              <div style={styles.loanDetailItem}>
                <span style={styles.loanDetailLabel}>Term</span>
                <input
                  type="text"
                  value={generalTerm ? `${parseInt(generalTerm).toLocaleString('en-US')} months` : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setGeneralTerm(value);
                  }}
                  style={styles.loanInput}
                  placeholder="Enter months"
                />
              </div>
            </div>
          </div>

          {/* Right: Payment Summary */}
          <div style={styles.paymentSummary}>
            <h3 style={styles.paymentSummaryTitle}>Payment Summary</h3>
            <div style={styles.paymentSummaryList}>
              <div style={styles.paymentSummaryItem}>
                <span style={styles.paymentSummaryLabel}>Interest Paid</span>
                <span style={styles.paymentSummaryValue}>${generalLoanData.summary.interestPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div style={styles.paymentSummaryItem}>
                <span style={styles.paymentSummaryLabel}>Principal Paid</span>
                <span style={styles.paymentSummaryValue}>${generalLoanData.summary.principalPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div style={styles.paymentSummaryItem}>
                <span style={styles.paymentSummaryLabel}>Total Amount Paid</span>
                <span style={styles.paymentSummaryValue}>${generalLoanData.summary.totalAmountPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Loan Chart Section */}
      <div style={styles.chartsSection}>
        <div style={styles.chartCardEnhanced}>
          <div style={styles.chartHeader}>
            <div style={styles.chartIcon}>📊</div>
            <h3 style={styles.chartTitle}>General Loan: Interest vs Principal</h3>
          </div>
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px', fontWeight: '600' }}>Fixed Monthly Payment</div>
          <div style={styles.chartContainer}>
            <Bar 
              data={{
                labels: generalLoanData.amortizationTable.map((_, index) => index + 1),
                datasets: [
                  {
                    label: 'Principal Payment',
                    data: generalLoanData.amortizationTable.map(month => month.principal),
                    backgroundColor: '#002060',
                    stack: 'stack3'
                  },
                  {
                    label: 'Interest Payment',
                    data: generalLoanData.amortizationTable.map(month => month.interest),
                    backgroundColor: '#ff9500',
                    stack: 'stack3'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Payment'
                    },
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toFixed(2);
                      }
                    }
                  }
                }
              }}
              style={{ height: '200px' }}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Section Divider */}
      <div style={styles.sectionDivider}></div>

      {/* Save/Load Buttons */}
      <div style={{
        marginTop: '30px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={handleSaveWeek3}
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
          💾 Save Week 3 Data
        </button>
        <button
          onClick={handleLoadWeek3}
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
          📁 Load Week 3 Data
        </button>
      </div>

      {/* Note */}
          <div style={styles.note}>
            Note: Adjust Week 1 Budget based on this week's insights
      </div>
    </div>
  );
};

export default Week3CreditCard;
