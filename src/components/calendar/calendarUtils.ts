
import { format, parse, isSameDay } from "date-fns";
import { ShiftEvent } from "../CalendarView";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { filterOverlappingShifts } from "@/utils/calendarFilterUtils";

export type User = NonNullable<ReturnType<typeof useAuth>["user"]>;

export const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    
    let hours = endParts[0] - startParts[0];
    let minutes = endParts[1] - startParts[1];
    
    // Adjust for overnight shifts
    if (hours < 0 || (hours === 0 && minutes < 0)) {
      hours += 24;
    }
    
    // Adjust for minute differences
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    
    if (minutes === 0) {
      return `${hours}`;
    } else {
      return `${hours}.${Math.round((minutes / 60) * 10)}`;
    }
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "?";
  }
};

type FetchResult = {
  success: boolean;
  data: ShiftEvent[];
  fromCloud?: boolean;
  message?: { title: string; description: string };
  error?: any;
};

export const fetchScheduleData = async (user: User | null): Promise<FetchResult> => {
  try {
    if (user?.id) {
      // Fetch work schedules from Supabase
      const { data: supabaseSchedule, error } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching schedules from Supabase:", error);
        throw error;
      }
      
      let formattedSchedule: ShiftEvent[] = [];
      
      if (supabaseSchedule && supabaseSchedule.length > 0) {
        formattedSchedule = supabaseSchedule.map(item => ({
          id: item.id,
          date: new Date(item.date),
          startTime: item.start_time.substring(0, 5), // Format HH:MM from time type
          endTime: item.end_time.substring(0, 5),
          title: item.title,
          synced: true
        }));
        
        // Filter out overlapping shifts
        formattedSchedule = filterOverlappingShifts(formattedSchedule);
        
        // Also save to localStorage for offline access
        localStorage.setItem('worktrack_schedule', JSON.stringify(
          formattedSchedule.map(item => ({
            ...item,
            date: item.date.toISOString()
          }))
        ));
        
        return {
          success: true,
          data: formattedSchedule,
          fromCloud: true,
          message: {
            title: "Schedule Loaded",
            description: `${formattedSchedule.length} shifts loaded from your account`
          }
        };
      }
    }
    
    // Fallback to localStorage if no data in Supabase or user not logged in
    const savedSchedule = localStorage.getItem('worktrack_schedule');
    if (savedSchedule) {
      try {
        const parsed = JSON.parse(savedSchedule);
        
        let scheduleWithDates = parsed.map((item: any) => ({
          ...item,
          date: item.date instanceof Date ? item.date : new Date(item.date),
          id: item.id || crypto.randomUUID()
        }));
        
        // Filter out overlapping shifts
        scheduleWithDates = filterOverlappingShifts(scheduleWithDates);
        
        return {
          success: true,
          data: scheduleWithDates,
          message: scheduleWithDates.length > 0 
            ? {
                title: "Schedule Loaded",
                description: `${scheduleWithDates.length} shifts have been loaded from your saved schedule`
              } 
            : undefined
        };
      } catch (error) {
        console.error("Failed to parse saved schedule:", error);
        return { success: true, data: [], error };
      }
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error("Failed to load schedule:", error);
    return { success: false, data: [], error };
  }
};

export const syncCalendarData = async (user: User | null, currentSchedule: ShiftEvent[]): Promise<FetchResult> => {
  try {
    if (!user?.id) {
      return { 
        success: false, 
        data: currentSchedule,
        error: "No user authenticated" 
      };
    }
    
    // Get cloud data
    const { data: cloudSchedule, error: fetchError } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) throw fetchError;
    
    // Format cloud data
    const formattedCloudSchedule = (cloudSchedule || []).map(item => ({
      id: item.id,
      date: new Date(item.date),
      startTime: item.start_time.substring(0, 5),
      endTime: item.end_time.substring(0, 5),
      title: item.title,
      synced: true
    }));
    
    // Get local data
    const localData = JSON.parse(localStorage.getItem('worktrack_schedule') || '[]');
    const localSchedule = localData.map((item: any) => ({
      ...item,
      date: item.date instanceof Date ? item.date : new Date(item.date),
    }));
    
    // Merge schedules
    const mergedSchedule = mergeSchedules(formattedCloudSchedule, localSchedule);
    
    // Find new items to save to Supabase
    const newItems = mergedSchedule.filter(item => 
      !formattedCloudSchedule.some(cloud => 
        cloud.id === item.id
      )
    );
    
    // Save new items to Supabase
    if (newItems.length > 0) {
      const { error: insertError } = await supabase
        .from('work_schedules')
        .insert(
          newItems.map(item => ({
            id: typeof item.id === 'string' ? item.id : item.id.toString(),
            user_id: user.id,
            date: new Date(item.date).toISOString().split('T')[0],
            start_time: item.startTime,
            end_time: item.endTime,
            title: item.title,
            synced: true
          }))
        );
        
      if (insertError) throw insertError;
    }
    
    // Filter merged schedule for overlaps
    const filteredSchedule = filterOverlappingShifts(mergedSchedule);
    
    // Update localStorage
    localStorage.setItem('worktrack_schedule', JSON.stringify(
      filteredSchedule.map(item => ({
        ...item,
        date: item.date instanceof Date ? item.date.toISOString() : item.date
      }))
    ));
    
    return {
      success: true,
      data: filteredSchedule,
      fromCloud: true
    };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, data: currentSchedule, error };
  }
};

export const mergeSchedules = (cloudSchedule: ShiftEvent[], localSchedule: ShiftEvent[]): ShiftEvent[] => {
  const allShifts = [...cloudSchedule];
  
  for (const localShift of localSchedule) {
    const exists = allShifts.some(cloudShift => 
      isSameDay(new Date(cloudShift.date), new Date(localShift.date)) && 
      cloudShift.startTime === localShift.startTime && 
      cloudShift.endTime === localShift.endTime
    );
    
    if (!exists) {
      allShifts.push(localShift);
    }
  }
  
  return allShifts;
};
