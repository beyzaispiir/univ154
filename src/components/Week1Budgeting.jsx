import React from 'react';
import BudgetForm from './BudgetForm';

// This data structure now includes all necessary info for rendering the exact layout

// Styles are now handled in BudgetForm component

const Week1BudgetingWrapper = () => {
  return (
    <div>
      <BudgetForm />
    </div>
  );
}

export default function Week1Budgeting() {
  return (
    <>
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
        border: '1px solid rgba(13, 26, 75, 0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        borderRadius: '14px',
        padding: '12px 20px',
        color: '#0d1a4b',
        fontWeight: 500,
        fontSize: 12
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d1a4b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
        You can only enter data in the open (yellow) fields.
      </div>
      <Week1BudgetingWrapper />
    </>
  );
} 