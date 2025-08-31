import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSave, MdPieChart, MdTrendingUp } from 'react-icons/md';

const BudgetPlanner = () => {
  const [categories] = useState([
    { id: 1, name: 'Housing', budget: 1200, spent: 1150 },
    { id: 2, name: 'Transportation', budget: 300, spent: 250 },
    { id: 3, name: 'Food', budget: 500, spent: 480 },
    { id: 4, name: 'Entertainment', budget: 200, spent: 180 },
    { id: 5, name: 'Savings', budget: 400, spent: 400 }
  ]);

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0d1a4b] mb-2">Budget Planner</h1>
        <p className="text-gray-600">Track and manage your monthly budget</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Total Budget</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">${totalBudget}</p>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MdPieChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Total Spent</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">${totalSpent}</p>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MdTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 mb-2 text-sm">Remaining</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#0d1a4b]">${totalBudget - totalSpent}</p>
            <div className="w-12 h-12 rounded-full bg-[#fdb913]/10 flex items-center justify-center">
              <MdSave className="w-6 h-6 text-[#fdb913]" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0d1a4b]">Budget Categories</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456] transition-colors">
              <MdAdd className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {categories.map(category => (
            <div key={category.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-[#0d1a4b]">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${category.spent} spent of ${category.budget} budget
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#0d1a4b] transition-colors">
                    <MdEdit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <MdDelete className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    category.spent > category.budget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (category.spent / category.budget) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner; 