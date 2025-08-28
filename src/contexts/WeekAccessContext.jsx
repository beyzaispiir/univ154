import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isUserAdmin } from '../utils/adminEmails';

const WeekAccessContext = createContext();

export const useWeekAccess = () => {
  return useContext(WeekAccessContext);
};

export const WeekAccessProvider = ({ children }) => {
  const [weekAccess, setWeekAccess] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch user and week access data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Check if user is admin
          const isAdmin = isUserAdmin(user.email);
          
          if (isAdmin) {
            // Admins have access to all weeks
            const allWeeksAccess = {};
            for (let i = 1; i <= 10; i++) {
              allWeeksAccess[`week-${i}`] = true;
            }
            setWeekAccess(allWeeksAccess);
          } else {
                         // Fetch week access for regular users
             const { data, error } = await supabase
               .from('week_access')
               .select('week_id, is_available, release_date')
               .eq('user_email', user.email);

                          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
               console.error('Error fetching week access:', error);
               // Default to only week 1 available
               setWeekAccess({ 'week-1': true });
             } else {
               const accessMap = {};
               if (data && data.length > 0) {
                 data.forEach(item => {
                   accessMap[item.week_id] = item.is_available;
                 });
               } else {
                 // If no data found, default to week 1
                 accessMap['week-1'] = true;
               }
               setWeekAccess(accessMap);
             }
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Default to only week 1 available
        setWeekAccess({ 'week-1': true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if a specific week is accessible
  const isWeekAccessible = (weekId) => {
    if (!user) return false;
    if (isUserAdmin(user.email)) return true;
    return weekAccess[weekId] === true;
  };

  // Get all accessible weeks
  const getAccessibleWeeks = () => {
    if (!user) return [];
    if (isUserAdmin(user.email)) {
      return Array.from({ length: 10 }, (_, i) => `week-${i + 1}`);
    }
    return Object.keys(weekAccess).filter(weekId => weekAccess[weekId]);
  };

  // Admin function to update week access
  const updateWeekAccess = async (weekId, isAvailable, releaseDate = null) => {
    if (!isUserAdmin(user?.email)) {
      throw new Error('Only admins can update week access');
    }

    if (!user?.email) {
      throw new Error('User email not available');
    }

    try {
      // Update in database
      const { error } = await supabase
        .from('week_access')
        .upsert({
          user_email: user.email,
          week_id: weekId,
          is_available: isAvailable,
          release_date: releaseDate,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setWeekAccess(prev => ({
        ...prev,
        [weekId]: isAvailable
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating week access:', error);
      throw error;
    }
  };

  // Admin function to bulk update week access
  const bulkUpdateWeekAccess = async (updates) => {
    if (!isUserAdmin(user?.email)) {
      throw new Error('Only admins can update week access');
    }

    if (!user?.email) {
      throw new Error('User email not available');
    }

    try {
      const updatesArray = Object.entries(updates).map(([weekId, isAvailable]) => ({
        user_email: user.email,
        week_id: weekId,
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('week_access')
        .upsert(updatesArray);

      if (error) throw error;

      // Update local state
      setWeekAccess(prev => ({
        ...prev,
        ...updates
      }));

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating week access:', error);
      throw error;
    }
  };

  const value = {
    weekAccess,
    isLoading,
    isWeekAccessible,
    getAccessibleWeeks,
    updateWeekAccess,
    bulkUpdateWeekAccess,
    isAdmin: isUserAdmin(user?.email)
  };

  return (
    <WeekAccessContext.Provider value={value}>
      {children}
    </WeekAccessContext.Provider>
  );
}; 