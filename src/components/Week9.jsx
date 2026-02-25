import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Helpers for input handling (Retirement-style: allow empty, decimals where needed)
const sanitizeAge = (v) => v.replace(/\D/g, '').slice(0, 3); // digits only, 22-100

// Only allow values in 22–100 or valid prefixes while typing (reject 0–21, 101+ in onChange)
const isAllowedAgeValue = (v) => {
  if (v === '') return true;
  const num = parseInt(v, 10);
  if (isNaN(num)) return false;
  if (num > 100) return false;
  if (v === '1' || v === '10') return true; // only valid prefix for 100
  if (v.length === 1 && v >= '2' && v <= '9') return true; // prefix for 22–99 (must be before num < 22)
  if (num < 22) return false; // reject 0, 10–21 (20, 21, 11–19, 10)
  if (num >= 22 && num <= 100) return true;
  if (v.length === 2 && v >= '22' && v <= '99') return true;
  return false;
};
const sanitizeCurrency = (v) => {
  const clean = v.replace(/[^0-9.]/g, '');
  const idx = clean.indexOf('.');
  if (idx === -1) return clean;
  return clean.slice(0, idx + 1) + clean.slice(idx + 1).replace(/\./g, '').slice(0, 2);
};
const sanitizePct = (v) => {
  const clean = v.replace(/[^0-9.]/g, '');
  const idx = clean.indexOf('.');
  if (idx === -1) return clean;
  return clean.slice(0, idx + 1) + clean.slice(idx + 1).replace(/\./g, '').slice(0, 2);
};

const Week9 = () => {
  // Contributions (string state: allow empty, decimals for currency)
  const [contribStartAge, setContribStartAge] = useState('22');
  const [contribEndAge, setContribEndAge] = useState('65');
  const [monthlyContribution, setMonthlyContribution] = useState('100');

  // Withdrawals
  const [withdrawStartAge, setWithdrawStartAge] = useState('45');
  const [withdrawEndAge, setWithdrawEndAge] = useState('100');
  const [yearlyWithdrawalPct, setYearlyWithdrawalPct] = useState('4');

  // Age 22–100 validation: show red message and clamp on blur
  const [ageError, setAgeError] = useState('');
  const validateAge = (v, setter) => {
    if (v === '') return;
    if (v === '1' || v === '10') {
      setter('100');
      setAgeError('');
      return;
    }
    const num = parseInt(v, 10);
    if (num < minAge) {
      setter(String(minAge));
      setAgeError('Age must be less than or equal to 100.');
    } else if (num > maxAge) {
      setter(String(maxAge));
      setAgeError('Age must be less than or equal to 100.');
    } else {
      setAgeError('');
    }
  };

  // Portfolio allocation: returnPct and allocationPct as string (allow decimals, empty)
  const [equities, setEquities] = useState({ returnPct: '8', allocationPct: '90' });
  const [fixedIncome, setFixedIncome] = useState({ returnPct: '5', allocationPct: '0' });
  const [cash, setCash] = useState({ returnPct: '0.5', allocationPct: '10' });
  const [alternatives, setAlternatives] = useState({ returnPct: '5', allocationPct: '0' });

  // Weighted Average Annual Return — Excel: =SUMPRODUCT(Avg. Annual Return %, Allocation %) / 100
  const weightedAvgReturn = useMemo(() => {
    const pct = (v) => {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return typeof n === 'number' && !isNaN(n) ? n : 0;
    };
    const returns = [equities, fixedIncome, cash, alternatives].map((row) => pct(row.returnPct));
    const allocations = [equities, fixedIncome, cash, alternatives].map((row) => pct(row.allocationPct));
    const sumProduct = returns.reduce((sum, r, i) => sum + r * allocations[i], 0);
    const weightedAvg = sumProduct / 100;
    return weightedAvg.toFixed(2);
  }, [equities, fixedIncome, cash, alternatives]);

  // Age range 22–100 (all tables: B-C, E-F, H-I, K-L, T-U, W-X; Excel row 4 = age 22, row 82 = age 100)
  const minAge = 22;
  const maxAge = 100;

  // Recompute tables on every render so outcome always reflects current inputs (no useMemo cache)
  const nominalPct = parseFloat(weightedAvgReturn);
  const nominalDecimal = (typeof nominalPct === 'number' && !isNaN(nominalPct) ? nominalPct : 0) / 100;
  const monthlyRate = nominalDecimal / 12;
  const annualGrowthFactor = monthlyRate > -1 ? Math.pow(1 + monthlyRate, 12) : 1;
  const P = Number(monthlyContribution) || 0;
  const startAge = Math.max(minAge, Number(contribStartAge) || minAge);
  const endContribAge = Number(contribEndAge) || 65;
  const d15 = Number(withdrawStartAge) || 45;
  const firstWithdrawAge = Math.min(d15 + 1, maxAge);
  const wEndAge = Math.min(Math.max(Number(withdrawEndAge) || maxAge, minAge), maxAge);
  const wPct = (Number(yearlyWithdrawalPct) || 0) / 100;
  const annualContribFV =
    P > 0 && monthlyRate !== 0
      ? P * (Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate
      : P * 12;

  const contributionsByAge = {};
  for (let age = minAge; age <= maxAge; age++) {
    if (age < startAge) contributionsByAge[age] = 0;
    else if (age === startAge) contributionsByAge[age] = annualContribFV;
    else {
      const prev = contributionsByAge[age - 1] ?? 0;
      const add = age <= endContribAge ? annualContribFV : 0;
      contributionsByAge[age] = prev * annualGrowthFactor + add;
    }
  }

  const withdrawalsByAge = {};
  const netByAge = {};
  for (let age = minAge; age <= maxAge; age++) {
    const gross = contributionsByAge[age] ?? 0;
    const w = age >= firstWithdrawAge && age <= wEndAge ? gross * wPct : 0;
    withdrawalsByAge[age] = w;
    netByAge[age] = gross - w;
  }

  // --- 4 summary formulas (Excel Week 6 B - Markets & Investing) ---
  // Row 4 = age 22, row 4+(age-22) = age; columns: W=Age, X=Net, L=Withdrawals, R=PV(Withdrawals)
  // D5 = current age (22); D47 = FV Ending Balance (MAX(X))
  const inflationRate = 0.035; // PV rate
  const currentAge = minAge; // D5

  const scenarioEndAge = Math.min(Math.max(Number(withdrawEndAge) || maxAge, minAge), maxAge);

  // 1) Future Value, Ending Balance = MAX(X4:X...) — column X = Net Account Value "Value of Contribution"
  const endingBalanceFV = useMemo(() => {
    let maxNet = 0;
    for (let a = minAge; a <= scenarioEndAge; a++) {
      const v = netByAge[a] ?? 0;
      if (v > maxNet) maxNet = v;
    }
    return maxNet;
  }, [netByAge, scenarioEndAge]);

  const summaryFutureEnding = useMemo(
    () => Math.round(endingBalanceFV),
    [endingBalanceFV]
  );

  // 2) Future Value, Amount Withdrew = SUM(L4:L...) — column L = Withdrawals "Value of Contribution"
  const summaryFutureWithdrew = useMemo(() => {
    let sum = 0;
    for (let a = minAge; a <= scenarioEndAge; a++) sum += withdrawalsByAge[a] ?? 0;
    return Math.round(sum);
  }, [withdrawalsByAge, scenarioEndAge]);

  // 3) Today's Dollars, Ending Balance = PV(0.035, MAX(W4:W...)-D5, 0, -D47); W=Age, nper = max age - current age
  const summaryTodayEnding = useMemo(() => {
    const nper = Math.max(0, scenarioEndAge - currentAge); // MAX(W) - D5
    const pv = endingBalanceFV / Math.pow(1 + inflationRate, nper); // PV of -D47
    return Math.round(pv);
  }, [endingBalanceFV, scenarioEndAge, currentAge]);

  // 4) Today's Dollars, Amount Withdrew = SUM(R4:R...) — column R = PV of each row's withdrawal
  const summaryTodayWithdrew = useMemo(() => {
    let pvSum = 0;
    for (let a = minAge; a <= scenarioEndAge; a++) {
      const w = withdrawalsByAge[a] ?? 0;
      pvSum += w / Math.pow(1 + inflationRate, a - currentAge);
    }
    return Math.round(pvSum);
  }, [withdrawalsByAge, scenarioEndAge, currentAge]);

  // Chart: dynamic Net Account Value by age (updates when inputs change)
  const chartLabels = useMemo(() => {
    const ages = [];
    for (let a = minAge; a <= maxAge; a++) ages.push(a);
    return ages;
  }, []);

  const chartValues = useMemo(
    () => chartLabels.map((age) => Math.round(netByAge[age] ?? 0)),
    [chartLabels, netByAge]
  );

  const chartMaxY = useMemo(() => {
    const max = Math.max(0, ...chartValues);
    if (max <= 0) return 1000000;
    return Math.ceil(max / 500000) * 500000;
  }, [chartValues]);

  const chartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: 'Account Value',
        data: chartValues,
        borderColor: '#002060',
        backgroundColor: 'rgba(0, 32, 96, 0.05)',
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }), [chartLabels, chartValues]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => (ctx[0] ? `Age ${ctx[0].label}` : ''),
          label: (ctx) => `$${(ctx.raw ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Age', font: { size: 12 } },
        min: minAge,
        max: maxAge,
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Account Value (Future Value)', font: { size: 12 } },
        min: 0,
        max: chartMaxY,
        grid: { display: false },
        ticks: {
          stepSize: chartMaxY / 5,
          callback: (v) =>
            v >= 1000000 ? `$${v / 1000000}M` : v >= 1000 ? `$${v / 1000}K` : `$${v}`,
        },
      },
    },
  }), [chartMaxY]);

  const handleSaveWeek9 = () => {
    try {
      const week9Data = {
        week: 9,
        contribStartAge,
        contribEndAge,
        monthlyContribution,
        withdrawStartAge,
        withdrawEndAge,
        yearlyWithdrawalPct,
        equities,
        fixedIncome,
        cash,
        alternatives,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('week9_data', JSON.stringify(week9Data));
      alert('✅ Week 9 data saved successfully!');
    } catch (error) {
      console.error('Error saving Week 9 data:', error);
      alert('❌ Error saving Week 9 data. Please try again.');
    }
  };

  const handleLoadWeek9 = () => {
    try {
      const savedData = localStorage.getItem('week9_data');
      if (savedData) {
        const d = JSON.parse(savedData);
        if (d.contribStartAge != null) setContribStartAge(String(d.contribStartAge));
        if (d.contribEndAge != null) setContribEndAge(String(d.contribEndAge));
        if (d.monthlyContribution != null) setMonthlyContribution(String(d.monthlyContribution));
        if (d.withdrawStartAge != null) setWithdrawStartAge(String(d.withdrawStartAge));
        if (d.withdrawEndAge != null) setWithdrawEndAge(String(d.withdrawEndAge));
        if (d.yearlyWithdrawalPct != null) setYearlyWithdrawalPct(String(d.yearlyWithdrawalPct));
        if (d.equities) setEquities({
          returnPct: String(d.equities.returnPct ?? '8'),
          allocationPct: String(d.equities.allocationPct ?? '90'),
        });
        if (d.fixedIncome) setFixedIncome({
          returnPct: String(d.fixedIncome.returnPct ?? '5'),
          allocationPct: String(d.fixedIncome.allocationPct ?? '0'),
        });
        if (d.cash) setCash({
          returnPct: String(d.cash.returnPct ?? '0.5'),
          allocationPct: String(d.cash.allocationPct ?? '10'),
        });
        if (d.alternatives) setAlternatives({
          returnPct: String(d.alternatives.returnPct ?? '5'),
          allocationPct: String(d.alternatives.allocationPct ?? '0'),
        });
        alert('✅ Week 9 data loaded successfully!');
      } else {
        alert('ℹ️ No saved data found for Week 9.');
      }
    } catch (error) {
      console.error('Error loading Week 9 data:', error);
      alert('❌ Error loading Week 9 data. Please try again.');
    }
  };

  // Styling matching Week 6 Retirement Planning
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(255, 253, 231, 0.27) 0%, rgb(255, 252, 240) 50%, rgb(255, 255, 255) 100%)',
      padding: '32px 24px 16px 24px',
      width: '100%',
      fontSize: '14px',
      color: '#111827',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
    },
    sectionContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '40px',
      marginBottom: '32px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 4px 16px 0 rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    enhancedHeader: {
      background: 'linear-gradient(135deg, rgba(13, 26, 75, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      padding: '28px 32px',
      borderRadius: '16px',
      fontWeight: '600',
      fontSize: '22px',
      textAlign: 'center',
      marginBottom: '32px',
      boxShadow: '0 8px 32px 0 rgba(13, 26, 75, 0.3), 0 4px 16px 0 rgba(13, 26, 75, 0.2)',
      letterSpacing: '-0.01em',
      lineHeight: '1.3',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    sectionDivider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(229, 231, 235, 0.6), transparent)',
      margin: '0',
      borderRadius: '1px',
    },
    infoBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 18px',
      backgroundColor: 'rgba(13, 26, 75, 0.05)',
      borderRadius: '8px',
      color: '#0d1a4b',
      fontSize: '13px',
      marginBottom: '24px',
      border: '1px solid rgba(13, 26, 75, 0.15)',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      marginTop: 18,
      marginBottom: 24,
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    th: {
      background: 'linear-gradient(135deg, rgba(13, 26, 75, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      padding: '16px 18px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontSize: '15px',
    },
    td: {
      border: '1px solid rgba(229, 231, 235, 0.5)',
      padding: '16px 18px',
      verticalAlign: 'middle',
      textAlign: 'center',
      backgroundColor: 'white',
      transition: 'background-color 0.15s ease',
    },
    inputYellow: {
      width: '120px',
      minWidth: 150,
      border: '2px solid #d1d5db',
      padding: '10px 14px',
      textAlign: 'right',
      backgroundColor: '#fffde7',
      borderRadius: '8px',
      boxSizing: 'border-box',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 1px 0 rgba(0, 0, 0, 0.02)',
      maxWidth: '100%',
    },
    readOnly: {
      textAlign: 'right',
      paddingRight: '12px',
      color: '#6b7280',
      backgroundColor: 'rgba(249, 250, 251, 0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: '8px',
      fontWeight: '600',
      border: '1px solid rgba(229, 231, 235, 0.6)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 1px 0 rgba(0, 0, 0, 0.02)',
    },
    subHeader: {
      fontSize: '17px',
      fontWeight: 600,
      color: 'rgba(13, 26, 75, 0.9)',
      margin: '28px 0 0 0',
      letterSpacing: '-0.02em',
    },
    titleUnderline: {
      height: '1px',
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      margin: '10px 0 20px 0',
      borderRadius: '1px',
      maxWidth: '530px',
      width: '100%',
    },
    minimalBlock: {
      padding: '0 2px',
    },
    rowLabel: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      width: '100%',
    },
    rowLabelText: {
      fontWeight: 500,
      color: 'rgba(13, 26, 75, 0.85)',
      fontSize: '14px',
      width: '260px',
      minWidth: '260px',
      flexShrink: 0,
    },
    rowLabelInputGap: '125px',
    chartWrapper: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(229, 231, 235, 0.8)',
      borderRadius: '14px',
      padding: '28px',
      marginBottom: '24px',
      minHeight: '380px',
      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
      maxWidth: '75%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: 700,
      marginBottom: '20px',
      textAlign: 'center',
      color: '#111827',
      letterSpacing: '-0.02em',
    },
  };

  const formatCurrency = (n) => (n == null ? '' : `$${Number(n).toLocaleString()}`);

  return (
    <>
      <style>{`
        .week9-no-spinner::-webkit-inner-spin-button,
        .week9-no-spinner::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .week9-no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
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
        border: '1px solid rgba(13, 26, 75, 0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        borderRadius: '14px',
        padding: '12px 20px',
        color: '#0d1a4b',
        fontWeight: 500,
        fontSize: 12,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d1a4b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
        You can only enter data in the open (yellow) fields.
      </div>

      <div style={styles.container}>
        <div style={styles.sectionContainer}>
          <div style={styles.enhancedHeader}>
            <span style={{ fontSize: '26px', letterSpacing: '-0.02em' }}>Brokerage Account</span>
          </div>

          <div style={styles.infoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d1a4b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>How it works:</strong> Enter contribution and withdrawal ages, monthly contribution, and portfolio allocation. The chart shows brokerage account value over time; summary shows ending balance and total withdrawals in future and today&apos;s dollars.
            </div>
          </div>

          {/* Top row: left = Contributions + Withdrawals + Summary, right = Portfolio Allocation */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
              {/* Left column */}
              <div style={{ flex: '1 1 320px', minWidth: 280, paddingRight: '24px' }}>
                <div style={{ ...styles.subHeader, marginTop: '8px' }}>Contributions</div>
                <div style={styles.titleUnderline} />
                <div style={styles.minimalBlock}>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>Start Age</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="22"
                      value={contribStartAge}
                      onChange={(e) => {
                        const v = sanitizeAge(e.target.value);
                        if (isAllowedAgeValue(v)) {
                          setContribStartAge(v);
                          setAgeError('');
                        } else {
                          setAgeError('Age must be less than or equal to 100.');
                        }
                      }}
                      onBlur={() => validateAge(contribStartAge, setContribStartAge)}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>End Age</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="65"
                      value={contribEndAge}
                      onChange={(e) => {
                        const v = sanitizeAge(e.target.value);
                        if (isAllowedAgeValue(v)) {
                          setContribEndAge(v);
                          setAgeError('');
                        } else {
                          setAgeError('Age must be less than or equal to 100.');
                        }
                      }}
                      onBlur={() => validateAge(contribEndAge, setContribEndAge)}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>Monthly Contribution</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="$0"
                      value={monthlyContribution === '' ? '' : `$${monthlyContribution}`}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[$,\s]/g, '');
                        const v = sanitizeCurrency(raw);
                        setMonthlyContribution(v);
                      }}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                </div>
                {ageError ? (
                  <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '8px', fontWeight: '500' }}>{ageError}</div>
                ) : null}

                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(229, 231, 235, 0.6), transparent)', margin: '32px 0' }} />

                <div style={styles.subHeader}>Withdrawals</div>
                <div style={styles.titleUnderline} />
                <div style={styles.minimalBlock}>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>Start Age</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="45"
                      value={withdrawStartAge}
                      onChange={(e) => {
                        const v = sanitizeAge(e.target.value);
                        if (isAllowedAgeValue(v)) {
                          setWithdrawStartAge(v);
                          setAgeError('');
                        } else {
                          setAgeError('Age must be less than or equal to 100.');
                        }
                      }}
                      onBlur={() => validateAge(withdrawStartAge, setWithdrawStartAge)}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>End Age</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="100"
                      value={withdrawEndAge}
                      onChange={(e) => {
                        const v = sanitizeAge(e.target.value);
                        if (isAllowedAgeValue(v)) {
                          setWithdrawEndAge(v);
                          setAgeError('');
                        } else {
                          setAgeError('Age must be less than or equal to 100.');
                        }
                      }}
                      onBlur={() => validateAge(withdrawEndAge, setWithdrawEndAge)}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                  <div style={styles.rowLabel}>
                    <span style={styles.rowLabelText}>Yearly Withdrawal (% of Portfolio)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="%"
                      value={yearlyWithdrawalPct === '' ? '' : `${yearlyWithdrawalPct}%`}
                      onChange={(e) => {
                        const v = sanitizePct(e.target.value.replace(/%/g, ''));
                        setYearlyWithdrawalPct(v);
                      }}
                      style={{ ...styles.inputYellow, width: 100, marginLeft: styles.rowLabelInputGap }}
                    />
                  </div>
                </div>
                {ageError ? (
                  <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '8px', fontWeight: '500' }}>{ageError}</div>
                ) : null}
              </div>

              {/* Right column: Portfolio Allocation */}
              <div style={{ flex: '1 1 320px', minWidth: 280, paddingLeft: '16px' }}>
                <div style={{ ...styles.subHeader, marginTop: '8px' }}>Portfolio Allocation</div>
                <div style={styles.titleUnderline} />
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, textAlign: 'left' }}>Investment Type</th>
                      <th style={styles.th}>Avg. Annual Return %</th>
                      <th style={styles.th}>Allocation %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ ...styles.td, textAlign: 'left' }}>Equities</td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={equities.returnPct === '' ? '' : `${equities.returnPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setEquities((p) => ({ ...p, returnPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={equities.allocationPct === '' ? '' : `${equities.allocationPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setEquities((p) => ({ ...p, allocationPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.td, textAlign: 'left' }}>Fixed Income</td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={fixedIncome.returnPct === '' ? '' : `${fixedIncome.returnPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setFixedIncome((p) => ({ ...p, returnPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={fixedIncome.allocationPct === '' ? '' : `${fixedIncome.allocationPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setFixedIncome((p) => ({ ...p, allocationPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.td, textAlign: 'left' }}>Cash</td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={cash.returnPct === '' ? '' : `${cash.returnPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setCash((p) => ({ ...p, returnPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={cash.allocationPct === '' ? '' : `${cash.allocationPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setCash((p) => ({ ...p, allocationPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.td, textAlign: 'left' }}>Alternatives</td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={alternatives.returnPct === '' ? '' : `${alternatives.returnPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setAlternatives((p) => ({ ...p, returnPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={alternatives.allocationPct === '' ? '' : `${alternatives.allocationPct}%`}
                          onChange={(e) => {
                            const v = sanitizePct(e.target.value.replace(/%/g, ''));
                            setAlternatives((p) => ({ ...p, allocationPct: v }));
                          }}
                          style={styles.inputYellow}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          padding: '16px 18px',
                          verticalAlign: 'middle',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#0d1a4b',
                          backgroundColor: 'white',
                          border: 'none',
                          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
                          borderLeft: '1px solid rgba(229, 231, 235, 0.5)',
                          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
                        }}
                      >
                        Weighted Average Annual Return
                      </td>
                      <td
                        style={{
                          padding: '16px 18px',
                          verticalAlign: 'middle',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#0d1a4b',
                          backgroundColor: 'white',
                          border: 'none',
                          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
                          borderRight: '1px solid rgba(229, 231, 235, 0.5)',
                          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
                        }}
                      >
                        {weightedAvgReturn}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Brokerage Account Value chart - matching Retirement Planning chart wrapper */}
            <div style={{ ...styles.chartWrapper, marginTop: 28 }}>
              <div style={styles.chartTitle}>Brokerage Account Value</div>
              <div style={{ height: 320, width: '100%', position: 'relative' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Summary table - after graph, like Excel */}
            <div style={{ marginTop: 28, width: 620 }}>
              <table style={{ ...styles.table, width: 620 }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, textAlign: 'left', width: 220 }}></th>
                    <th style={{ ...styles.th, width: 200 }}>Ending Balance</th>
                    <th style={{ ...styles.th, width: 200 }}>Amount Withdrew</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...styles.td, fontWeight: 600, textAlign: 'left', color: '#0d1a4b', width: 220 }}>Future Value</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280', backgroundColor: 'rgba(249, 250, 251, 0.8)', width: 200 }}>{formatCurrency(summaryFutureEnding)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280', backgroundColor: 'rgba(249, 250, 251, 0.8)', width: 200 }}>{formatCurrency(summaryFutureWithdrew)}</td>
                  </tr>
                  <tr>
                    <td style={{ ...styles.td, fontWeight: 600, textAlign: 'left', color: '#0d1a4b', width: 220 }}>Today&apos;s Dollars</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280', backgroundColor: 'rgba(249, 250, 251, 0.8)', width: 200 }}>{formatCurrency(summaryTodayEnding)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280', backgroundColor: 'rgba(249, 250, 251, 0.8)', width: 200 }}>{formatCurrency(summaryTodayWithdrew)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.sectionDivider} />

          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
          }}>
            <button
              onClick={handleSaveWeek9}
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
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#003d82';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#002060';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💾 Save Week 9 Data
            </button>
            <button
              onClick={handleLoadWeek9}
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
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📁 Load Week 9 Data
            </button>
          </div>
      </div>
    </>
  );
};

export default Week9;
