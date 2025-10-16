import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'
import ModuleView from './ModuleView'
import ExcelWorkshop from './ExcelWorkshop'
import LectureNotes from './LectureNotes'
import Overview from './pages/Overview'
import BudgetPlanner from './pages/BudgetPlanner'
import Analytics from './pages/Analytics'
import { BudgetProvider } from '../contexts/BudgetContext'
import { WeekAccessProvider, useWeekAccess } from '../contexts/WeekAccessContext'

// Import icons
import { MdDashboard, MdSchool, MdInsertChart, MdChat, MdNotifications, MdUpload, MdDownload, MdBook, MdCheckCircle, MdBarChart, MdAccountBalance, MdTimeline, MdCalendarToday, MdAssignment, MdTrendingUp, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { BsCalendar3 } from 'react-icons/bs'
import { FaChalkboardTeacher } from 'react-icons/fa'
import { FaFileExcel } from 'react-icons/fa'

// Avatar component with initials fallback
const Avatar = ({ url, name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  
  if (url) {
    return (
      <img 
        src={url} 
        alt={name || 'Profile'} 
        className="w-full h-full object-cover rounded-full bg-white"
        style={{ minWidth: '100%', minHeight: '100%' }}
      />
    )
  }

  return (
    <div 
      className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-medium bg-white"
      style={{ backgroundColor: '#ffffff', color: '#0d1a4b', minWidth: '60%', minHeight: '60%' }}
    >
      {initial}
    </div>
  )
}

// Enhanced SidebarLink with better hover effects and animations
const SidebarLink = ({ icon: Icon, text, href, subText, style, delay = 0, isAdminLink = false }) => {
  const location = useLocation();
  const isActive = location.pathname === href || 
                   (href === '/dashboard' && location.pathname === '/dashboard/') ||
                   (href === '/dashboard/admin/week-access' && location.pathname.startsWith('/dashboard/admin/'));

  return (
    <Link
      to={href}
      className={`
        flex items-center px-[12px] py-[12px] transition-all duration-300 ease-out rounded-lg no-underline
        transform hover:scale-[1.02] hover:-translate-y-0.5
        ${isActive 
          ? isAdminLink 
            ? 'bg-red-100 text-[#0d1a4b] font-medium shadow-md' 
            : 'bg-[#fffde7] text-[#0d1a4b] font-medium shadow-md border-l-4 border-[#0d1a4b]'
          : 'bg-white text-[#0d1a4b]/80 hover:shadow-sm'
        }
        ${isAdminLink ? 'bg-[#fffde7] text-[#0d1a4b]' : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#0d1a4b]'}
        animate-fadeInUp
      `}
      style={{
        animationDelay: `${delay * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <span className="flex items-center">
        {Icon && (typeof Icon === 'function' ? <Icon className="w-[18px] h-[18px] mr-3" /> : Icon)}
        <span className="font-medium text-[15px] transition-colors duration-300" style={style}>{text}</span>
      </span>
      {subText && <span className="text-xs text-gray-500 transition-colors duration-300">{subText}</span>}
      {/* Active indicator */}
      {isActive && (
        <div className={`w-2 h-2 rounded-full animate-pulse ml-auto ${isAdminLink ? 'bg-[#dc2626]' : 'bg-[#0d1a4b]'}`} />
      )}
    </Link>
  );
};

const ModuleCard = ({ title, description, progress, isActive, onClick, dependencies }) => (
  <div 
    className={`relative p-6 rounded-lg border-2 ${
      isActive ? 'border-[#0d1a4b] bg-white' : 'border-gray-200 bg-gray-50'
    } transition-all duration-200 cursor-pointer hover:shadow-lg`}
    onClick={onClick}
  >
    <h3 className="text-xl font-semibold text-[#0d1a4b] mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-[#0d1a4b] h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="ml-2 text-sm text-gray-600">{progress}%</span>
    </div>
    {dependencies && dependencies.length > 0 && (
      <div className="absolute -top-3 left-4 bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800">
        Requires: {dependencies.join(', ')}
      </div>
    )}
  </div>
)

const PathConnector = ({ isActive }) => (
  <div className="flex items-center justify-center h-12">
    <div className={`h-full w-0.5 ${isActive ? 'bg-[#0d1a4b]' : 'bg-gray-200'}`}></div>
  </div>
)

function DashboardContent() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Use the centralized admin check from AuthContext
  // const isAdmin = isUserAdmin(user?.email)  // Remove this line
  
  // Clear OAuth progress flag when dashboard loads
  useEffect(() => {
    if (user) {
      localStorage.removeItem('oauthInProgress');
      console.log('Dashboard loaded, cleared OAuth progress flag');
    }
  }, [user]);
  
  console.log('=== DashboardContent Debug ===');
  console.log('User object:', user);
  console.log('User email:', user?.email);
  console.log('User ID:', user?.id);
  console.log('User created_at:', user?.created_at);
  console.log('Is admin?', isAdmin);
  console.log('Admin check from AuthContext:', isAdmin);
  console.log('=============================');
  
  return (
    <WeekAccessProvider user={user} isAdmin={isAdmin}>
      <DashboardContentInner isAdmin={isAdmin} user={user} signOut={signOut} />
    </WeekAccessProvider>
  )
}

function DashboardContentInner({ isAdmin, user, signOut }) {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Use week access context
  const { isWeekAccessible } = useWeekAccess()
  
  console.log('DashboardContentInner: User:', user);
  console.log('DashboardContentInner: User email:', user?.email);
  console.log('DashboardContentInner: Is admin?', isAdmin);

  // Animation effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, navigate to login page
      navigate('/')
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[280px]'} bg-white h-full fixed left-0 top-0 border-r border-gray-100 flex flex-col overflow-y-auto transition-all duration-300 z-10`}>
        {/* Toggle Button */}
        <div className="flex justify-end p-3">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center transition-all duration-200 hover:scale-105"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ 
              backgroundColor: '#fffde7', // Site yellow/cream color
              borderRadius: '8px',
              minWidth: '40px',
              minHeight: '40px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            {sidebarCollapsed ? (
              // Right chevron when collapsed (to expand)
              <MdChevronRight 
                className="transition-transform duration-300" 
                style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d1a4b' }}
              />
            ) : (
              // Left chevron when expanded (to collapse)
              <MdChevronLeft 
                className="transition-transform duration-300" 
                style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d1a4b' }}
              />
            )}
          </button>
        </div>

        {/* Collapsed State - Show only icons - DISABLED */}
        {false && (
          <div className="flex flex-col items-center space-y-3 py-4">
            {/* Dashboard Icon - Home */}
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Dashboard"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            
            {/* Excel Workshop Icon - File with chart */}
            <button
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Excel Workshop"
            >
              <FaFileExcel className="w-6 h-6 text-green-600" />
            </button>
            
            {/* Weeks Icon - Calendar */}
            <button
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Weekly Modules"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            {/* Logout Icon - Clear logout symbol */}
            <button
              onClick={handleLogout}
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 mt-auto"
              title="Logout"
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Logo Section */}
        <div className={`flex flex-col items-center w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${sidebarCollapsed ? 'hidden' : ''}`}>
          <div className="flex flex-col items-center py-6 px-4 w-full">
            <img 
              src={logo} 
              alt="UNIV154 Logo" 
              style={{ height: '62px', width: 'auto' }}
              className={`object-contain transition-all duration-700 ${isLoaded ? 'scale-100' : 'scale-75'}`}
            />
            <div className="text-center w-full mt-2 flex flex-col items-center">
              <h1 className="font-bold tracking-wide text-[#0d1a4b] text-center" style={{ fontSize: '16px', marginTop: '-0.5rem', marginBottom: '0' }}>
                Financial Literacy for Life
              </h1>
              <p className="text-sm tracking-wide text-[#0d1a4b] text-center" style={{ fontSize: '14px', marginTop: '0' }}>
                Preparing for the Real World
              </p>
            </div>
          </div>
        </div>

        {/* Option 1: Subtle Gradient with Line */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0">
            <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-[#fdb913]/20 to-transparent" />
            <div className="h-[1px] mx-8 mt-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
        </div>

        {/* Option 2: Gradient Background Transition */}
        <div className="h-[40px] bg-gradient-to-b from-white via-gray-50/50 to-white" />

        {/* Option 3: Modern Dot Pattern */}
        <div className="flex justify-center py-4">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <div className="w-1 h-1 rounded-full bg-[#fdb913]/30" />
            <div className="w-1 h-1 rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-2">
          {/* Admin Section */}
          {isAdmin && (
            <div className={`py-[10px] transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex justify-center">
                <SidebarLink
                  href="/dashboard/admin/week-access"
                  delay={0}
                  icon={FaChalkboardTeacher}
                  text="Admin Panel"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'semibold',
                    color: '#0d1a4b',
                    textAlign: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                  className="justify-center text-center w-full"
                  isAdminLink={true}
                />
              </div>
            </div>
          )}

          {/* Excel Workshop Section with new WeekCard design */}
          <div className={`py-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${sidebarCollapsed ? 'hidden' : ''}`}>
              <div className="flex items-center gap-3 pl-6 mb-4">
                  <div className={`p-2 rounded-lg bg-[#fffde7] transition-all duration-500 ${isLoaded ? 'scale-100' : 'scale-0'}`}> 
                    <MdBarChart className="w-[22px] h-[22px] text-[#0d1a4b]" />
                  </div>
                  <span className="font-semibold text-[#0d1a4b]" style={{ fontSize: '16px' }}>Excel Workshop</span>
              </div>
              
              <div className="px-[12px] space-y-[10px]">
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
                        <span className="flex items-center">
                          <FaFileExcel
                            color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                            className="w-4 h-4"
                          />
                          <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px' }}>
                            Week 5 - Real Estate
                          </span>
                        </span>
                      );
                    }
                    if (i === 5) {
                      weekLabel = 'Week 6 - Retirement';
                      weekText = (
                        <span className="flex items-center">
                          <FaFileExcel
                            color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                            className="w-4 h-4"
                          />
                          <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px' }}>
                            Week 6 - Retirement
                          </span>
                        </span>
                      );
                      
                    }
                    if (i === 6) weekLabel = 'Week 7 - Insurance & Risk';
                    if (i === 7) {
                      weekLabel = 'Week 8 - Psych of Finance';
                      weekText = (
                        <span className="flex items-center">
                          <FaFileExcel
                            color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                            className="w-4 h-4"
                          />
                          <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px' }}>
                            Week 8 - Psych of Finance
                          </span>
                        </span>
                      );
                    }
                    if (i === 8) {
                      weekLabel = 'Week 9 - Investing';
                      weekText = (
                        <span className="flex items-center">
                          <FaFileExcel
                            color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                            className="w-4 h-4"
                          />
                          <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af", marginLeft: '8px' }}>
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
                          className="flex items-center px-[12px] py-[12px] rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
                          style={{ fontSize: 14, fontWeight: 'normal' }}
                        >
                          <span className="flex items-center w-full">
                            {i === 4 ? (
                              // Week 5: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400" style={{ marginLeft: '8px' }}>Week 5 - Real Estate</span>
                              </span>
                            ) : i === 5 ? (
                              // Week 6: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400" style={{ marginLeft: '8px' }}>Week 6 - Retirement</span>
                              </span>
                            ) : i === 7 ? (
                              // Week 8: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400" style={{ marginLeft: '8px' }}>Week 8 - Psych of Finance</span>
                              </span>
                            ) : i === 8 ? (
                              // Week 9: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400" style={{ marginLeft: '8px' }}>Week 9 - Investing</span>
                              </span>
                            ) : (
                              // Diğer haftalar: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400" style={{ marginLeft: '8px' }}>{weekLabel}</span>
                              </span>
                            )}
                            <span className="ml-auto text-xs text-gray-400">🔒</span>
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
                        fontSize: '14px',
                        fontWeight: 'normal'
                      }}
                      text={
                          i === 5 ? weekText : (
                            <span className="flex items-center">
                          <FaFileExcel color={isAccessible ? "#0d1a4b" : "#9ca3af"} className="w-4 h-4" />
                              <span style={{marginLeft: '8px', color: isAccessible ? '#0d1a4b' : '#9ca3af'}}>{weekLabel}</span>
                        </span>
                          )
                      }
                    />
                    );
                  })}
              </div>
          </div>
        </nav>

        {/* User Profile - At bottom */}
        <div className={`mt-auto ${sidebarCollapsed ? 'hidden' : ''}`}>
          {/* Rice Logo above logout */}
          <div className="flex flex-col items-center w-full mb-2">
            <img 
              src={riceLogo} 
              alt="Rice University Logo" 
              style={{ height: '80px', width: 'auto', marginBottom: '10px' }}
              className="object-contain"
            />
          </div>
          <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="p-4">
              <button
                onClick={handleLogout}
                style={{ 
                  height: '37px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#0d1a4b',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#fdb913';
                  e.target.style.backgroundColor = 'rgba(253, 185, 19, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
 
      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'ml-[60px]' : 'ml-[280px]'} flex-1 h-full overflow-y-auto transition-all duration-300`}>
        {/* Top Bar - DISABLED */}
        {/* 
        <div className="bg-white border-b border-gray-100 px-8" style={{ height: '80px' }}>
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-[300px] text-sm focus:outline-none focus:border-[#fdb913] focus:ring-1 focus:ring-[#fdb913]"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-2" style={{ gap: '20px' }}>
                <div className="mr-8 flex flex-col items-end">
                  <div className="mb-2">
                    {isEditingName ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmedName = displayName.trim();
                          if (trimmedName) {
                            saveDisplayName();
                          } else {
                            setIsEditingName(false);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsEditingName(false);
                            }
                          }}
                          placeholder="Enter your name"
                          className="w-[200px] px-3 py-2 text-base border border-gray-200 rounded-lg
                          focus:border-[#fdb913] focus:ring-1 focus:ring-[#fdb913] focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={isSaving || !displayName.trim()}
                          className="text-base px-3 py-2 bg-white border border-gray-200 rounded-lg
                          hover:border-[#fdb913] text-[#0d1a4b]"
                        >
                          {isSaving ? '...' : '✓'}
                        </button>
                      </form>
                    ) : displayName ? (
                      <p 
                        onClick={() => setIsEditingName(true)}
                        className="text-[#0d1a4b] text-base font-medium text-right cursor-pointer hover:text-[#162456]"
                      >
                        {displayName}
                      </p>
                    ) : (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-[#0d1a4b] text-base font-medium hover:text-[#162456] text-right"
                      >
                        Click to add name
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isAdmin ? 'Admin' : 'Student'}
                  </div>
                </div>

                <div className="relative group">
                  <div className="w-[50px] h-[50px] rounded-full bg-white overflow-hidden border-[2.7px] border-[#0d1a4b] p-0.5">
                    <Avatar 
                      url={avatarUrl}
                      name={displayName}
                      color={avatarColor}
                      size={50}
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white 
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    {isUploadingAvatar ? (
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Main Content Area */}
        <div className="py-8 px-8">
          {/* Top Navigation Bar - DISABLED */}
          {/* 
          <div className="mb-8">
            <h1 className="text-[24px] font-semibold text-gray-900 mb-1">
              {location.pathname.includes('modules') ? 'Course Modules' 
                : location.pathname.includes('excel') ? 'Excel Workshop' 
                : location.pathname.includes('lectures') ? 'Lecture Notes' 
                : location.pathname.includes('budget') ? 'Budget Planner'
                : location.pathname.includes('charts') ? 'Analytics'
                : 'Dashboard'}
            </h1>
            <p className="text-gray-500 text-[14px]">
              {location.pathname.includes('modules') 
                ? 'Explore and complete your financial education modules'
                : location.pathname.includes('excel')
                ? 'Upload and analyze your Excel data'
                : location.pathname.includes('lectures')
                ? 'Access your lecture notes'
                : location.pathname.includes('budget')
                ? 'Plan and track your budget'
                : location.pathname.includes('charts')
                ? 'Analyze your financial data'
                : 'Welcome back to your financial journey!'}
            </p>
          </div>
          */}

          {/* Render nested routes */}
          <BudgetProvider>
            <Outlet />
          </BudgetProvider>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardContent />
  )
} 