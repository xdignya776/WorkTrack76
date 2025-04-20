
import { format, isSameDay, areIntervalsOverlapping } from "date-fns";
import { Shift } from "@/components/ManualShiftEntry";
import { toast } from "@/components/ui/use-toast";

/**
 * Check if a shift overlaps with existing shifts
 * @param shift The new shift to check
 * @param existingShifts Array of existing shifts
 * @returns boolean indicating if there's an overlap
 */
export const checkShiftOverlap = (shift: Shift, existingShifts: Shift[]): boolean => {
  // Parse times to numbers for easier comparison
  const [startHour, startMin] = shift.startTime.split(':').map(Number);
  const [endHour, endMin] = shift.endTime.split(':').map(Number);
  
  const sameDayShifts = existingShifts.filter(existing => 
    isSameDay(new Date(existing.date), new Date(shift.date))
  );
  
  if (sameDayShifts.length === 0) return false;
  
  // Convert shift times to date objects for comparison
  const shiftStart = new Date(shift.date);
  shiftStart.setHours(startHour, startMin, 0, 0);
  
  const shiftEnd = new Date(shift.date);
  shiftEnd.setHours(endHour, endMin, 0, 0);
  
  // Handle overnight shifts
  if (shiftEnd < shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }
  
  // Check for overlaps with existing shifts
  return sameDayShifts.some(existing => {
    const [existingStartHour, existingStartMin] = existing.startTime.split(':').map(Number);
    const [existingEndHour, existingEndMin] = existing.endTime.split(':').map(Number);
    
    const existingStart = new Date(existing.date);
    existingStart.setHours(existingStartHour, existingStartMin, 0, 0);
    
    const existingEnd = new Date(existing.date);
    existingEnd.setHours(existingEndHour, existingEndMin, 0, 0);
    
    // Handle overnight shifts
    if (existingEnd < existingStart) {
      existingEnd.setDate(existingEnd.getDate() + 1);
    }
    
    return areIntervalsOverlapping(
      { start: shiftStart, end: shiftEnd },
      { start: existingStart, end: existingEnd }
    );
  });
};

/**
 * Format a shift for display
 * @param shift The shift to format
 * @returns Formatted shift string
 */
export const formatShift = (shift: Shift): string => {
  return `${format(new Date(shift.date), 'MMM dd')} (${shift.startTime}-${shift.endTime})`;
};

/**
 * Handle adding a shift with overlap detection
 * @param newShift The shift to add
 * @param existingShifts Array of existing shifts
 * @returns Object with success status and updated shifts array
 */
export const addShiftWithOverlapCheck = (
  newShift: Shift, 
  existingShifts: Shift[]
): { success: boolean; shifts: Shift[]; message?: string } => {
  if (checkShiftOverlap(newShift, existingShifts)) {
    const formattedDate = format(new Date(newShift.date), 'MMMM d');
    const overlappingShifts = existingShifts.filter(existing => 
      isSameDay(new Date(existing.date), new Date(newShift.date))
    );
    
    const message = `You already have ${overlappingShifts.length} shift(s) on ${formattedDate} that would overlap with this one.`;
    
    toast({
      title: "Shift Overlap Detected",
      description: message,
      variant: "destructive"
    });
    
    return { 
      success: false,
      shifts: existingShifts,
      message
    };
  }
  
  return {
    success: true,
    shifts: [...existingShifts, newShift]
  };
};
