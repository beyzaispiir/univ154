import React, { createContext, useState, useMemo, useContext } from 'react';
import { calculateFinancials } from '../utils/taxCalculator';

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [topInputs, setTopInputs] = useState({
    preTaxIncome: '1000000',
    location: 'TX',
    housingCosts: 'Medium',
  });

  const [deductionChoices, setDeductionChoices] = useState({
    marriageStatus: 'single',
    filedJointly: 'independently',
    dependency: 'no',
    age: 'under65',
    blind: 'no',
    qualifyingSurvivingSpouse: 'no',
  });

  // New: Retirement plan user inputs (shared between Week 1 and Week 6)
  const [retirementInputs, setRetirementInputs] = useState({
    retirement_traditional_401k: '',
    retirement_roth_401k: '',
    retirement_traditional_ira: '',
    retirement_roth_ira: '',
    retirement_simple_ira: '',
    retirement_403b: '',
    retirement_457b: '',
    retirement_thrift: '',
    retirement_private_db: '',
    retirement_gov_db: '',
  });

  const financialCalculations = useMemo(() => {
    const preTax = parseFloat(topInputs.preTaxIncome) || 0;
    return calculateFinancials(preTax, deductionChoices, topInputs.location);
  }, [topInputs.preTaxIncome, deductionChoices, topInputs.location]);

  const value = {
    topInputs,
    setTopInputs,
    deductionChoices,
    setDeductionChoices,
    financialCalculations,
    retirementInputs,
    setRetirementInputs,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 