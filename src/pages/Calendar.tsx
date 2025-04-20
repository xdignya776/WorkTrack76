import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CalendarView from "@/components/CalendarView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, List, GridIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ManualShiftEntry from "@/components/ManualShiftEntry";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ViewMode = "calendar" | "list";

const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  
  const handleSaveSchedule = (shifts: any[]) => {
    // This function is called when shifts are saved in ManualShiftEntry
    // Reloading the page will cause CalendarView to fetch the latest data
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <Badge variant="outline" className="mb-2 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  Calendar
                </Badge>
                <h1 className="text-3xl font-bold">
                  Your Work Schedule
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <ViewModeToggle 
                  viewMode={viewMode} 
                  setViewMode={setViewMode} 
                />
                
                <Button variant="outline" size="sm">
                  <Calendar className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="animate-fade-in space-y-6">
              {viewMode === "calendar" ? (
                <>
                  <CalendarView />
                  <ManualShiftEntry onSaveSchedule={handleSaveSchedule} />
                </>
              ) : (
                <ListView setViewMode={setViewMode} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeToggle = ({ viewMode, setViewMode }: ViewModeToggleProps) => {
  return (
    <div className="border rounded-md flex">
      <button
        className={cn(
          "px-3 py-1.5 flex items-center text-sm rounded-l-md transition-colors",
          viewMode === "calendar" 
            ? "bg-primary text-white" 
            : "hover:bg-accent"
        )}
        onClick={() => setViewMode("calendar")}
      >
        <GridIcon className="mr-1 h-4 w-4" />
        Calendar
      </button>
      <button
        className={cn(
          "px-3 py-1.5 flex items-center text-sm rounded-r-md transition-colors",
          viewMode === "list" 
            ? "bg-primary text-white" 
            : "hover:bg-accent"
        )}
        onClick={() => setViewMode("list")}
      >
        <List className="mr-1 h-4 w-4" />
        List
      </button>
    </div>
  );
};

// Real-time list view that fetches data
const ListView = ({ setViewMode }: { setViewMode: (mode: ViewMode) => void }) => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchShifts = async () => {
      setIsLoading(true);
      
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('work_schedules')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true });
            
          if (error) throw error;
          
          // Format the data for display
          const formattedShifts = data.map(shift => ({
            id: shift.id,
            date: format(new Date(shift.date), 'EEEE, MMMM d'),
            time: `${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)}`,
            title: shift.title
          }));
          
          setShifts(formattedShifts);
        } else {
          // If no user, try to get from localStorage
          const localData = localStorage.getItem('worktrack_schedule');
          if (localData) {
            const parsed = JSON.parse(localData);
            const formattedShifts = parsed.map((shift: any) => ({
              id: shift.id,
              date: format(new Date(shift.date), 'EEEE, MMMM d'),
              time: `${shift.startTime} - ${shift.endTime}`,
              title: shift.title
            }));
            
            setShifts(formattedShifts);
          }
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
        // Fallback to empty array
        setShifts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShifts();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Loading Shifts...
          </h2>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-4 md:p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <List className="mr-2 h-5 w-5 text-primary" />
          Upcoming Shifts
        </h2>
      </div>
      
      {shifts.length > 0 ? (
        <div className="divide-y">
          {shifts.map((shift) => (
            <div key={shift.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-medium">{shift.title}</h3>
                  <p className="text-sm text-muted-foreground">{shift.date}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {shift.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No shifts scheduled yet</p>
          <Button variant="outline" className="mt-4" onClick={() => setViewMode("calendar")}>
            Add Your First Shift
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
