
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Wifi, WifiOff, Calendar as CalendarFullIcon, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { CalendarViewMode } from "../CalendarView";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarControlsProps {
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  viewMode: CalendarViewMode;
  setViewMode: Dispatch<SetStateAction<CalendarViewMode>>;
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  onSyncCalendar: () => void;
  setSelectedDay: Dispatch<SetStateAction<Date | null>>;
}

const CalendarControls = ({
  currentDate,
  setCurrentDate,
  viewMode,
  setViewMode,
  isOnline,
  isSyncing,
  lastSynced,
  onSyncCalendar,
  setSelectedDay
}: CalendarControlsProps) => {
  const isMobile = useIsMobile();
  
  function navigatePeriod(direction: "prev" | "next") {
    setCurrentDate(prevDate => {
      if (viewMode === "weekly") {
        return direction === "prev" ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1);
      } else {
        return direction === "prev" ? subMonths(prevDate, 1) : addMonths(prevDate, 1);
      }
    });
  }
  
  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  }
  
  const displayPeriod = format(currentDate, "MMMM yyyy");
  
  return (
    <div className="p-4 md:p-6 border-b">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Work Schedule</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isSyncing}
            onClick={onSyncCalendar}
            className="h-8 px-3 text-xs flex items-center"
          >
            {isSyncing ? (
              <>
                <span className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-t-2 border-primary"></span>
                Syncing...
              </>
            ) : (
              <>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? "Sync" : "Offline"}
              </>
            )}
          </Button>
          
          <div className="border rounded-md flex">
            <button
              className={cn(
                "px-2 py-1 flex items-center text-xs rounded-l-md transition-colors",
                viewMode === "weekly" 
                  ? "bg-primary text-white" 
                  : "hover:bg-accent"
              )}
              onClick={() => setViewMode("weekly")}
            >
              <Grid3X3 className="mr-1 h-3 w-3" />
              Weekly
            </button>
            <button
              className={cn(
                "px-2 py-1 flex items-center text-xs rounded-r-md transition-colors",
                viewMode === "monthly" 
                  ? "bg-primary text-white" 
                  : "hover:bg-accent"
              )}
              onClick={() => setViewMode("monthly")}
            >
              <CalendarFullIcon className="mr-1 h-3 w-3" />
              Monthly
            </button>
          </div>
          
          {/* Reordered navigation controls for mobile */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigatePeriod("prev")}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="h-8 px-3 text-xs whitespace-nowrap"
            >
              Today
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigatePeriod("next")}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
        <span>{displayPeriod}</span>
        {lastSynced && (
          <span className="text-xs">
            Last synced: {format(lastSynced, "hh:mm a")}
          </span>
        )}
      </div>
      
      {!isOnline && (
        <div className="mt-2 flex items-center text-amber-500 text-xs">
          <WifiOff className="h-3 w-3 mr-1" />
          <span>You're offline. Changes will sync when you reconnect.</span>
        </div>
      )}
    </div>
  );
};

export default CalendarControls;
