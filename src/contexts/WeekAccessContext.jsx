import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isUserAdmin } from '../utils/adminEmails';

const WeekAccessContext = createContext();

export const useWeekAccess = () => {
  return useContext(WeekAccessContext);
};

export const WeekAccessProvider = ({ children, user }) => {
  const [globalWeekSettings, setGlobalWeekSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch global week settings data when user changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('WeekAccessContext: User changed:', user);
        console.log('WeekAccessContext: User email:', user?.email);
        if (user) {
          // Fetch global week settings
          const { data: globalSettings, error: globalError } = await supabase
            .from('global_week_settings')
            .select('week_id, is_globally_available, release_date');

          if (globalError) {
            console.error('Error fetching global week settings:', globalError);
          } else {
            const globalMap = {};
            if (globalSettings && globalSettings.length > 0) {
              globalSettings.forEach(item => {
                globalMap[item.week_id] = {
                  isAvailable: item.is_globally_available,
                  releaseDate: item.release_date
                };
              });
            } else {
              // Initialize with default settings if none exist
              for (let i = 1; i <= 10; i++) {
                const weekId = `week-${i}`;
                globalMap[weekId] = {
                  isAvailable: i === 1, // Only week 1 available by default
                  releaseDate: null
                };
              }
            }
            setGlobalWeekSettings(globalMap);
          }
        } else {
          // Clear settings when no user
          console.log('WeekAccessContext: No user, clearing settings');
          setGlobalWeekSettings({});
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Initialize with default settings on error
        const defaultSettings = {};
        for (let i = 1; i <= 10; i++) {
          const weekId = `week-${i}`;
          defaultSettings[weekId] = {
            isAvailable: i === 1,
            releaseDate: null
          };
        }
        setGlobalWeekSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Check if a specific week is accessible
  const isWeekAccessible = (weekId) => {
    if (!user) return false;
    if (isUserAdmin(user.email)) return true;
    return globalWeekSettings[weekId]?.isAvailable === true;
  };

  // Get all accessible weeks
  const getAccessibleWeeks = () => {
    if (!user) return [];
    if (isUserAdmin(user.email)) {
      return Array.from({ length: 10 }, (_, i) => `week-${i + 1}`);
    }
    return Object.keys(globalWeekSettings).filter(weekId => 
      globalWeekSettings[weekId]?.isAvailable === true
    );
  };

  // Admin function to update global week settings
  const updateGlobalWeekSettings = async (weekId, isAvailable, releaseDate = null) => {
    if (!isUserAdmin(user?.email)) {
      throw new Error('Only admins can update global week settings');
    }

    try {
      // UPDATE instead of INSERT - this is the fix!
      const { error } = await supabase
        .from('global_week_settings')
        .update({
          is_globally_available: isAvailable,
          release_date: releaseDate,
          updated_at: new Date().toISOString()
        })
        .eq('week_id', weekId); // WHERE clause

      if (error) throw error;

      // Update local state
      setGlobalWeekSettings(prev => ({
        ...prev,
        [weekId]: {
          isAvailable,
          releaseDate
        }
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating global week settings:', error);
      throw error;
    }
  };

  // Admin function to bulk update global week settings
  const bulkUpdateGlobalWeekSettings = async (updates) => {
    if (!isUserAdmin(user?.email)) {
      throw new Error('Only admins can update global week settings');
    }

    try {
      // Use UPDATE for each week instead of UPSERT to avoid duplicate key errors
      for (const [weekId, isAvailable] of Object.entries(updates)) {
        const { error } = await supabase
          .from('global_week_settings')
          .update({
            is_globally_available: isAvailable,
            updated_at: new Date().toISOString()
          })
          .eq('week_id', weekId);

        if (error) throw error;
      }

      // Update local state
      const newGlobalSettings = { ...globalWeekSettings };
      Object.entries(updates).forEach(([weekId, isAvailable]) => {
        newGlobalSettings[weekId] = {
          isAvailable,
          releaseDate: newGlobalSettings[weekId]?.releaseDate || null
        };
      });
      setGlobalWeekSettings(newGlobalSettings);

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating global week settings:', error);
      throw error;
    }
  };

  const value = {
    globalWeekSettings,
    isLoading,
    isWeekAccessible,
    getAccessibleWeeks,
    updateGlobalWeekSettings,
    bulkUpdateGlobalWeekSettings,
    isAdmin: isUserAdmin(user?.email)
  };

  return (
    <WeekAccessContext.Provider value={value}>
      {children}
    </WeekAccessContext.Provider>
  );
}; 