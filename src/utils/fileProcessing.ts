import { WorkSchedule, saveScheduleToStorage, generateInsightsFromSchedule } from "@/utils/insightGenerator";
import { getInsightsFromStorage, getScheduleFromStorage } from "@/utils/insightGenerator";
import { timePattern, datePattern, weekdayPattern, convertTo24Hour, parseDate } from "@/utils/insightUtils";

// Extract schedule from OCR text
export const extractScheduleFromText = (text: string): Partial<WorkSchedule>[] => {
  const shifts: Partial<WorkSchedule>[] = [];
  const lines = text.split('\n');
  
  // Look for dates
  const allDates = text.match(datePattern) || [];
  const allTimes = text.match(timePattern) || [];
  const allWeekdays = text.match(weekdayPattern) || [];
  
  console.log("Extracted dates:", allDates);
  console.log("Extracted times:", allTimes);
  console.log("Extracted weekdays:", allWeekdays);
  
  // If we have dates and at least twice as many times (for start and end times)
  if (allDates.length > 0 && allTimes.length >= allDates.length * 2) {
    for (let i = 0; i < allDates.length && i * 2 + 1 < allTimes.length; i++) {
      const dateStr = allDates[i];
      const startTimeStr = allTimes[i * 2];
      const endTimeStr = allTimes[i * 2 + 1];
      
      const parsedDate = parseDate(dateStr);
      if (parsedDate) {
        shifts.push({
          date: parsedDate,
          startTime: convertTo24Hour(startTimeStr),
          endTime: convertTo24Hour(endTimeStr),
          title: "Work Shift",
        });
      }
    }
  } else {
    // Try to extract schedule from lines
    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      const timeMatches = line.match(timePattern);
      
      if (dateMatch && timeMatches && timeMatches.length >= 2) {
        const parsedDate = parseDate(dateMatch[0]);
        if (parsedDate) {
          shifts.push({
            date: parsedDate,
            startTime: convertTo24Hour(timeMatches[0]),
            endTime: convertTo24Hour(timeMatches[1]),
            title: "Work Shift",
          });
        }
      }
    }
  }
  
  return shifts;
};

// Save extracted schedule to storage
export const saveExtractedSchedule = async (extractedShifts: Partial<WorkSchedule>[], userId: string): Promise<WorkSchedule[]> => {
  if (!userId) {
    console.error("Cannot save extracted schedule: No user ID available");
    throw new Error("User authentication required");
  }
  
  const workSchedules: WorkSchedule[] = extractedShifts.map(shift => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    date: shift.date as Date,
    startTime: shift.startTime as string,
    endTime: shift.endTime as string,
    title: shift.title || "Work Shift",
    synced: navigator.onLine,
    userId: userId
  }));
  
  try {
    const existingSchedule = await getScheduleFromStorage(userId);
    console.log(`Retrieved ${existingSchedule.length} existing schedule items`);
    
    const combinedSchedule = [...existingSchedule, ...workSchedules];
    
    await saveScheduleToStorage(combinedSchedule, userId);
    
    await generateWorkInsights(combinedSchedule, userId);
    
    return workSchedules;
  } catch (error) {
    console.error("Error in saveExtractedSchedule:", error);
    throw error;
  }
};

// Generate default schedule data
export const processScheduleData = async (userId: string): Promise<WorkSchedule[]> => {
  if (!userId) {
    console.error("Cannot process schedule data: No user ID available");
    throw new Error("User authentication required");
  }
  
  const today = new Date();
  const mockSchedule: WorkSchedule[] = [
    {
      id: Date.now() + 1,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      startTime: "09:00",
      endTime: "17:00",
      title: "Work Shift",
      synced: navigator.onLine,
      userId: userId
    },
    {
      id: Date.now() + 2,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      startTime: "12:00",
      endTime: "20:00",
      title: "Work Shift",
      synced: navigator.onLine,
      userId: userId
    }
  ];
  
  try {
    const existingSchedule = await getScheduleFromStorage(userId);
    console.log(`Retrieved ${existingSchedule.length} existing schedule items`);
    
    const combinedSchedule = [...existingSchedule, ...mockSchedule];
    
    await saveScheduleToStorage(combinedSchedule, userId);
    
    await generateWorkInsights(combinedSchedule, userId);
    
    return mockSchedule;
  } catch (error) {
    console.error("Error in processScheduleData:", error);
    throw error;
  }
};

// Generate work insights from schedule
export const generateWorkInsights = async (schedule: WorkSchedule[], userId: string) => {
  if (!userId) {
    console.error("Cannot generate insights: No user ID available");
    return;
  }
  
  try {
    // Get existing insights first
    await getInsightsFromStorage(userId);
    
    // Generate new insights based on schedule
    await generateInsightsFromSchedule(schedule, undefined, userId);
    
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
};
