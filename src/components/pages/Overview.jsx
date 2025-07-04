import React from 'react';
import { MdCheckCircle, MdSchool, MdInsertChart } from 'react-icons/md';
import { BsCalendar3 } from 'react-icons/bs';

const Overview = ({ todaysClasses, todoList, upcomingDeadlines }) => {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Course Progress</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">18%</p>
            <div className="w-12 h-12 rounded-full bg-[#fdb913]/10 flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-[#fdb913]" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#fdb913] h-2 rounded-full" style={{ width: '18%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Completed Modules</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">2/12</p>
            <div className="w-12 h-12 rounded-full bg-[#0d1a4b]/10 flex items-center justify-center">
              <MdSchool className="w-6 h-6 text-[#0d1a4b]" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Next: Credit & Debt Management</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Excel Assignments</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">3</p>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MdInsertChart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">2 completed, 1 pending</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Next Session</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">Today</p>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <BsCalendar3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">9:30 AM - Budgeting Basics</p>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#0d1a4b] mb-4">Today's Classes</h2>
        <div className="space-y-4">
          {todaysClasses.map(classItem => (
            <div key={classItem.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div>
                <h3 className="font-medium text-[#0d1a4b]">{classItem.title}</h3>
                <p className="text-sm text-gray-500">{classItem.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{classItem.room}</p>
                <p className="text-sm text-gray-500">{classItem.instructor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* To-Do List and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0d1a4b] mb-4">To-Do List</h2>
          <div className="space-y-4">
            {todoList.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-5 h-5 text-[#fdb913] rounded border-gray-300 focus:ring-[#fdb913]"
                  />
                  <span className={item.completed ? 'line-through text-gray-400' : 'text-[#0d1a4b]'}>
                    {item.task}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0d1a4b] mb-4">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {upcomingDeadlines.map(deadline => (
              <div key={deadline.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium text-[#0d1a4b]">{deadline.title}</h3>
                  <p className="text-sm text-gray-500">{deadline.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#0d1a4b]">{deadline.dueTime}</p>
                  <p className="text-sm text-gray-500">{deadline.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 