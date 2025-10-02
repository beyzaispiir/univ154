# UNIV154 - Financial Education Platform

A comprehensive web-based financial education application built for Rice University's UNIV154 course. This platform provides interactive modules for budgeting, savings planning, credit card management, tax calculations, and Excel-based financial modeling.

## 🚀 Live Application

**Production URL:** [https://univ154.netlify.app](https://univ154.netlify.app)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Week Modules](#week-modules)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

UNIV154 is a sophisticated financial education platform designed to teach students essential personal finance concepts through interactive modules, real-time calculations, and hands-on Excel workshops. The application features a week-by-week curriculum covering budgeting, savings, credit management, tax calculations, and retirement planning.

### Key Objectives
- Provide interactive financial education modules
- Enable real-time budget and tax calculations
- Offer Excel-based financial modeling tools
- Track student progress through weekly modules
- Support both student and administrative workflows

## ✨ Features

### 🎓 Educational Modules
- **Week 1**: Budgeting and Income Planning
- **Week 2**: Savings Goals and Financial Planning
- **Week 3**: Credit Card Management and Amortization
- **Week 4**: Tax Calculations (Federal & State)
- **Week 5-10**: Advanced Financial Topics

### 💰 Financial Calculators
- Real-time budget calculations
- Federal and state tax computations
- Credit card amortization schedules
- Savings goal planning with compound interest
- Retirement planning tools

### 📊 Data Visualization
- Interactive charts using Chart.js and ApexCharts
- Budget vs. actual spending comparisons
- Financial trend analysis
- Progress tracking dashboards

### 📈 Excel Integration
- Built-in Excel-like spreadsheet interface
- File upload/download functionality
- Real-time formula calculations
- Data import/export capabilities

### 🔐 User Management
- Rice University email authentication
- Google OAuth integration
- Admin panel for course management
- Week-by-week access control

## 🛠 Technology Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **Vite 6.3.5** - Fast build tool and dev server
- **React Router DOM 7.6.1** - Client-side routing
- **Tailwind CSS 4.1.7** - Utility-first CSS framework

### Data Visualization
- **Chart.js 4.5.0** - Charting library
- **React Chart.js 2 5.3.0** - React wrapper for Chart.js
- **ApexCharts 4.7.0** - Advanced charting library
- **React ApexCharts 1.7.0** - React wrapper for ApexCharts

### Excel & Data Processing
- **XLSX 0.18.5** - Excel file processing
- **Handsontable 15.3.0** - Spreadsheet component
- **@handsontable/react 15.3.0** - React wrapper

### Backend & Database
- **Supabase 2.49.8** - Backend-as-a-Service
- **PostgreSQL** - Database (via Supabase)
- **Row Level Security (RLS)** - Data security

### UI Components
- **@fluentui/react-components 9.64.0** - Microsoft Fluent UI
- **@material-tailwind/react 2.1.10** - Material Design components
- **React Icons 5.5.0** - Icon library
- **@heroicons/react 2.2.0** - Heroicons

### Development Tools
- **ESLint 9.25.0** - Code linting
- **PostCSS 8.5.3** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

## 📁 Project Structure

```
UNIV154/
├── src/
│   ├── components/           # React components
│   │   ├── pages/           # Page components
│   │   │   ├── Analytics.jsx
│   │   │   ├── BudgetPlanner.jsx
│   │   │   └── Overview.jsx
│   │   ├── BudgetForm.jsx    # Main budgeting interface
│   │   ├── SavingsForm.jsx   # Savings planning module
│   │   ├── Week1Budgeting.jsx
│   │   ├── Week2Savings.jsx
│   │   ├── Week3CreditCard.jsx
│   │   ├── Week4.jsx
│   │   ├── Week5.jsx
│   │   ├── Week6Retirement.jsx
│   │   ├── Week7.jsx
│   │   ├── Week8.jsx
│   │   ├── Week9.jsx
│   │   ├── Week10.jsx
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Login.jsx         # Authentication
│   │   ├── SignUp.jsx        # User registration
│   │   ├── ExcelWorkshop.jsx # Excel-like interface
│   │   ├── ModuleView.jsx    # Module navigation
│   │   └── LectureNotes.jsx  # Course materials
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.jsx   # Authentication state
│   │   ├── BudgetContext.jsx # Budget calculations
│   │   └── WeekAccessContext.jsx # Module access control
│   ├── lib/                  # External service configurations
│   │   ├── supabase.js       # Supabase client
│   │   └── supabaseClient.js # Alternative Supabase client
│   ├── utils/                # Utility functions
│   │   ├── adminEmails.js    # Admin user management
│   │   └── taxCalculator.js  # Tax calculation logic
│   ├── data/                 # Static data
│   │   ├── taxData.js        # Tax bracket data
│   │   └── stateTaxData.js   # State-specific tax data
│   ├── configs/              # Configuration files
│   │   ├── week1Config.js    # Week 1 module config
│   │   └── week2Config.js    # Week 2 module config
│   ├── assets/               # Static assets
│   │   ├── logo for univ154.png
│   │   ├── logo with name for univ154.png
│   │   ├── rice-logo.png
│   │   └── Rough Draft 2 - Budgeting Week 1 - Web-Based Application(Week 1 - Budgeting).csv
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Application entry point
│   ├── App.css               # Global styles
│   └── index.css             # Base styles
├── supabase/
│   └── migrations/           # Database migrations
│       ├── 20250602120800_create_excel_files.sql
│       ├── 20250602120900_add_storage_path.sql
│       ├── 20250602121000_create_registered_users.sql
│       ├── 20250602121100_create_week_access.sql
│       ├── 20250602121200_create_global_week_settings.sql
│       └── 20250602121300_fix_registered_users_rls.sql
├── email-templates/          # Email templates
│   ├── change-email.html
│   ├── confirmation.html
│   ├── magic-link.html
│   └── reset-password.html
├── public/                   # Public assets
├── dist/                     # Build output
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── eslint.config.js          # ESLint configuration
├── netlify.toml             # Netlify deployment config
└── README.md                # This file
```

## 🗄 Database Schema

### Core Tables

#### `excel_files`
Stores user-uploaded Excel files and their metadata.
```sql
- id: UUID (Primary Key)
- name: TEXT (File name)
- content: JSONB (File content)
- user_email: TEXT (Owner email)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `registered_users`
Tracks all registered users in the system.
```sql
- id: UUID (Primary Key)
- email: TEXT UNIQUE (User email)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `week_access`
Manages individual user access to weekly modules.
```sql
- id: SERIAL (Primary Key)
- user_email: TEXT (User email)
- week_id: TEXT (Week identifier)
- is_available: BOOLEAN (Access status)
- release_date: TIMESTAMP (When access was granted)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `global_week_settings`
Controls global availability of weekly modules.
```sql
- id: SERIAL (Primary Key)
- week_id: TEXT UNIQUE (Week identifier)
- is_globally_available: BOOLEAN (Global availability)
- release_date: TIMESTAMP (Release date)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- User-specific data access policies
- Admin-only management capabilities
- Automatic user registration triggers

## 🔐 Authentication & Authorization

### Authentication Methods
1. **Email/Password**: Traditional signup with Rice University, Gmail, or Yahoo emails
2. **Google OAuth**: One-click Google authentication
3. **Magic Links**: Passwordless authentication via email

### Email Validation
- Rice University emails (`@rice.edu`, `@alumni.rice.edu`)
- Gmail addresses (`@gmail.com`)
- Yahoo addresses (`@yahoo.com`)
- Automatic validation and rejection of other domains

### Admin System
**Admin Emails:**
- `macmoser@alumni.rice.edu`
- `km108@rice.edu`
- `cl202@rice.edu`
- `jjz3@rice.edu`
- `bi6@rice.edu`
- `beyza.ispir@rice.edu`
- `mk258@rice.edu`

**Admin Capabilities:**
- Manage week access for all users
- Control global week availability
- Access administrative dashboards
- Manage user permissions

## 📚 Week Modules

### Week 1: Budgeting & Income Planning
- **Pre-tax income calculations**
- **Tax deductions and exemptions**
- **After-tax income computation**
- **Expense categorization**
- **Budget vs. actual tracking**

### Week 2: Savings Planning
- **Goal-based savings calculations**
- **Compound interest modeling**
- **Time-to-goal calculations**
- **Multiple savings categories**
- **Annual earning rate considerations**

### Week 3: Credit Card Management
- **Amortization schedules**
- **Minimum payment calculations** (Interest for Month 1)
- **User payment scenarios**
- **Interest vs. principal breakdown**
- **Debt payoff timelines**

### Week 4: Tax Calculations
- **Federal income tax brackets**
- **State tax calculations**
- **Standard deduction logic**
- **Tax optimization strategies**
- **Multi-state tax scenarios**

### Week 5-10: Advanced Topics
- **Retirement planning**
- **Investment strategies**
- **Insurance calculations**
- **Advanced financial modeling**

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Netlify account (for deployment)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/beyzaispiir/univ154.git
cd univ154
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
VITE_APP_ENV=development
```

### Obtaining Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Settings > API
4. Copy the Project URL and anon public key
5. Add them to your `.env.local` file

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Code Style
- ESLint configuration for React best practices
- Consistent component structure
- TypeScript-ready (JSX with PropTypes)
- Responsive design patterns

### Component Architecture
- **Context-based state management** for global state
- **Modular component design** for reusability
- **Custom hooks** for business logic
- **Error boundaries** for graceful error handling

## 🚀 Deployment

### Netlify Deployment

The application is configured for automatic deployment via Netlify:

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Enable automatic deployments

2. **Build Configuration**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Environment Variables**
   - Add Supabase credentials in Netlify dashboard
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy dist/ folder to your hosting provider
# Files are optimized and ready for production
```

## 📊 API Documentation

### Supabase Integration

#### Authentication Endpoints
```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@rice.edu',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@rice.edu',
  password: 'password'
})

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

#### Data Operations
```javascript
// Save budget data
const { data, error } = await supabase
  .from('excel_files')
  .insert({
    name: 'budget_data',
    content: budgetData,
    user_email: user.email
  })

// Load user data
const { data, error } = await supabase
  .from('excel_files')
  .select('*')
  .eq('user_email', user.email)
```

### Context APIs

#### BudgetContext
```javascript
const {
  topInputs,
  setTopInputs,
  financialCalculations,
  savingsInputs,
  setSavingsInputs,
  saveBudgetData,
  loadBudgetData
} = useBudget()
```

#### AuthContext
```javascript
const {
  user,
  loading,
  signUp,
  signIn,
  signInWithGoogle,
  resetPassword,
  signOut,
  isAdmin
} = useAuth()
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with descriptive messages**
   ```bash
   git commit -m "Add new feature: description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/new-feature
   ```
7. **Create a Pull Request**

### Code Standards
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

### Database Changes
- Create migration files for schema changes
- Test migrations on development database
- Document breaking changes
- Update this README for new features

## 📄 License

This project is developed for educational purposes at Rice University. All rights reserved.

---

**Built for Rice University UNIV154 Course**

*Last updated: sept 2025*
