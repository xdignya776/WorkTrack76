
import { isSameDay, areIntervalsOverlapping, isWithinInterval } from "date-fns";
import { ShiftEvent } from "@/components/CalendarView";

/**
 * Check if a shift overlaps with another shift
 */
export const doShiftsOverlap = (shift1: ShiftEvent, shift2: ShiftEvent): boolean => {
  // If not on the same day, they don't overlap
  if (!isSameDay(shift1.date, shift2.date)) {
    return false;
  }
  
  // Parse times to numbers for easier comparison
  const [startHour1, startMin1] = shift1.startTime.split(':').map(Number);
  const [endHour1, endMin1] = shift1.endTime.split(':').map(Number);
  const [startHour2, startMin2] = shift2.startTime.split(':').map(Number);
  const [endHour2, endMin2] = shift2.endTime.split(':').map(Number);
  
  // Convert shift times to date objects for comparison
  const shift1Start = new Date(shift1.date);
  shift1Start.setHours(startHour1, startMin1, 0, 0);
  
  const shift1End = new Date(shift1.date);
  shift1End.setHours(endHour1, endMin1, 0, 0);
  
  // Handle overnight shifts
  if (shift1End < shift1Start) {
    shift1End.setDate(shift1End.getDate() + 1);
  }
  
  const shift2Start = new Date(shift2.date);
  shift2Start.setHours(startHour2, startMin2, 0, 0);
  
  const shift2End = new Date(shift2.date);
  shift2End.setHours(endHour2, endMin2, 0, 0);
  
  // Handle overnight shifts
  if (shift2End < shift2Start) {
    shift2End.setDate(shift2End.getDate() + 1);
  }
  
  return areIntervalsOverlapping(
    { start: shift1Start, end: shift1End },
    { start: shift2Start, end: shift2End }
  );
};

/**
 * Filter shifts to avoid overlaps, keeping the ones from the cloud prioritized
 */
export const filterOverlappingShifts = (shifts: ShiftEvent[]): ShiftEvent[] => {
  if (!shifts.length) return [];
  
  // Sort by synced first (to prioritize cloud shifts), then by start time
  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.synced === b.synced) {
      // If both are synced or both are not, sort by start time
      return a.startTime.localeCompare(b.startTime);
    }
    return a.synced ? -1 : 1; // Synced shifts first
  });
  
  const result: ShiftEvent[] = [];
  
  // Add shifts while checking for overlaps
  for (const shift of sortedShifts) {
    // Check if this shift overlaps with any already in the result
    const hasOverlap = result.some(existingShift => doShiftsOverlap(existingShift, shift));
    
    if (!hasOverlap) {
      result.push(shift);
    }
  }
  
  return result;
};
