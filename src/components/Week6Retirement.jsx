import React, { useState, useMemo } from 'react';
import stateTaxData from '../data/stateTaxData';
import { useBudget } from '../contexts/BudgetContext';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Inline styles matching Week 1 for consistency
const styles = {
  container: {
    fontSize: '14px',
    maxWidth: '80vw',
    margin: '0 auto',
    padding: '32px 2vw',
    backgroundColor: '#fdfdfd',
    color: '#333',
  },
  section: {
    marginBottom: 48,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    background: '#fff',
    padding: '32px 2vw',
  },
  header: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#002060',
    marginBottom: 18,
  },
  subHeader: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#002060',
    margin: '18px 0 10px 0',
  },
  table: {
    width: '70%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: 10,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    marginBottom: 18,
    marginLeft: 'auto',
    marginRight: 'auto', // ya da kısaca:
    // margin: '10px auto 18px auto',
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
    width: '100%',
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'right',
    backgroundColor: '#fffde7',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  readOnly: {
    textAlign: 'right',
    paddingRight: '12px',
    color: '#555',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
  chartPlaceholder: {
    width: '70%',
    height: 300,
    background: '#eef2f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: 18,
    borderRadius: '12px',
    margin: '24px auto',
  },
  info: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid #bfdbfe',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    borderRadius: '14px',
    padding: '12px 20px',
    color: '#0d1a4b',
    fontWeight: 500,
    fontSize: 12,
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

function simulate401k({
  startAge,
  endAge,
  annualPayment,
  returnRate,
  employerMatch,
  maxContribution,
}) {
  const ages = [];
  const years = [];
  const annualContributions = [];
  const employerMatches = [];
  const totalContributions = [];
  const balances = [];
  let balance = 0;
  let year = 0; // Start from 0 to match Excel
  for (let age = startAge; age <= endAge; age++, year++) {
    ages.push(age);
    years.push(year);
    // Annual contribution logic (capped by maxContribution)
    let contribution = Math.min(annualPayment, maxContribution);
    annualContributions.push(contribution);
    // Employer match
    let match = contribution * (employerMatch / 100);
    employerMatches.push(match);
    // Total contribution
    let total = contribution + match;
    totalContributions.push(total);
    // Account balance (future value)
    balance = balance * (1 + returnRate / 100) + total;
    balances.push(balance);
  }
  return { ages, years, annualContributions, employerMatches, totalContributions, balances };
}

// Helper to get last valid value in array (like Excel INDEX(..., MATCH(1E+99, ...)))
function getLastValid(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null && !isNaN(arr[i])) { // allow 0 as valid
      return arr[i];
    }
  }
  return 0;
}

export default function Week6Retirement() {
  const { topInputs, retirementInputs, setRetirementInputs, financialCalculations } = useBudget() || {};
  const selectedState = topInputs?.location;
  const stateBrackets = selectedState ? stateTaxData.filter(row => row.state === selectedState) : [];

  // Shared input state
  const [startAge, setStartAge] = useState(20);
  const [endAge, setEndAge] = useState(70);
  // Remove maxContribution state, make it computed

  // Series A
  const [annualPaymentA, setAnnualPaymentA] = useState(4638);
  const [returnRateA, setReturnRateA] = useState(7);
  const [employerMatchA, setEmployerMatchA] = useState(3);
  const [withdrawalRateA, setWithdrawalRateA] = useState(6);

  // Series B
  const [annualPaymentB, setAnnualPaymentB] = useState(10000);
  const [returnRateB, setReturnRateB] = useState(7);
  const [employerMatchB, setEmployerMatchB] = useState(3);
  const [withdrawalRateB, setWithdrawalRateB] = useState(6);

  // Series C
  const [annualPaymentC, setAnnualPaymentC] = useState(15353);
  const [returnRateC, setReturnRateC] = useState(7);
  const [employerMatchC, setEmployerMatchC] = useState(3);
  const [withdrawalRateC, setWithdrawalRateC] = useState(6);

  // Calculate maxContribution using the effective take-home rate from Week 1
  const afterTaxIncome = financialCalculations?.afterTaxIncome || 0;
  console.log('afterTaxIncome (Week 6):', afterTaxIncome);
  const preTaxIncome = Number(topInputs?.preTaxIncome) || 1;
  console.log('preTaxIncome (Week 6):', preTaxIncome);
  const effectiveTakeHomeRate = afterTaxIncome / preTaxIncome;
  const maxContribution = 23500 * (effectiveTakeHomeRate);

  // Simulations
  const simA = useMemo(() => {
    // For Series A, annual contribution is annualPaymentA / effectiveTakeHomeRate (Excel logic)
    const customSimulate401kA = ({
      startAge,
      endAge,
      annualPayment,
      returnRate,
      employerMatch,
      maxContribution,
      effectiveTakeHomeRate
    }) => {
      const ages = [];
      const years = [];
      const annualContributions = [];
      const employerMatches = [];
      const totalContributions = [];
      const balances = [];
      let balance = 0;
      let year = 0;
      // Calculate the fixed annual contribution for all years
      const fixedContribution = annualPayment / effectiveTakeHomeRate;
      for (let age = startAge; age <= endAge; age++, year++) {
        ages.push(age);
        years.push(year);
        // Round annual contribution
        const roundedContribution = Number(fixedContribution.toFixed(2));
        annualContributions.push(roundedContribution);
        // Round employer match
        let match = Number((roundedContribution * (employerMatch / 100)).toFixed(2));
        employerMatches.push(match);
        // Total contribution, rounded
        let total;
        if (roundedContribution === "" || match === "") {
          total = "";
          totalContributions.push("");
        } else {
          total = Number((roundedContribution + match).toFixed(2));
          totalContributions.push(total);
        }
        // Account balance (future value), rounded
        if (total === "") {
          balances.push("");
        } else {
          balance = Number((balance * (1 + returnRate / 100) + total).toFixed(2));
          balances.push(balance);
        }
      }
      return { ages, years, annualContributions, employerMatches, totalContributions, balances };
    };
    return customSimulate401kA({
      startAge,
      endAge,
      annualPayment: annualPaymentA,
      returnRate: returnRateA,
      employerMatch: employerMatchA,
      maxContribution,
      effectiveTakeHomeRate
    });
  }, [startAge, endAge, annualPaymentA, returnRateA, employerMatchA, maxContribution, effectiveTakeHomeRate]);

  // Series B and C remain unchanged for now
  const simB = useMemo(() => {
    const ages = [];
    const years = [];
    const annualContributions = [];
    const employerMatches = [];
    const totalContributions = [];
    const balances = [];
    let balance = 0;
    let year = 0;
    // Calculate the fixed annual contribution for all years (Excel logic)
    const fixedContribution = annualPaymentB / effectiveTakeHomeRate;
    for (let age = startAge; age <= endAge; age++, year++) {
      ages.push(age);
      years.push(year);
      // Round annual contribution
      const roundedContribution = Number(fixedContribution.toFixed(2));
      annualContributions.push(roundedContribution);
      // Round employer match
      let match = Number((roundedContribution * (employerMatchB / 100)).toFixed(2));
      employerMatches.push(match);
      // Total contribution, rounded
      let total;
      if (roundedContribution === "" || match === "") {
        total = "";
        totalContributions.push("");
      } else {
        total = Number((roundedContribution + match).toFixed(2));
        totalContributions.push(total);
      }
      // Account balance (future value), rounded
      if (total === "") {
        balances.push("");
      } else {
        balance = Number((balance * (1 + returnRateB / 100) + total).toFixed(2));
        balances.push(balance);
      }
    }
    return { ages, years, annualContributions, employerMatches, totalContributions, balances };
  }, [startAge, endAge, annualPaymentB, returnRateB, employerMatchB, maxContribution, effectiveTakeHomeRate]);

  const simC = useMemo(() => {
    const ages = [];
    const years = [];
    const annualContributions = [];
    const employerMatches = [];
    const totalContributions = [];
    const balances = [];
    let balance = 0;
    let year = 0;
    // Calculate the fixed annual contribution for all years (Excel logic)
    const fixedContribution = annualPaymentC / effectiveTakeHomeRate;
    for (let age = startAge; age <= endAge; age++, year++) {
      ages.push(age);
      years.push(year);
      // Round annual contribution
      const roundedContribution = Number(fixedContribution.toFixed(2));
      annualContributions.push(roundedContribution);
      // Round employer match
      let match = Number((roundedContribution * (employerMatchC / 100)).toFixed(2));
      employerMatches.push(match);
      // Total contribution, rounded
      let total;
      if (roundedContribution === "" || match === "") {
        total = "";
        totalContributions.push("");
      } else {
        total = Number((roundedContribution + match).toFixed(2));
        totalContributions.push(total);
      }
      // Account balance (future value), rounded
      if (total === "") {
        balances.push("");
      } else {
        balance = Number((balance * (1 + returnRateC / 100) + total).toFixed(2));
        balances.push(balance);
      }
    }
    return { ages, years, annualContributions, employerMatches, totalContributions, balances };
  }, [startAge, endAge, annualPaymentC, returnRateC, employerMatchC, maxContribution, effectiveTakeHomeRate]);

  // Final balances (last valid value)
  const finalBalanceA = getLastValid(simA.balances);
  const finalBalanceB = getLastValid(simB.balances);
  const finalBalanceC = getLastValid(simC.balances);

  // Chart data
  const chartData = {
    labels: simA.ages,
    datasets: [
      {
        label: 'Series A',
        data: simA.balances,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.2,
      },
      {
        label: 'Series B',
        data: simB.balances,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.1)',
        tension: 0.2,
      },
      {
        label: 'Series C',
        data: simC.balances,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Traditional 401(k) Balance vs. Age' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Helper to format currency
  const formatCurrency = (num) => Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Excel-style plan data (order, default, and calculation values)
  const planRows = [
    { key: 'retirement_traditional_401k', label: 'Traditional 401(k) Plan', default: 4638, max: 15102.98, percent: 2.5 },
    { key: 'retirement_roth_401k', label: 'Roth 401(k) Plan', default: 4638, max: 6041.19, percent: 1.0 },
    { key: 'retirement_traditional_ira', label: 'Traditional IRA', default: 4638, max: 3020.60, percent: 0.5 },
    { key: 'retirement_roth_ira', label: 'Roth IRA', default: 4638, max: 6041.19, percent: 1.0 },
    { key: 'retirement_simple_ira', label: 'SIMPLE 401(k) Plan', default: 0, max: 0, percent: 0 },
    { key: 'retirement_403b', label: '403(b) Plan', default: 0, max: 0, percent: 0 },
    { key: 'retirement_457b', label: '457(b) Plan', default: 0, max: 0, percent: 0 },
    { key: 'retirement_thrift', label: 'Thrift Savings Plan', default: 0, max: 0, percent: 0 },
    { key: 'retirement_private_db', label: 'Private-Sector DB Plan', default: 0, max: 0, percent: 0 },
    { key: 'retirement_gov_db', label: 'Government DB Plan', default: 0, max: 0, percent: 0 },
  ];

  // Helper to get value from context or default
  const getInput = (row) => {
    const val = retirementInputs?.[row.key];
    if (val === undefined || val === "") return row.default;
    return Number(val);
  };

  // Helper to handle input change and update context
  const handleInputChange = (key, value) => {
    setRetirementInputs(prev => ({
      ...prev,
      [key]: value.replace(/[^0-9.]/g, '') // only allow numbers and dot
    }));
  };

  // Calculate totals
  const totalInput = planRows.reduce((sum, row) => sum + getInput(row), 0);
  const totalMax = planRows.reduce((sum, row) => sum + row.max, 0);
  const totalPercent = planRows.reduce((sum, row) => sum + row.percent, 0);

  // Section header style for all section titles
  const sectionHeaderStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#002060',
    margin: '0 0 18px 0',
    padding: 0,
    fontFamily: 'inherit',
    letterSpacing: 0,
    lineHeight: 1.3,
  };

  // Simple section header style to match Week 1
  const simpleHeaderStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#002060',
    margin: '0 0 18px 0',
    padding: 0,
    fontFamily: 'inherit',
    letterSpacing: 0,
    lineHeight: 1.3,
  };

  return (
    <div style={styles.container}>
      {/* Info alert for editable fields */}
      <div style={styles.info}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
        You can only enter data in the open (yellow) fields.
      </div>

      {/* Main title with dark blue header bar */}
      <div style={{
        backgroundColor: '#002060',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Retirement Planning
      </div>

      {/* 1. Retirement Budgeting Overview Table */}
      <div style={simpleHeaderStyle}>Retirement Budgeting</div>
      <div style={styles.section}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plan</th>
              <th style={styles.th}></th>
              <th style={styles.th}>$</th>
              <th style={styles.th}>%</th>
            </tr>
          </thead>
          <tbody>
            {planRows.map(row => (
              <React.Fragment key={row.key}>
                <tr>
                  <td style={{
                    ...styles.td,
                    textAlign:'left',
                    fontWeight:600,
                    fontSize:14,
                    background:'#fff',
                    minWidth:220,
                    border:'none',
                  }}>
                    <div>{row.label}</div>
                    <div style={{fontSize:12, color:'#888', marginTop:2}}>
                      Budget 1 User Input: <b>${getInput(row).toLocaleString()}</b>
                    </div>
                  </td>
                  <td style={{
                    ...styles.td,
                    fontWeight:700,
                    fontSize:14,
                    textAlign:'center',
                    border:'none',
                    padding:0
                  }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={getInput(row)}
                      onChange={e => handleInputChange(row.key, e.target.value)}
                      style={{
                        background:'#fffde7',
                        border:'1px solid #f3f4f6',
                        borderRadius:6,
                        color:'#002060',
                        fontWeight:700,
                        fontSize:14,
                        width:'100%',
                        padding:'8px 0',
                        textAlign:'center',
                        outline:'none',
                        fontFamily:'inherit',
                        boxSizing:'border-box',
                        transition:'border 0.2s',
                      }}
                    />
                  </td>
                  <td style={{
                    ...styles.td,
                    border:'none',
                  }}>{row.max ? row.max.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}</td>
                  <td style={{
                    ...styles.td,
                    border:'none',
                  }}>{row.percent ? row.percent.toFixed(2) + '%' : '0.00%'}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr>
              <td style={{...styles.td, backgroundColor:'#002060', color:'#fff', fontWeight:700, fontSize:14}}><b>Total</b></td>
              <td style={{...styles.td, backgroundColor:'#002060', fontSize:14}}></td>
              <td style={{...styles.td, backgroundColor:'#002060', color:'#fff', fontWeight:700, fontSize:14}}>{totalMax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
              <td style={{...styles.td, backgroundColor:'#002060', color:'#fff', fontWeight:700, fontSize:14}}>{totalPercent.toFixed(2) + '%'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Plan Simulations (Traditional 401k, Roth 401k, etc.) */}
      <div style={simpleHeaderStyle}>Traditional 401(k) Balance</div>
      <div style={{...styles.section, padding: 0}}>
        <div style={{display:'flex', gap:48, alignItems:'flex-start', padding:'32px 0'}}>
          {/* Balance Inputs */}
          <div style={{flex:2, minWidth:340, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', gap:12, marginBottom:40}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Contribution Start Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={startAge} onChange={e => setStartAge(Number(e.target.value))} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Retirement Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={endAge} onChange={e => setEndAge(Number(e.target.value))} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Max Contribution</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} type="text" value={`$${maxContribution.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} readOnly />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>Adjustment made for after-tax income</div>
              </div>
            </div>
            <div style={{display:'flex', gap:32}}>
              {/* Series A */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Traditional 401(k) Plan - Series A</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={annualPaymentA} onChange={e => setAnnualPaymentA(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={returnRateA} onChange={e => setReturnRateA(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={employerMatchA} onChange={e => setEmployerMatchA(Number(e.target.value))} /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={withdrawalRateA} onChange={e => setWithdrawalRateA(Number(e.target.value))} /></div>
              </div>
              {/* Series B */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Traditional 401(k) Plan - Series B</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={annualPaymentB} onChange={e => setAnnualPaymentB(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={returnRateB} onChange={e => setReturnRateB(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={employerMatchB} onChange={e => setEmployerMatchB(Number(e.target.value))} /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={withdrawalRateB} onChange={e => setWithdrawalRateB(Number(e.target.value))} /></div>
              </div>
              {/* Series C */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Traditional 401(k) Plan - Series C</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={annualPaymentC} onChange={e => setAnnualPaymentC(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={returnRateC} onChange={e => setReturnRateC(Number(e.target.value))} /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={employerMatchC} onChange={e => setEmployerMatchC(Number(e.target.value))} /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} type="number" value={withdrawalRateC} onChange={e => setWithdrawalRateC(Number(e.target.value))} /></div>
              </div>
            </div>
            {/* Chart for all three series */}
            <div style={{...styles.chartPlaceholder, width:'70%', marginTop:32, marginBottom:0, height:400, background:'white'}}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div style={{display:'flex', gap:32, justifyContent:'center', margin:'12px 0 0 0'}}>
              <div>Retirement Balance - A: <span style={styles.readOnly}>${finalBalanceA.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
              <div>Retirement Balance - B: <span style={styles.readOnly}>${finalBalanceB.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
              <div>Retirement Balance - C: <span style={styles.readOnly}>${finalBalanceC.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
            </div>
          </div>
          {/* Withdrawals Inputs (not yet dynamic) */}
          <div style={{flex:1, minWidth:300, border:'1px solid #bbb', borderRadius:8, padding:'28px 18px', background:'#fafcff'}}>
            <div style={sectionHeaderStyle}>Traditional 401(k) Withdrawals</div>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Annual Draw Rate</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="4" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Starting Distribution Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="70" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>RMD</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} value="73" readOnly />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>RMD: Required Minimum Distribution (last start age for withdrawals)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roth 401(k) Balance & Withdrawals Side by Side */}
      <div style={simpleHeaderStyle}>Roth 401(k) Balance</div>
      <div style={{...styles.section, padding: 0}}>
        <div style={{display:'flex', gap:48, alignItems:'flex-start', padding:'32px 0'}}>
          {/* Balance Inputs */}
          <div style={{flex:2, minWidth:340, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', gap:12, marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Contribution Start Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="20" />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Retirement Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="65" />
              </div>
            </div>
            <div style={{display:'flex', gap:32}}>
              {/* Series A */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series A</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="5000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series B */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series B</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="10000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series C */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series C</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="15000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
            </div>
            {/* Chart Placeholder - only under Balance */}
            <div style={{...styles.chartPlaceholder, width:'70%', marginTop:32, marginBottom:0}}>[Chart: Roth 401(k) Balance vs. Age]</div>
            <div style={{display:'flex', gap:32, justifyContent:'center', margin:'12px 0 0 0'}}>
              <div>Retirement Balance - A: <span style={styles.readOnly}>$1,579,771.58</span></div>
              <div>Retirement Balance - B: <span style={styles.readOnly}>$3,159,543.15</span></div>
              <div>Retirement Balance - C: <span style={styles.readOnly}>$4,739,314.73</span></div>
            </div>
          </div>
          {/* Withdrawals Inputs */}
          <div style={{flex:1, minWidth:300, border:'1px solid #bbb', borderRadius:8, padding:'28px 18px', background:'#fafcff'}}>
            <div style={sectionHeaderStyle}>Roth 401(k) Withdrawals</div>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Annual Draw Rate</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="4" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Starting Distribution Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="70" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>RMD</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} value="73" readOnly />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>RMD: Required Minimum Distribution (last start age for withdrawals)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional IRA Balance & Withdrawals Side by Side */}
      <div style={simpleHeaderStyle}>Traditional IRA Balance</div>
      <div style={{...styles.section, padding: 0}}>
        <div style={{display:'flex', gap:48, alignItems:'flex-start', padding:'32px 0'}}>
          {/* Balance Inputs */}
          <div style={{flex:2, minWidth:340, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', gap:12, marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Contribution Start Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="20" />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Retirement Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="65" />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Max Contribution</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} defaultValue="4573.30" />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>Adjustment made for after-tax income</div>
              </div>
            </div>
            <div style={{display:'flex', gap:32}}>
              {/* Series A */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series A</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="1000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series B */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series B</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="2000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series C */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series C</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
            </div>
            {/* Chart Placeholder - only under Balance */}
            <div style={{...styles.chartPlaceholder, width:'70%', marginTop:32, marginBottom:0}}>[Chart: Traditional IRA Balance vs. Age]</div>
            <div style={{display:'flex', gap:32, justifyContent:'center', margin:'12px 0 0 0'}}>
              <div>Retirement Balance - A: <span style={styles.readOnly}>$483,606.71</span></div>
              <div>Retirement Balance - B: <span style={styles.readOnly}>$967,213.43</span></div>
              <div>Retirement Balance - C: <span style={styles.readOnly}>$1,450,820.14</span></div>
            </div>
          </div>
          {/* Withdrawals Inputs */}
          <div style={{flex:1, minWidth:300, border:'1px solid #bbb', borderRadius:8, padding:'28px 18px', background:'#fafcff'}}>
            <div style={sectionHeaderStyle}>Traditional IRA Withdrawals</div>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Annual Draw Rate</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="4" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Starting Distribution Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="70" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>RMD</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} value="73" readOnly />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>RMD: Required Minimum Distribution (last start age for withdrawals)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roth IRA Balance & Withdrawals Side by Side */}
      <div style={simpleHeaderStyle}>Roth IRA Balance</div>
      <div style={{...styles.section, padding: 0}}>
        <div style={{display:'flex', gap:48, alignItems:'flex-start', padding:'32px 0'}}>
          {/* Balance Inputs */}
          <div style={{flex:2, minWidth:340, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', gap:12, marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Contribution Start Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="20" />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:4}}>Retirement Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="65" />
              </div>
            </div>
            <div style={{display:'flex', gap:32}}>
              {/* Series A */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series A</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="4638" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series B */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series B</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="5638" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
              {/* Series C */}
              <div style={{flex:1, border:'1px solid #bbb', borderRadius:8, padding:'20px 18px', marginBottom:8, minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:8, textAlign:'center', color:'#002060'}}>Roth IRA Plan - Series C</div>
                <div style={{marginBottom:8}}>Annual Payment <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7000" /></div>
                <div style={{marginBottom:8}}>Annual Return Rate (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="7" /></div>
                <div style={{marginBottom:8}}>Employer Match (%) <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="3" /></div>
                <div>Withdrawal Rate <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="6" /></div>
              </div>
            </div>
            {/* Chart Placeholder - only under Balance */}
            <div style={{...styles.chartPlaceholder, width:'70%', marginTop:32, marginBottom:0}}>[Chart: Roth IRA Balance vs. Age]</div>
            <div style={{display:'flex', gap:32, justifyContent:'center', margin:'12px 0 0 0'}}>
              <div>Retirement Balance - A: <span style={styles.readOnly}>$1,465,396.12</span></div>
              <div>Retirement Balance - B: <span style={styles.readOnly}>$1,781,350.43</span></div>
              <div>Retirement Balance - C: <span style={styles.readOnly}>$2,211,680.21</span></div>
            </div>
          </div>
          {/* Withdrawals Inputs */}
          <div style={{flex:1, minWidth:300, border:'1px solid #bbb', borderRadius:8, padding:'28px 18px', background:'#fafcff'}}>
            <div style={sectionHeaderStyle}>Roth IRA Withdrawals</div>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Annual Draw Rate</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="4" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>Starting Distribution Age</div>
                <input style={{...styles.input, fontWeight:700, background:'#fffde7', textAlign:'center'}} defaultValue="70" />
              </div>
              <div>
                <div style={{fontWeight:600, marginBottom:4}}>RMD</div>
                <input style={{...styles.input, fontWeight:700, background:'#fbeee6', textAlign:'center'}} value="73" readOnly />
                <div style={{fontSize:11, fontStyle:'italic', color:'#888'}}>RMD: Required Minimum Distribution (last start age for withdrawals)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Tax Info Section */}
      <div style={simpleHeaderStyle}>
        State Tax Information{selectedState ? ` (${selectedState})` : ''}
      </div>
      <div style={styles.section}>
        {selectedState ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tax Rate</th>
                <th style={styles.th}>Lower Bound</th>
              </tr>
            </thead>
            <tbody>
              {stateBrackets.map((row, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{(row.rate * 100).toFixed(2)}%</td>
                  <td style={styles.td}>${row.lowerBound.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#b91c1c', fontWeight: 500, fontSize: 16 }}>
            Please select a state in Week 1 to view tax brackets.
          </div>
        )}
      </div>

      {/* Tax Summary Section */}
      <div style={simpleHeaderStyle}>Tax Summary</div>
      <div style={styles.section}>
        <table style={{ ...styles.table, width: '60%', margin: '0 auto' }}>
          <tbody>
            <tr>
              <td style={{ ...styles.td, fontWeight: 600 }}>Standard Deduction</td>
              <td style={styles.td}>$15,000</td>
            </tr>
            <tr>
              <td style={styles.td}>Taxable Savings</td>
              <td style={styles.td}>[Taxable Savings]</td>
            </tr>
            <tr>
              <td style={styles.td}>Taxable Income for Tax Bracket</td>
              <td style={styles.td}>[Taxable Income]</td>
            </tr>
            <tr>
              <td style={styles.td}>Federal Income Tax Payment</td>
              <td style={styles.td}>[Federal Tax]</td>
            </tr>
            <tr>
              <td style={styles.td}>State Income Tax Payment</td>
              <td style={styles.td}>[State Tax]</td>
            </tr>
            <tr>
              <td style={styles.td}>Early Withdrawal Penalty</td>
              <td style={styles.td}>[Penalty]</td>
            </tr>
            <tr>
              <td style={{ ...styles.td, fontWeight: 700, fontSize: 16, borderTop: '2px solid #002060' }}>After Tax Savings</td>
              <td style={{ ...styles.td, fontWeight: 700, fontSize: 16, borderTop: '2px solid #002060', color: '#0d1a4b' }}>[After Tax Savings]</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  );
} 