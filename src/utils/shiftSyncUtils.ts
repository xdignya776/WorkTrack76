import { format } from "date-fns";
import { Shift } from "@/components/ManualShiftEntry";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type User = {
  id?: string;
  googleCalendarToken?: string;
  email?: string;
  timezone?: string; // Added timezone property
};

/**
 * Get Google Calendar token from user or localStorage
 */
export const getGoogleCalendarToken = (user: User | null) => {
  let googleTokenData = null;
  
  // First try to get from user object
  if (user?.googleCalendarToken) {
    try {
      googleTokenData = JSON.parse(user.googleCalendarToken);
      if (!(googleTokenData.expiresAt && googleTokenData.expiresAt > Date.now())) {
        googleTokenData = null;
      }
    } catch (error) {
      console.error("Error parsing stored Google token:", error);
    }
  }
  
  // Fallback to localStorage
  if (!googleTokenData) {
    const storedGoogleToken = localStorage.getItem('google_calendar_token');
    if (storedGoogleToken) {
      try {
        googleTokenData = JSON.parse(storedGoogleToken);
        if (!(googleTokenData.expiresAt && googleTokenData.expiresAt > Date.now())) {
          googleTokenData = null;
        }
      } catch (error) {
        console.error("Error parsing stored Google token:", error);
      }
    }
  }
  
  return googleTokenData;
};

/**
 * Check for overlapping events in Google Calendar
 */
const checkForOverlappingEvents = async (
  shift: Shift, 
  googleTokenData: { accessToken: string }
): Promise<{hasOverlap: boolean, duplicateEvents: any[]}> => {
  try {
    const startDateTime = new Date(shift.date);
    const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(shift.date);
    const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    // Create a buffer window (1 hour before and after) to catch similar events
    const timeMin = new Date(startDateTime.getTime() - 60 * 60 * 1000).toISOString();
    const timeMax = new Date(endDateTime.getTime() + 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase.functions.invoke('exchange-google-token', {
      body: {
        type: 'list_events',
        accessToken: googleTokenData.accessToken,
        query: {
          timeMin,
          timeMax,
          q: shift.title // Search for events with this title
        }
      }
    });

    if (error) {
      console.error("Error checking for overlapping events:", error);
      return { hasOverlap: false, duplicateEvents: [] };
    }
    
    if (!data?.events?.items?.length) {
      console.log("No overlapping events found");
      return { hasOverlap: false, duplicateEvents: [] };
    }
    
    // Check if any of these events match our shift
    const eventPrefix = localStorage.getItem('event_title_prefix') || "Work Shift: ";
    const exactTitle = `${eventPrefix}${shift.title}`;
    
    const overlappingEvents = data.events.items.filter((event: any) => {
      return event.summary === exactTitle;
    });
    
    if (overlappingEvents.length > 0) {
      console.log("Found overlapping events:", overlappingEvents.length);
      return { hasOverlap: true, duplicateEvents: overlappingEvents };
    }
    
    return { hasOverlap: false, duplicateEvents: [] };
  } catch (error) {
    console.error("Error checking for overlapping events:", error);
    return { hasOverlap: false, duplicateEvents: [] };
  }
};

/**
 * Delete duplicate events from Google Calendar
 */
const deleteDuplicateEvents = async (
  duplicateEvents: any[], 
  googleTokenData: { accessToken: string },
  keepFirst = true
): Promise<number> => {
  if (!duplicateEvents.length || duplicateEvents.length <= 1) return 0;
  
  // We'll keep the first event and delete the rest
  const eventsToDelete = keepFirst ? duplicateEvents.slice(1) : duplicateEvents;
  let deletedCount = 0;
  
  for (const event of eventsToDelete) {
    try {
      const { data, error } = await supabase.functions.invoke('exchange-google-token', {
        body: {
          type: 'delete_event',
          eventId: event.id,
          accessToken: googleTokenData.accessToken
        }
      });
      
      if (error) {
        console.error(`Error deleting event ${event.id}:`, error);
        continue;
      }
      
      console.log(`Successfully deleted duplicate event: ${event.id}`);
      deletedCount++;
    } catch (error) {
      console.error(`Error deleting event:`, error);
    }
  }
  
  return deletedCount;
};

/**
 * Sync a shift to Google Calendar
 */
export const syncShiftToGoogleCalendar = async (shift: Shift, user: User | null) => {
  try {
    const googleTokenData = getGoogleCalendarToken(user);
    
    if (!googleTokenData) {
      console.log("Google Calendar not connected, skipping sync");
      return false;
    }
    
    const calendarSettings = JSON.parse(localStorage.getItem('worktrack_calendar_settings') || '{"autoSyncEnabled":true}');
    if (!calendarSettings.autoSyncEnabled) {
      console.log("Auto-sync disabled, skipping sync to Google Calendar");
      return false;
    }
    
    // Check for overlapping events
    const { hasOverlap, duplicateEvents } = await checkForOverlappingEvents(shift, googleTokenData);
    
    // If there are duplicates, delete them (keeping the first one)
    if (hasOverlap && duplicateEvents.length > 1) {
      const deletedCount = await deleteDuplicateEvents(duplicateEvents, googleTokenData);
      if (deletedCount > 0) {
        toast({
          title: "Removed duplicate events",
          description: `Removed ${deletedCount} duplicate event(s) for "${shift.title}" from Google Calendar`,
        });
      }
      console.log("Skipping sync as we already have an event after removing duplicates");
      return true;
    } else if (hasOverlap) {
      console.log("Skipping sync due to overlapping events");
      toast({
        title: "Event already exists",
        description: `"${shift.title}" is already on your Google Calendar`,
      });
      return true; // Return true because we consider this a "successful" sync since the event exists
    }
    
    const startDateTime = new Date(shift.date);
    const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(shift.date);
    const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    const eventPrefix = localStorage.getItem('event_title_prefix') || "Work Shift: ";
    
    const event = {
      summary: `${eventPrefix}${shift.title}`,
      description: `Work shift created by WorkTrack app`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      colorId: shift.title.toLowerCase().includes('night') ? '9' : // purple
              shift.title.toLowerCase().includes('afternoon') || 
              shift.title.toLowerCase().includes('evening') ? '5' : // yellow
              '1' // blue (default for morning/day shifts)
    };

    console.log("Creating Google Calendar event:", event);
    
    try {
      const { data, error } = await supabase.functions.invoke('exchange-google-token', {
        body: {
          type: 'create_event',
          accessToken: googleTokenData.accessToken,
          event: event
        }
      });
      
      if (error) {
        console.error("Error calling edge function for event creation:", error);
        return false;
      }
      
      if (!data?.success) {
        console.error("Failed to create event in Google Calendar");
        return false;
      }
      
      console.log("Event created successfully in Google Calendar:", data.eventData);
      
      toast({
        title: "Event added to Google Calendar",
        description: `"${shift.title}" has been added to your Google Calendar`,
      });
      
      return true;
    } catch (error) {
      console.error("Error calling supabase function:", error);
      return false;
    }
  } catch (error) {
    console.error("Error syncing shift to Google Calendar:", error);
    return false;
  }
};

/**
 * Set up a shift reminder in Google Calendar
 */
export const setupShiftReminder = async (shift: Shift, user: User | null, reminderTime: number = 30) => {
  if (!user?.id) {
    toast({
      title: "Sign in required",
      description: "Please sign in to create shift reminders",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('setup-shift-reminders', {
      body: {
        userId: user.id,
        shiftId: shift.id,
        reminderTime: reminderTime,
        deleteDuplicates: true // Enable automatic duplicate removal
      }
    });
    
    if (error) {
      console.error("Error setting up shift reminder:", error);
      toast({
        title: "Reminder setup failed",
        description: "Could not set up a reminder for this shift",
        variant: "destructive"
      });
      return false;
    }
    
    if (data?.success) {
      if (data.duplicate) {
        toast({
          title: "Reminder already exists",
          description: `A reminder for "${shift.title}" is already set`,
        });
      } else if (data.deletedCount) {
        toast({
          title: "Duplicates removed",
          description: `Removed ${data.deletedCount} duplicate reminder(s) for "${shift.title}"`,
        });
      } else {
        toast({
          title: "Reminder set",
          description: `You'll be notified ${reminderTime} minutes before your shift starts`,
        });
      }
      return true;
    } else if (data?.error === "Google Calendar not connected") {
      toast({
        title: "Calendar not connected",
        description: "Please connect your Google Calendar to set reminders",
        variant: "destructive"
      });
      return false;
    }
    
    return false;
  } catch (error) {
    console.error("Error setting up shift reminder:", error);
    return false;
  }
};

/**
 * Save shifts to Supabase
 */
export const saveShiftsToDatabase = async (shifts: Shift[], userId: string) => {
  if (!userId) return false;
  
  const shiftsForSupabase = shifts.map(shift => ({
    id: shift.id,
    user_id: userId,
    date: format(shift.date, 'yyyy-MM-dd'),
    start_time: shift.startTime,
    end_time: shift.endTime,
    title: shift.title,
    synced: true
  }));
  
  try {
    const { error } = await supabase
      .from('work_schedules')
      .insert(shiftsForSupabase);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error saving shifts to database:", error);
    return false;
  }
};
