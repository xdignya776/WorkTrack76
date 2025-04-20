
import { format } from "date-fns";
import { Clock, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftEvent } from "../CalendarView";
import { calculateDuration } from "./calendarUtils";
import { useAuth } from "@/contexts/AuthContext";
import ShiftContextMenu from "./ShiftContextMenu";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SelectedDayViewProps {
  selectedDay: Date | null;
  selectedDayShifts: ShiftEvent[];
  user: ReturnType<typeof useAuth>["user"];
  onShiftUpdated: () => void;
}

const SelectedDayView = ({ 
  selectedDay, 
  selectedDayShifts,
  user,
  onShiftUpdated
}: SelectedDayViewProps) => {
  // We don't need to track touch events anymore as we're using normal clicks
  const isMobile = useIsMobile();

  return (
    <div className="p-4 md:p-6">
      {selectedDay ? (
        <div className="animate-fade-in">
          <h3 className="text-lg font-medium mb-3">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h3>
          
          {selectedDayShifts.length > 0 ? (
            <div className="space-y-3">
              {selectedDayShifts.map((shift) => (
                <ShiftContextMenu 
                  key={shift.id} 
                  shift={shift}
                  onShiftUpdated={onShiftUpdated}
                >
                  <div 
                    className={cn(
                      "p-3 border rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer relative",
                      shift.synced && "border-green-200 dark:border-green-800/30",
                      "group hover:border-primary/50 active:scale-[0.99] active:bg-primary/5"
                    )}
                  >
                    <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{shift.title}</h4>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{calculateDuration(shift.startTime, shift.endTime)} hours</span>
                      {shift.synced && (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Wifi className="h-3 w-3 mr-1" /> Synced with {user?.email?.split('@')[1] || 'calendar'}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-lg group-hover:bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </ShiftContextMenu>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No shifts scheduled for this day
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Select a day to view your schedule
        </div>
      )}
    </div>
  );
};

export default SelectedDayView;
