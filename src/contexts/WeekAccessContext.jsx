import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const WeekAccessContext = createContext();
const SUPPORTED_WEEK_IDS = ['week-1', 'week-2', 'week-3', 'week-4', 'week-5', 'week-6', 'week-7', 'week-9', 'week-12'];

const createDefaultWeekSettings = () => {
  const defaults = {};
  SUPPORTED_WEEK_IDS.forEach((weekId) => {
    defaults[weekId] = {
      isAvailable: weekId === 'week-1',
      releaseDate: null
    };
  });
  return defaults;
};

export const useWeekAccess = () => {
  return useContext(WeekAccessContext);
};

export const WeekAccessProvider = ({ children, user, isAdmin }) => {
  const [globalWeekSettings, setGlobalWeekSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch global week settings data when user changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== WeekAccessContext useEffect Debug ===');
        console.log('User prop received:', user);
        console.log('User email:', user?.email);
        console.log('User email type:', typeof user?.email);
        console.log('User email length:', user?.email?.length);
        console.log('User email trimmed:', user?.email?.trim());
        console.log('Is admin prop received:', isAdmin);
        console.log('========================================');
        
        if (user) {
          // Fetch global week settings
          const { data: globalSettings, error: globalError } = await supabase
            .from('global_week_settings')
            .select('week_id, is_globally_available, release_date');

          if (globalError) {
            console.error('Error fetching global week settings:', globalError);
          } else {
            const globalMap = createDefaultWeekSettings();
            if (globalSettings && globalSettings.length > 0) {
              globalSettings.forEach(item => {
                if (SUPPORTED_WEEK_IDS.includes(item.week_id)) {
                  globalMap[item.week_id] = {
                    isAvailable: item.is_globally_available,
                    releaseDate: item.release_date
                  };
                }
              });
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
        setGlobalWeekSettings(createDefaultWeekSettings());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  // Check if a specific week is accessible
  const isWeekAccessible = (weekId) => {
    if (!user) return false;
    if (isAdmin) return true;  // Use the prop instead of calling isUserAdmin
    return globalWeekSettings[weekId]?.isAvailable === true;
  };

  // Get all accessible weeks
  const getAccessibleWeeks = () => {
    if (!user) return [];
    if (isAdmin) {  // Use the prop instead of calling isUserAdmin
      return SUPPORTED_WEEK_IDS;
    }
    return Object.keys(globalWeekSettings).filter(weekId => 
      globalWeekSettings[weekId]?.isAvailable === true
    );
  };

  // Admin function to update global week settings
  const updateGlobalWeekSettings = async (weekId, isAvailable, releaseDate = null) => {
    if (!isAdmin) {
      throw new Error('Only admins can update global week settings');
    }

    try {
      const { error } = await supabase
        .from('global_week_settings')
        .upsert({
          week_id: weekId,
          is_globally_available: isAvailable,
          release_date: releaseDate,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'week_id'
        });

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
    if (!isAdmin) {
      throw new Error('Only admins can update global week settings');
    }

    try {
      const rows = Object.entries(updates).map(([weekId, isAvailable]) => ({
        week_id: weekId,
        is_globally_available: isAvailable,
        release_date: globalWeekSettings[weekId]?.releaseDate ?? null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('global_week_settings')
        .upsert(rows, {
          onConflict: 'week_id'
        });

      if (error) throw error;

      // Update local state
      setGlobalWeekSettings(prev => {
        const newGlobalSettings = { ...prev };
        Object.entries(updates).forEach(([weekId, isAvailable]) => {
          newGlobalSettings[weekId] = {
            isAvailable,
            releaseDate: newGlobalSettings[weekId]?.releaseDate || null
          };
        });
        return newGlobalSettings;
      });

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
    isAdmin: isAdmin  // Use the prop instead of calling isUserAdmin
  };

  return (
    <WeekAccessContext.Provider value={value}>
      {children}
    </WeekAccessContext.Provider>
  );
}; 