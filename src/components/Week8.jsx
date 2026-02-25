import React from 'react';

const Week8 = () => {
  // Handler functions for save/load using localStorage
  const handleSaveWeek8 = async () => {
    try {
      const week8Data = {
        // Week 8 specific data will go here when content is developed
        week: 8,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('week8_data', JSON.stringify(week8Data));
      alert('Week 8 data saved successfully!');
    } catch (error) {
      console.error('Error saving Week 8 data:', error);
      alert('Error saving Week 8 data. Please try again.');
    }
  };

  const handleLoadWeek8 = async () => {
    try {
      const savedData = localStorage.getItem('week8_data');
      
      if (savedData) {
        const week8Data = JSON.parse(savedData);
        // Week 8 specific data loading will go here when content is developed
        alert('Week 8 data loaded successfully!');
      } else {
        alert('No saved data found for Week 8.');
      }
    } catch (error) {
      console.error('Error loading Week 8 data:', error);
      alert('Error loading Week 8 data. Please try again.');
    }
  };

  // Styling matching Week 1, Week 2, and Week 3 patterns exactly
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
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
      background: 'linear-gradient(90deg, #002060, #28a745, #002060)',
      margin: '20px 0',
      borderRadius: '2px',
      boxShadow: '0 2px 4px rgba(0, 32, 96, 0.2)'
    },
    placeholderContent: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
      fontSize: '16px',
      lineHeight: '1.6'
    },
    comingSoon: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#002060',
      marginBottom: '16px'
    },
    description: {
      fontSize: '14px',
      color: '#888',
      marginBottom: '20px'
    }
  };

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

      <div style={styles.container}>
        <div style={{width: '1200px', maxWidth: '1200px'}}>
          {/* Section Container - matching Week 1, 2, 3 layered design */}
          <div style={styles.sectionContainer}>
            {/* Enhanced Header */}
            <div style={styles.enhancedHeader}>
              <span style={{ fontSize: '26px', letterSpacing: '-0.02em' }}>Portfolio Construction</span>
            </div>
            
            {/* Placeholder Content */}
            <div style={styles.placeholderContent}>
              <div style={styles.comingSoon}>
                🚧 Coming Soon
              </div>
              <div style={styles.description}>
                This week's content is currently under development.
              </div>
              <div style={styles.description}>
                Psychology of finance and behavioral economics tools will be available here.
              </div>
            </div>
          </div>
          
          {/* Section Divider */}
          <div style={styles.sectionDivider}></div>

          {/* Save/Load Buttons - enhanced like Week 1/2/3 */}
          <div style={{
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={handleSaveWeek8}
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
              💾 Save Week 8 Data
            </button>
            <button
              onClick={handleLoadWeek8}
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
              📁 Load Week 8 Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Week8;
