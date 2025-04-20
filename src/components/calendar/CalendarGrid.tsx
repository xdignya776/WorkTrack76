
import { Dispatch, SetStateAction } from "react";
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { ShiftEvent, CalendarViewMode } from "../CalendarView";

interface CalendarGridProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  schedule: ShiftEvent[];
  selectedDay: Date | null;
  setSelectedDay: Dispatch<SetStateAction<Date | null>>;
}

const CalendarGrid = ({
  currentDate,
  viewMode,
  schedule,
  selectedDay,
  setSelectedDay
}: CalendarGridProps) => {
  function getDays() {
    if (viewMode === "weekly") {
      const startDay = startOfWeek(currentDate, { weekStartsOn: 0 });
      return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const startDayOfWeek = startOfWeek(start, { weekStartsOn: 0 });
      
      const totalDays = 42; // 6 weeks
      
      return Array.from({ length: totalDays }, (_, i) => {
        const day = addDays(startDayOfWeek, i);
        return {
          date: day,
          isCurrentMonth: isWithinInterval(day, { start, end })
        };
      });
    }
  }
  
  function getShiftsForDay(day: Date) {
    return schedule.filter(shift => isSameDay(shift.date, day));
  }
  
  function handleDayClick(day: Date) {
    setSelectedDay(day);
  }
  
  const days = getDays();
  
  if (viewMode === "weekly") {
    return (
      <div className="grid grid-cols-7 border-b w-full touch-pan-x">
        {Array.isArray(days) && days.map((day, index) => {
          const dayDate = day as Date;
          const dayShifts = getShiftsForDay(dayDate);
          const isToday = isSameDay(dayDate, new Date());
          const isSelected = selectedDay && isSameDay(dayDate, selectedDay);
          const hasShift = dayShifts.length > 0;
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(dayDate)}
              className={cn(
                "h-24 md:h-28 p-2 text-left transition-colors border-r last:border-r-0 relative",
                isSelected ? "bg-primary/10" : "hover:bg-accent",
                isToday && "font-semibold"
              )}
            >
              <div className="flex flex-col h-full">
                <span 
                  className={cn(
                    "text-xs flex items-center justify-center h-6 w-6 rounded-full mb-1",
                    isToday ? "bg-primary text-white" : "text-foreground"
                  )}
                >
                  {format(dayDate, "d")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(dayDate, "EEE")}
                </span>
                
                {hasShift && (
                  <div className="mt-auto">
                    <div 
                      className={cn(
                        "text-xs px-1.5 py-1 rounded-sm font-medium truncate",
                        "bg-primary/15 text-primary border border-primary/20",
                        dayShifts[0].synced && "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
                      )}
                    >
                      {dayShifts[0].startTime} - {dayShifts[0].endTime}
                    </div>
                    {dayShifts.length > 1 && (
                      <div className="text-xs text-primary mt-0.5 text-center">
                        +{dayShifts.length - 1} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-7 border-b w-full touch-pan-x">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {days.map((dayObj: any, index) => {
          const { date: day, isCurrentMonth } = dayObj;
          const dayShifts = getShiftsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const hasShift = dayShifts.length > 0;
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                "h-16 p-1 text-left transition-colors border-r border-b last:border-r-0 relative",
                isSelected ? "bg-primary/10" : "hover:bg-accent",
                isToday && "font-semibold",
                !isCurrentMonth && "text-muted-foreground/50 bg-accent/30"
              )}
            >
              <div className="flex flex-col h-full">
                <span 
                  className={cn(
                    "text-xs flex items-center justify-center h-5 w-5 rounded-full",
                    isToday ? "bg-primary text-white" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                
                {hasShift && isCurrentMonth && (
                  <div className="mt-1">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full",
                        dayShifts[0].synced 
                          ? "bg-green-500" 
                          : "bg-primary"
                      )}
                    />
                    {dayShifts.length > 1 && (
                      <div className="text-[10px] text-primary mt-0.5 text-center">
                        {dayShifts.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
};

export default CalendarGrid;
