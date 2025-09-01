import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { isUserAdmin } from '../utils/adminEmails'
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
import { MdDashboard, MdSchool, MdInsertChart, MdChat, MdNotifications, MdUpload, MdDownload, MdBook, MdCheckCircle, MdBarChart, MdAccountBalance, MdTimeline, MdCalendarToday, MdAssignment, MdTrendingUp } from 'react-icons/md'
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
        flex items-center px-[16px] py-[12px] transition-all duration-300 ease-out rounded-lg no-underline
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
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Use the centralized admin check
  const isAdmin = isUserAdmin(user?.email)
  
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
  console.log('Admin check function result:', isUserAdmin(user?.email));
  console.log('=============================');
  
  return (
    <WeekAccessProvider user={user}>
      <DashboardContentInner isAdmin={isAdmin} user={user} signOut={signOut} />
    </WeekAccessProvider>
  )
}

function DashboardContentInner({ isAdmin, user, signOut }) {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  
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

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[250px] bg-white h-full fixed left-0 top-0 border-r border-gray-100 flex flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className={`flex flex-col items-center w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col items-center py-4 px-4 w-full mt-2 mb-2">
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
          <div className={`py-[10px] transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center gap-3 pl-6 mb-[20px]">
                  <div className={`p-2 rounded-lg bg-[#fffde7] transition-all duration-500 ${isLoaded ? 'scale-100' : 'scale-0'}`}> 
                    <MdBarChart className="w-[22px] h-[22px] text-[#0d1a4b]" />
                  </div>
                  <span className="font-semibold text-[#0d1a4b]" style={{ fontSize: '16px' }}>Excel Workshop</span>
              </div>
              
              <div className="px-[16px] space-y-[10px]">
                  {[...Array(10)].map((_, i) => {
                    const weekId = `week-${i+1}`;
                    const isAccessible = isWeekAccessible(weekId);
                    let weekLabel = `Week ${i+1}`;
                    let weekText = null;
                    if (i === 0) weekLabel = 'Week 1 - Budgeting';
                    if (i === 5) {
                      weekText = (
                        <span className="flex items-start">
                          <FaFileExcel
                            color={isAccessible ? "#0d1a4b" : "#9ca3af"}
                            className="w-4 h-4 mt-[2px]"
                          />
                          <span className="ml-2" style={{ color: isAccessible ? "#0d1a4b" : "#9ca3af" }}>
                            <span>Week 6 - Retirement</span>
                            <span className="block text-[14px] leading-[1.1] pl-6">
                              Planning
                            </span>

                          </span>
                        </span>
                      );
                      
                    }
                    
                    if (!isAccessible && !isAdmin) {
                      return (
                        <div
                          key={`excel-week-${i + 1}`}
                          className="flex items-center px-[16px] py-[12px] rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
                          style={{ fontSize: 14, fontWeight: 'normal' }}
                        >
                          <span className="flex items-center w-full">
                            {i === 5 ? (
                              // Week 6: tek ikon + iki satır
                              <span className="flex items-start">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4 mt-[2px]" />
                                <span className="ml-2 text-gray-400">
                                  <span>Week 6 - Retirement</span>
                                  <span className="block text-[13px] leading-[1.1] pl-6">
                                    Planning
                                  </span>
                                </span>
                              </span>
                            ) : (
                              // Diğer haftalar: tek satır
                              <span className="flex items-center">
                                <FaFileExcel color="#9ca3af" className="w-4 h-4" />
                                <span className="ml-2 text-gray-400">{weekLabel}</span>
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
        <div className="mt-auto">
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
      <div className="ml-[250px] flex-1 h-full overflow-y-auto">
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