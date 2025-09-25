import React, { useState, useEffect } from 'react';

const Week3CreditCard = () => {
  // State for user inputs (yellow cells) - Default values from Excel
  const [debtAmount, setDebtAmount] = useState('10000');
  const [annualInterestRate, setAnnualInterestRate] = useState('24.35');
  const [userPayment, setUserPayment] = useState('290');

  // Calculated values
  const minimumPayment = (parseFloat(debtAmount) || 0) * 0.01; // 1% of debt amount

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

    while (!isPaidOff && month <= 360) { // Max 30 years
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

    while (!isPaidOff && month <= 360) { // Max 30 years
      // Calculate interest: E4 = C4 * (Annual Interest Rate / 12)
      const interest = loanAmount * monthlyRate;
      
      // Calculate payment: D4 = Minimum Payment (first month), D5+ = MIN(Minimum Payment, Current Balance + Current Interest)
      // Excel: D5 = MIN('Week 3.1 - Credit Card Debt'!$G$7,G4+E5) where G4 is previous balance, E5 is current interest
      // Allow negative principal as per Excel logic
      const actualPayment = month === 1 ? minPayment : Math.min(minPayment, loanAmount + interest);
      
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

  // Calculate amortization data
  const userPaymentData = calculateUserPaymentAmortization();
  const minimumPaymentData = calculateMinimumPaymentAmortization();

  // Styling matching Week 1 and Week 2 patterns exactly
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
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
      padding: '0px 8px 0px 8px',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      marginTop: '0',
      marginBottom: '0'
    },
    summaryTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '12px',
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
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    chartTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '8px',
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
      <div style={{width: '1200px', maxWidth: '1200px'}}>
        <div style={{width: '100%', maxWidth: '1200px', marginBottom: '20px'}}>
          {/* Header */}
          <div style={{
            backgroundColor: '#002060',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            Credit Card Debt Management
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
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    style={styles.input}
                    placeholder="Enter amount"
                  />
                </div>
                <div style={styles.inputRow}>
                  <div style={styles.inputLabel}>Annual Interest Rate</div>
                  <input
                    type="number"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(e.target.value)}
                    style={styles.input}
                    placeholder="Enter amount"
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
                    type="number"
                    value={userPayment}
                    onChange={(e) => setUserPayment(e.target.value)}
                    style={styles.input}
                    placeholder="Enter amount"
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
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>User Input Payment</h3>
              <div style={styles.summaryTable}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Interest Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.interestPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Principal Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.principalPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Total Amount Paid</div>
                  <div style={styles.summaryValue}>${userPaymentData.summary.totalAmountPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Months to Pay Off</div>
                  <div style={styles.summaryValue}>{userPaymentData.amortizationTable.length} months</div>
                </div>
              </div>
            </div>

            {/* Minimum Input Payment Summary */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Minimum Input Payment</h3>
              <div style={styles.summaryTable}>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Interest Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.interestPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Principal Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.principalPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Total Amount Paid</div>
                  <div style={styles.summaryValue}>${minimumPaymentData.summary.totalAmountPaid.toFixed(2)}</div>
                </div>
                <div style={styles.summaryRow}>
                  <div style={styles.summaryLabel}>Months to Pay Off</div>
                  <div style={styles.summaryValue}>{minimumPaymentData.amortizationTable.length} months</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Side by Side like Excel */}
      <div style={styles.chartsSection}>
        {/* Left Chart: User Input Payment */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>User Payment: Interest vs Principal</h3>
          <div style={styles.chartContainer}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Interest Paid:</strong> ${userPaymentData.summary.interestPaid.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Principal Paid:</strong> ${userPaymentData.summary.principalPaid.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Total Paid:</strong> ${userPaymentData.summary.totalAmountPaid.toFixed(2)}
              </div>
              <div>
                <strong>Time to Pay Off:</strong> {userPaymentData.amortizationTable.length} months
              </div>
            </div>
          </div>
        </div>

        {/* Right Chart: Minimum Input Payment */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Minimum Payment: Interest vs Principal</h3>
          <div style={styles.chartContainer}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Interest Paid:</strong> ${minimumPaymentData.summary.interestPaid.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Principal Paid:</strong> ${minimumPaymentData.summary.principalPaid.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Total Paid:</strong> ${minimumPaymentData.summary.totalAmountPaid.toFixed(2)}
              </div>
              <div>
                <strong>Time to Pay Off:</strong> {minimumPaymentData.amortizationTable.length} months
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Loans Section */}
      <div style={styles.generalLoansSection}>
        <div style={styles.generalLoansHeader}>
          General Loans
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
                  type="number"
                  value=""
                  style={styles.loanInput}
                  placeholder="Enter amount"
                />
              </div>
              <div style={styles.loanDetailItem}>
                <span style={styles.loanDetailLabel}>Annual Interest Rate</span>
                <input
                  type="number"
                  value=""
                  style={styles.loanInput}
                  placeholder="Enter amount"
                />
              </div>
              <div style={styles.loanDetailItem}>
                <span style={styles.loanDetailLabel}>Term</span>
                <input
                  type="number"
                  value=""
                  style={styles.loanInput}
                  placeholder="Enter amount"
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
                <span style={styles.paymentSummaryValue}>${userPaymentData.summary.interestPaid.toFixed(2)}</span>
              </div>
              <div style={styles.paymentSummaryItem}>
                <span style={styles.paymentSummaryLabel}>Principal Paid</span>
                <span style={styles.paymentSummaryValue}>${userPaymentData.summary.principalPaid.toFixed(2)}</span>
              </div>
              <div style={styles.paymentSummaryItem}>
                <span style={styles.paymentSummaryLabel}>Total Amount Paid</span>
                <span style={styles.paymentSummaryValue}>${userPaymentData.summary.totalAmountPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Loan Chart Section - Single Chart */}
      <div style={styles.chartsSection}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Comparison: User Payment vs Minimum Payment</h3>
          <div style={styles.chartContainer}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                Payment Comparison
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>User Payment:</div>
                  <div>Interest: ${userPaymentData.summary.interestPaid.toFixed(2)}</div>
                  <div>Principal: ${userPaymentData.summary.principalPaid.toFixed(2)}</div>
                  <div>Total: ${userPaymentData.summary.totalAmountPaid.toFixed(2)}</div>
                  <div>Time: {userPaymentData.amortizationTable.length} months</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Minimum Payment:</div>
                  <div>Interest: ${minimumPaymentData.summary.interestPaid.toFixed(2)}</div>
                  <div>Principal: ${minimumPaymentData.summary.principalPaid.toFixed(2)}</div>
                  <div>Total: ${minimumPaymentData.summary.totalAmountPaid.toFixed(2)}</div>
                  <div>Time: {minimumPaymentData.amortizationTable.length} months</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>Savings with User Payment:</strong> ${(minimumPaymentData.summary.totalAmountPaid - userPaymentData.summary.totalAmountPaid).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div style={{width: '100%'}}></div>
      </div>

      {/* Note */}
          <div style={styles.note}>
            Note: Adjust Week 1 Budget based on this week's insights
          </div>
        </div>
      </div>
    </div>
  );
};

export default Week3CreditCard;
