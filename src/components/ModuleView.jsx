import React, { useState } from 'react';
import { MdLock, MdLockOpen, MdCheckCircle, MdChevronRight, MdPictureAsPdf, MdInsertChart, MdMenuBook, MdListAlt } from 'react-icons/md';
import { Link } from 'react-router-dom';


const SectionHeader = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-1 mt-6">
    <Icon className="w-5 h-5 text-[#0d1a4b]" />
    <h4 className="text-base font-semibold text-[#0d1a4b] tracking-wide uppercase">{children}</h4>
  </div>
);

const FileCard = ({ icon: Icon, title, to, color, hoverColor }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] rounded-lg border border-gray-200 hover:border-[#fdb913] shadow-sm transition-colors group hover:bg-[#fffbe6]"
    style={{ minHeight: 48 }}
  >
    <Icon className={`w-6 h-6 ${color} group-hover:${hoverColor}`} />
    <span className="text-base text-[#0d1a4b] font-medium group-hover:text-[#fdb913]">{title}</span>
  </Link>
);

const CardSection = ({ icon: Icon, title, children }) => (
  <div className="flex flex-col bg-white rounded-2xl shadow-md border border-gray-200 p-5 min-h-[220px] w-full">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-6 h-6 text-[#0d1a4b]" />
      <h4 className="text-lg font-semibold text-[#0d1a4b] tracking-wide">{title}</h4>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const FileCardLink = ({ icon: Icon, title, to, color, hoverColor }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-gray-100 hover:border-[#fdb913] shadow-sm transition-colors group hover:bg-[#fffbe6] mb-2"
    style={{ minHeight: 40 }}
  >
    <Icon className={`w-5 h-5 ${color} group-hover:${hoverColor}`} />
    <span className="text-sm text-[#0d1a4b] font-medium group-hover:text-[#fdb913]">{title}</span>
  </Link>
);

const ModuleView = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const modules = [
    {
      id: 1,
      week: 1,
      title: "Introduction & Budgeting",
      description: "Introduction to the course and fundamentals of budgeting",
      progress: 100,
      isUnlocked: true,
      completed: true,
      lectureNotes: [
        { title: "Course Introduction", file: "week1_intro.pdf" },
        { title: "Budgeting Basics", file: "week1_budgeting.pdf" }
      ],
      excelFiles: [
        { title: "Personal Budget Template", file: "budget_template.xlsx" },
        { title: "Expense Tracker", file: "expense_tracker.xlsx" }
      ],
      topics: [
        {
          title: "Course Introduction",
          items: [
            "Introduction of Bobby and Ron",
            "Distribution of materials",
            "Review of syllabus and what's to come"
          ]
        },
        {
          title: "Budgeting & Money Management",
          items: [
            "Importance of budgeting",
            "Steps to create a budget",
            "Tracking income and expenses",
            "Tools for budgeting (apps, spreadsheets, etc.)"
          ]
        }
      ]
    },
    {
      id: 2,
      week: 2,
      title: "Savings & Emergency Funds",
      description: "Learn about saving strategies and building emergency funds",
      progress: 100,
      isUnlocked: true,
      completed: true,
      lectureNotes: [
        { title: "Savings Strategies", file: "week2_savings.pdf" },
        { title: "Emergency Fund Planning", file: "week2_emergency.pdf" }
      ],
      excelFiles: [
        { title: "Savings Calculator", file: "savings_calculator.xlsx" },
        { title: "Emergency Fund Planner", file: "emergency_fund.xlsx" }
      ],
      topics: [
        {
          title: "Savings Fundamentals",
          items: [
            "Setting financial goals for savings",
            "The role of an emergency fund",
            "Short-term vs. long-term savings",
            "Savings accounts, interest rates, and compounding"
          ]
        }
      ]
    },
    {
      id: 3,
      week: 3,
      title: "Credit & Debt Management",
      description: "Understanding credit and managing debt effectively",
      progress: 0,
      isUnlocked: true,
      completed: false,
      topics: [
        {
          title: "Credit & Debt Basics",
          items: [
            "What is credit? Types of credit (credit cards, loans, etc.)",
            "Understanding credit scores",
            "The impact of debt on financial health",
            "Debt management strategies (e.g., snowball vs. avalanche methods)"
          ]
        }
      ]
    },
    {
      id: 4,
      week: 4,
      title: "Understanding Income & Taxes",
      description: "Learn about income sources and tax management",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Income & Taxes",
          items: [
            "Different sources of income",
            "Understanding paychecks, salary, and hourly wages",
            "Types of taxes: federal, state, and local",
            "Tax deductions and credits"
          ]
        }
      ]
    },
    {
      id: 5,
      week: 5,
      title: "Real Estate & Homeownership",
      description: "Exploring real estate and homeownership options",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Real Estate Fundamentals",
          items: [
            "Renting vs. buying a home",
            "Understanding mortgages and home loans",
            "Homeownership costs (maintenance, taxes, insurance)",
            "Real estate investing"
          ]
        }
      ]
    },
    {
      id: 6,
      week: 6,
      title: "Retirement Planning",
      description: "Planning for retirement and long-term financial security",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Retirement Essentials",
          items: [
            "The importance of retirement planning",
            "Overview of retirement accounts (401(k), IRA, Roth IRA)",
            "Employer-sponsored retirement plans",
            "Calculating retirement needs and goals"
          ]
        }
      ]
    },
    {
      id: 7,
      week: 7,
      title: "Insurance & Risk Management",
      description: "Understanding different types of insurance and risk management",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Insurance Basics",
          items: [
            "Types of insurance: health, life, auto, home, and disability",
            "Understanding premiums, deductibles, and coverage",
            "Risk management strategies",
            "When and how much insurance to purchase"
          ]
        }
      ]
    },
    {
      id: 8,
      week: 8,
      title: "Understanding Financial Markets",
      description: "Learn how financial markets work and their impact",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Financial Markets",
          items: [
            "How the stock market works",
            "Stock exchanges, brokers, and trading platforms",
            "Market cycles, trends, and indicators",
            "Economic factors that affect financial markets"
          ]
        }
      ]
    },
    {
      id: 9,
      week: 9,
      title: "Investing Basics",
      description: "Introduction to investment concepts and strategies",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Investment Fundamentals",
          items: [
            "Types of investments: stocks, bonds, mutual funds, ETFs",
            "Risk vs. reward in investing",
            "Risk tolerance",
            "The importance of starting early",
            "Basic investment strategies (diversification, long-term investing)"
          ]
        }
      ]
    },
    {
      id: 10,
      week: 10,
      title: "Financial Protection & Giving",
      description: "Protecting against fraud and understanding charitable giving",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Financial Scams & Fraud Protection",
          items: [
            "Common financial scams and fraud schemes",
            "Red flags of financial fraud",
            "Steps to protect your personal information",
            "How to report fraud"
          ]
        },
        {
          title: "Philanthropy and Charitable Giving",
          items: [
            "The importance of giving back and philanthropy",
            "How to incorporate charitable giving into your financial plan",
            "Tax benefits of charitable donations"
          ]
        }
      ]
    },
    {
      id: 11,
      week: 11,
      title: "Financial Decisions for Major Life Events",
      description: "Managing finances during life's major transitions",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Life Events & Finance",
          items: [
            "Financial planning for marriage, children, and homeownership",
            "How to deal with financial setbacks (job loss, medical expenses)",
            "Preparing for major life transitions (graduation, retirement)"
          ]
        }
      ]
    },
    {
      id: 12,
      week: 12,
      title: "Creating a Financial Plan",
      description: "Putting it all together into a comprehensive financial plan",
      progress: 0,
      isUnlocked: false,
      completed: false,
      topics: [
        {
          title: "Final Financial Plan",
          items: [
            "Review and integration of course materials",
            "Building your personal financial plan",
            "Resources for ongoing financial education",
            "Next steps in your financial journey"
          ]
        }
      ]
    }
  ];

  const handleModuleClick = (moduleId) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
    setActiveSection(null);
  };

  const handleSectionClick = (sectionIndex) => {
    setActiveSection(activeSection === sectionIndex ? null : sectionIndex);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {modules.map((module) => (
        <div
          key={module.id}
          className={`rounded-2xl shadow-md transition-all duration-200 bg-white hover:shadow-lg ${
            selectedModule === module.id ? 'ring-2 ring-[#fdb913]/20' : ''
          }`}
        >
          <div
            className="flex items-center justify-between px-8 py-6 cursor-pointer group"
            onClick={() => handleModuleClick(module.id)}
          >
            <div className="flex items-center gap-4">
              {module.isUnlocked ? (
                <MdLockOpen className="w-7 h-7 text-green-500" />
              ) : (
                <MdLock className="w-7 h-7 text-gray-400" />
              )}
              <div>
                <h3 className="text-xl font-bold text-[#0d1a4b] group-hover:text-[#fdb913] transition-colors">
                  Week {module.week}: {module.title}
                </h3>
                <p className="text-gray-500 text-base mt-1 mb-20">{module.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <div className="flex items-center gap-2">
                <div className="w-28 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      module.progress === 100 ? 'bg-green-500' : 'bg-[#fdb913]'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 font-semibold">{module.progress}%</span>
              </div>
              <MdChevronRight
                className={`w-7 h-7 text-gray-400 transition-transform ${
                  selectedModule === module.id ? 'rotate-90' : ''
                }`}
              />
            </div>
          </div>

          {selectedModule === module.id && (
            <div className="flex flex-row gap-12 mt-8 bg-white px-4 py-8 rounded-b-2xl justify-center items-start">
              {/* Topics Card */}
              <div className="flex-1 min-w-[340px] min-h-[350px] rounded-xl bg-white mx-4 py-10 px-8 shadow-md">
                <div className="flex flex-row items-center justify-center gap-2 mb-8 mt-2">
                  <MdMenuBook className="text-2xl text-[#0d1a4b]" />
                  <span className="font-bold text-2xl">Topics</span>
                </div>
                <ul className="list-disc pl-8 space-y-6 text-lg text-gray-700 text-left">
                  {module.topics.map((topic, idx) => (
                    <li key={idx}
                        className="">
                      {topic.title}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Lecture Notes Card */}
              <div className="flex-1 min-w-[340px] min-h-[350px] rounded-xl bg-white mx-4 py-10 px-8 shadow-md">
                <div className="flex flex-row items-center justify-center gap-2 mb-8 mt-2">
                  <MdListAlt className="text-2xl text-[#0d1a4b]" />
                  <span className="font-bold text-2xl">Lecture Notes</span>
                </div>
                <ul className="list-disc pl-8 space-y-6 text-lg text-gray-700 text-left">
                  {module.lectureNotes && module.lectureNotes.length > 0 ? (
                    module.lectureNotes.map((note, idx) => (
                      <li key={idx}>{note.title}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">No lecture notes.</li>
                  )}
                </ul>
              </div>
              {/* Excel Files Card */}
              <div className="flex-1 min-w-[340px] min-h-[350px] rounded-xl bg-white mx-4 py-10 px-8 shadow-md">
                <div className="flex flex-row items-center justify-center gap-2 mb-8 mt-2">
                  <MdInsertChart className="text-2xl text-[#0d1a4b]" />
                  <span className="font-bold text-2xl">Excel Files</span>
                </div>
                <ul className="list-disc pl-8 space-y-6 text-lg text-gray-700 text-left">
                  {module.excelFiles && module.excelFiles.length > 0 ? (
                    module.excelFiles.map((file, idx) => (
                      <li key={idx}>{file.title}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">No excel files.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModuleView;
