import React, { useState, useEffect } from 'react';
import { useWeekAccess } from '../contexts/WeekAccessContext';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../utils/adminEmails';

export default function WeekAccessAdmin() {
  const { user } = useAuth();
  const { 
    weekAccess, 
    updateWeekAccess, 
    bulkUpdateWeekAccess, 
    isAdmin,
    isLoading 
  } = useWeekAccess();
  
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  const weekLabels = {
    'week-1': 'Week 1 - Budgeting',
    'week-2': 'Week 2 - Savings & Emergency Funds',
    'week-3': 'Week 3 - Credit & Debt Management',
    'week-4': 'Week 4 - Income & Taxes',
    'week-5': 'Week 5 - Real Estate & Homeownership',
    'week-6': 'Week 6 - Retirement Planning',
    'week-7': 'Week 7 - Insurance & Risk Management',
    'week-8': 'Week 8 - Understanding Financial Markets',
    'week-9': 'Week 9 - Investing Basics',
    'week-10': 'Week 10 - Financial Scams & Charitable Giving'
  };

  const handleWeekToggle = (weekId) => {
    setSelectedWeeks(prev => 
      prev.includes(weekId) 
        ? prev.filter(id => id !== weekId)
        : [...prev, weekId]
    );
  };

  const handleSelectAll = () => {
    setSelectedWeeks(Object.keys(weekLabels));
  };

  const handleDeselectAll = () => {
    setSelectedWeeks([]);
  };

  const handleBulkUpdate = async (isAvailable) => {
    if (selectedWeeks.length === 0) {
      setMessage('Please select at least one week.');
      setMessageType('error');
      return;
    }

    setIsUpdating(true);
    setMessage('');

    try {
      const updates = {};
      selectedWeeks.forEach(weekId => {
        updates[weekId] = isAvailable;
      });

      await bulkUpdateWeekAccess(updates);
      
      setMessage(`Successfully ${isAvailable ? 'enabled' : 'disabled'} access for ${selectedWeeks.length} week(s).`);
      setMessageType('success');
      setSelectedWeeks([]);
    } catch (error) {
      setMessage(`Error updating week access: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIndividualUpdate = async (weekId, isAvailable) => {
    setIsUpdating(true);
    setMessage('');

    try {
      await updateWeekAccess(weekId, isAvailable);
      setMessage(`Successfully ${isAvailable ? 'enabled' : 'disabled'} access for ${weekLabels[weekId]}.`);
      setMessageType('success');
    } catch (error) {
      setMessage(`Error updating week access: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d1a4b] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading week access data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#0d1a4b] mb-6">Week Access Management</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#0d1a4b] mb-4">Bulk Operations</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456] transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Deselect All
            </button>
          </div>
          
          {selectedWeeks.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={() => handleBulkUpdate(true)}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : `Enable Access (${selectedWeeks.length})`}
              </button>
              <button
                onClick={() => handleBulkUpdate(false)}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : `Disable Access (${selectedWeeks.length})`}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0d1a4b] mb-4">Individual Week Control</h2>
          
          {Object.entries(weekLabels).map(([weekId, label]) => (
            <div key={weekId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedWeeks.includes(weekId)}
                  onChange={() => handleWeekToggle(weekId)}
                  className="w-4 h-4 text-[#0d1a4b] border-gray-300 rounded focus:ring-[#0d1a4b]"
                />
                <div>
                  <h3 className="font-medium text-[#0d1a4b]">{label}</h3>
                  <p className="text-sm text-gray-600">Week ID: {weekId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  weekAccess[weekId] 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {weekAccess[weekId] ? 'Enabled' : 'Disabled'}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleIndividualUpdate(weekId, true)}
                    disabled={isUpdating || weekAccess[weekId]}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => handleIndividualUpdate(weekId, false)}
                    disabled={isUpdating || !weekAccess[weekId]}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Use bulk operations to enable/disable multiple weeks at once</li>
            <li>• Individual controls allow fine-grained access management</li>
            <li>• Changes take effect immediately for all students</li>
            <li>• Week 1 is enabled by default for all new users</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 