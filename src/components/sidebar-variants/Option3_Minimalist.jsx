// OPTION 3: MINIMALIST MODERN SIDEBAR
// Clean, minimal tasarım ile perfect spacing

export const MinimalistSidebar = ({ 
  sidebarCollapsed, 
  toggleSidebar, 
  isLoaded, 
  isAdmin, 
  user, 
  handleLogout,
  logo,
  riceLogo,
  SidebarLink,
  isWeekAccessible,
  MdChevronLeft,
  MdChevronRight,
  FaChalkboardTeacher,
  MdBarChart,
  FaFileExcel
}) => {
  return (
    <div 
      className="sidebar-modern"
      style={{
        width: '280px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
        transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        borderRadius: '0 16px 16px 0',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Logo Section - Clean & Minimal */}
      <div 
        className="flex flex-col items-center w-full px-6"
        style={{
          paddingTop: '24px',
          paddingBottom: '32px', // Admin Panel'den uzaklaştırmak için
          opacity: sidebarCollapsed ? 0 : (isLoaded ? 1 : 0),
          transform: sidebarCollapsed ? 'translateY(-8px)' : (isLoaded ? 'translateY(0)' : 'translateY(-8px)'),
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
          pointerEvents: sidebarCollapsed ? 'none' : 'auto',
        }}
      >
        <div 
          className="flex flex-col items-center px-4 w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.03)',
          }}
        >
          <img 
            src={logo} 
            alt="UNIV154 Logo" 
            style={{ 
              height: '70px', 
              width: 'auto',
              filter: 'drop-shadow(0 2px 8px rgba(13, 26, 75, 0.1))',
            }}
            className={`object-contain transition-all duration-700 ${isLoaded ? 'scale-100' : 'scale-75'}`}
          />
          <div className="text-center w-full flex flex-col items-center" style={{ marginTop: '8px', gap: '0px' }}>
            <h1 className="font-semibold tracking-tight text-[#0d1a4b] text-center" style={{ fontSize: '15px' }}>
              Financial Literacy for Life
            </h1>
            <p className="text-xs tracking-wide text-gray-500 text-center" style={{ fontSize: '13px', marginTop: '2px' }}>
              Preparing for the Real World
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-1 px-4">
        {/* Admin Section */}
        {isAdmin && (
          <div 
            style={{
              marginTop: '0px', // Preparing yazısından uzaklaştırmak için
              marginBottom: '40px', // Module 1'den uzaklaştırmak için
              paddingTop: '0px',
              paddingBottom: '0px',
              opacity: sidebarCollapsed ? 0 : (isLoaded ? 1 : 0),
              transform: sidebarCollapsed ? 'translateY(4px)' : (isLoaded ? 'translateY(0)' : 'translateY(4px)'),
              transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              pointerEvents: sidebarCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="flex justify-center">
              <SidebarLink
                href="/dashboard/admin/week-access"
                delay={0}
                icon={FaChalkboardTeacher}
                text="Admin Panel"
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#0d1a4b',
                  textAlign: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}
                className="
                  justify-center text-center w-full
                "
                isAdminLink={true}
              />
            </div>
          </div>
        )}

        {/* Excel Workshop Section */}
        <div 
          style={{
            marginTop: '0px', // Admin Panel'den uzaklaştırmak için (yukarıda marginBottom var)
            marginBottom: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            opacity: sidebarCollapsed ? 0 : (isLoaded ? 1 : 0),
            transform: sidebarCollapsed ? 'translateY(4px)' : (isLoaded ? 'translateY(0)' : 'translateY(4px)'),
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            pointerEvents: sidebarCollapsed ? 'none' : 'auto',
          }}
        >
          <div className="space-y-2">
            {[...Array(9)].map((_, i) => {
              // Map module index to actual week ID for routing
              let weekId;
              if (i === 0) weekId = 'week-1';      // Module 1 -> Week 1
              else if (i === 1) weekId = 'week-2';  // Module 2 -> Week 2
              else if (i === 2) weekId = 'week-3';  // Module 3 -> Week 3
              else if (i === 3) weekId = 'week-4';  // Module 4 -> Week 4
              else if (i === 4) weekId = 'week-6';  // Module 5 -> Week 6 (Retirement)
              else if (i === 5) weekId = 'week-9';  // Module 6 -> Week 9 (Markets & Investing)
              else if (i === 6) weekId = 'week-8';  // Module 7 -> Week 8 (Portfolio Construction)
              else if (i === 7) weekId = 'week-7';  // Module 8 -> Week 7 (Insurance)
              else weekId = 'week-5';               // Module 9 -> Week 5 (Real Estate)
              
              const isAccessible = isWeekAccessible(weekId);
              let weekLabel = `Module ${i+1}`;
              let weekText = null;
              
              if (i === 0) weekLabel = 'Module 1 - Budgeting';
              if (i === 1) weekLabel = 'Module 2 - Savings';
              if (i === 2) weekLabel = 'Module 3 - Credit & Debt';
              if (i === 3) weekLabel = 'Module 4 - Income & Taxes';
              if (i === 4) {
                weekLabel = 'Module 5 - Retirement Planning';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Module 5 - Retirement Planning
                    </span>
                  </span>
                );
              }
              if (i === 5) {
                weekLabel = 'Module 6 - Markets & Investing';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Module 6 - Markets & Investing
                    </span>
                  </span>
                );
              }
              if (i === 6) {
                weekLabel = 'Module 7 - Portfolio Construction';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Module 7 - Portfolio Construction
                    </span>
                  </span>
                );
              }
              if (i === 7) weekLabel = 'Module 8 - Insurance';
              if (i === 8) {
                weekLabel = 'Module 9 - Real Estate';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Module 9 - Real Estate
                    </span>
                  </span>
                );
              }
              
              if (!isAccessible && !isAdmin) {
                // Locked week'ler için de aynı format, sadece disabled
                return (
                  <SidebarLink
                    key={`excel-week-${i+1}`}
                    href="#"
                    delay={i}
                    isAdminLink={false}
                    disabled={true}
                    style={{
                      fontSize: '13px',
                      fontWeight: 'normal',
                      padding: '8px 12px',
                      borderRadius: '16px',
                    }}
                    className="
                      transition-all duration-200
                      rounded-2xl
                    "
                    text={
                      <span className="flex items-center w-full">
                        <FaFileExcel 
                          color="#0d1a4b" 
                          className="w-3.5 h-3.5 transition-all duration-300" 
                        />
                        <span style={{marginLeft: '8px', color: '#0d1a4b', fontSize: '13px'}}>{weekLabel}</span>
                        <span className="ml-auto text-xs" style={{ color: '#9ca3af' }}>🔒</span>
                      </span>
                    }
                  />
                );
              }
              
              return (
                <SidebarLink
                  key={`excel-week-${i+1}`}
                  href={isAccessible ? `/dashboard/excel/${weekId}` : '#'}
                  delay={i}
                  isAdminLink={false}
                  style={{
                    fontSize: '13px',
                    fontWeight: 'normal',
                    padding: '8px 12px',
                    borderRadius: '16px',
                  }}
                  className="
                    hover:bg-gradient-to-r hover:from-[#fffde7] hover:to-yellow-50
                    transition-all duration-200
                    rounded-2xl
                  "
                  text={
                    (i === 4 || i === 5 || i === 6 || i === 8) ? weekText : (
                      <span className="flex items-center group/item">
                        <FaFileExcel 
                          color={isAccessible ? "#0d1a4b" : "#9ca3af"} 
                          className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3" 
                        />
                        <span style={{marginLeft: '8px', color: isAccessible ? '#0d1a4b' : '#9ca3af', fontSize: '13px'}}>{weekLabel}</span>
                      </span>
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile - At bottom - Minimalist Style */}
      <div 
        className="mt-auto"
        style={{
          opacity: sidebarCollapsed ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: sidebarCollapsed ? 'none' : 'auto',
          paddingTop: '24px',
          paddingBottom: '20px',
        }}
      >
        <div className="flex flex-col items-center w-full px-6">
            <img 
              src={riceLogo} 
              alt="Rice University Logo" 
              style={{ 
                height: '70px', 
                width: 'auto', 
                marginBottom: '20px',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))',
              }}
              className="object-contain"
            />
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(13, 26, 75, 0.8)',
                fontWeight: '500',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #fffde7, #fef9c3)';
                e.currentTarget.style.color = '#0d1a4b';
                e.currentTarget.style.fontWeight = '500';
                e.currentTarget.style.transform = 'scale(1.01) translateX(4px)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(250, 204, 21, 0.2), 0 0 0 1px rgba(250, 204, 21, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(13, 26, 75, 0.8)';
                e.currentTarget.style.fontWeight = '500';
                e.currentTarget.style.transform = 'scale(1) translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </div>
      </div>
    </div>
  );
};
