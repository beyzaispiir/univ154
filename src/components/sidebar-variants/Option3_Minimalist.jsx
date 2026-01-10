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
              marginBottom: '40px', // Week 1'den uzaklaştırmak için
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
            {[...Array(10)].map((_, i) => {
              const weekId = `week-${i+1}`;
              const isAccessible = isWeekAccessible(weekId);
              let weekLabel = `Week ${i+1}`;
              let weekText = null;
              
              if (i === 0) weekLabel = 'Week 1 - Budgeting';
              if (i === 1) weekLabel = 'Week 2 - Savings';
              if (i === 2) weekLabel = 'Week 3 - Credit & Debt';
              if (i === 3) weekLabel = 'Week 4 - Income & Taxes';
              if (i === 4) {
                weekLabel = 'Week 5 - Real Estate';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Week 5 - Real Estate
                    </span>
                  </span>
                );
              }
              if (i === 5) {
                weekLabel = 'Week 6 - Retirement';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Week 6 - Retirement
                    </span>
                  </span>
                );
              }
              if (i === 6) weekLabel = 'Week 7 - Insurance & Risk';
              if (i === 7) {
                weekLabel = 'Week 8 - Psych of Finance';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Week 8 - Psych of Finance
                    </span>
                  </span>
                );
              }
              if (i === 8) {
                weekLabel = 'Week 9 - Investing';
                weekText = (
                  <span className="flex items-center group/item">
                    <FaFileExcel
                      color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                      className="w-3.5 h-3.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                    />
                    <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px', fontSize: '13px' }}>
                      Week 9 - Investing
                    </span>
                  </span>
                );
              }
              if (i === 9) weekLabel = 'Week 10 - Major Events';
              
              if (!isAccessible && !isAdmin) {
                return (
                  <div
                    key={`excel-week-${i + 1}`}
                    className="
                      flex items-center px-3 py-2 
                      rounded-2xl 
                      cursor-not-allowed 
                      opacity-50
                    "
                    style={{
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                      fontSize: 13,
                      fontWeight: 'normal',
                      borderRadius: '16px',
                    }}
                  >
                    <span className="flex items-center w-full">
                      {i === 4 ? (
                        <span className="flex items-center">
                          <FaFileExcel color="#d1d5db" className="w-3.5 h-3.5 transition-transform duration-300" />
                          <span className="ml-2 text-gray-400" style={{ marginLeft: '8px', fontSize: '13px' }}>Week 5 - Real Estate</span>
                        </span>
                      ) : i === 5 ? (
                        <span className="flex items-center">
                          <FaFileExcel color="#d1d5db" className="w-3.5 h-3.5 transition-transform duration-300" />
                          <span className="ml-2 text-gray-400" style={{ marginLeft: '8px', fontSize: '13px' }}>Week 6 - Retirement</span>
                        </span>
                      ) : i === 7 ? (
                        <span className="flex items-center">
                          <FaFileExcel color="#d1d5db" className="w-3.5 h-3.5 transition-transform duration-300" />
                          <span className="ml-2 text-gray-400" style={{ marginLeft: '8px', fontSize: '13px' }}>Week 8 - Psych of Finance</span>
                        </span>
                      ) : i === 8 ? (
                        <span className="flex items-center">
                          <FaFileExcel color="#d1d5db" className="w-3.5 h-3.5 transition-transform duration-300" />
                          <span className="ml-2 text-gray-400" style={{ marginLeft: '8px', fontSize: '13px' }}>Week 9 - Investing</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaFileExcel color="#d1d5db" className="w-3.5 h-3.5 transition-transform duration-300" />
                          <span className="ml-2 text-gray-400" style={{ marginLeft: '8px', fontSize: '13px' }}>{weekLabel}</span>
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-300">🔒</span>
                    </span>
                  </div>
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
                    hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                    transition-all duration-200
                    rounded-2xl
                  "
                  text={
                    i === 5 ? weekText : (
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
                e.currentTarget.style.background = 'linear-gradient(to right, #fffde7, rgba(250, 204, 21, 0.2))';
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
