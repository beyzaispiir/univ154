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

  const financialCalculations = useMemo(() => {
    const preTax = parseFloat(topInputs.preTaxIncome) || 0;
    return calculateFinancials(preTax, deductionChoices);
  }, [topInputs.preTaxIncome, deductionChoices]);

  const value = {
    topInputs,
    setTopInputs,
    deductionChoices,
    setDeductionChoices,
    financialCalculations,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 