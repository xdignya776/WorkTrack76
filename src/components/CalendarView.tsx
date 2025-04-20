
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format, isSameDay, addMonths, addWeeks, subMonths, subWeeks } from "date-fns";
import CalendarControls from "./calendar/CalendarControls";
import CalendarGrid from "./calendar/CalendarGrid";
import SelectedDayView from "./calendar/SelectedDayView";
import { fetchScheduleData, syncCalendarData } from "./calendar/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Google Calendar configuration
const GOOGLE_CLIENT_ID = "155806295475-i0fp0lfmt99uk97t9jp6ieucn7k1udm1.apps.googleusercontent.com";

export interface ShiftEvent {
  id: number | string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  synced?: boolean;
}

export type CalendarViewMode = "weekly" | "monthly";

const CalendarView = () => {
  const { user, updateUserProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<ShiftEvent[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("weekly");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    checkGoogleCalendarConnection();
  }, [user]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (lastSynced) {
        const timeSinceSync = Date.now() - lastSynced.getTime();
        if (timeSinceSync > 5 * 60 * 1000) { // 5 minutes
          handleSyncCalendar();
        }
      }
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lastSynced]);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const checkGoogleCalendarConnection = () => {
    // Check if user has Google Calendar token in user profile
    if (user?.googleCalendarToken) {
      try {
        const tokenData = JSON.parse(user.googleCalendarToken);
        if (tokenData.expiresAt && tokenData.expiresAt > Date.now()) {
          setIsGoogleConnected(true);
        }
      } catch (error) {
        console.error("Error parsing stored Google token:", error);
      }
    } else {
      // Check local storage as fallback
      const storedGoogleToken = localStorage.getItem('google_calendar_token');
      if (storedGoogleToken) {
        try {
          const tokenData = JSON.parse(storedGoogleToken);
          if (tokenData.expiresAt && tokenData.expiresAt > Date.now()) {
            setIsGoogleConnected(true);
          } else {
            localStorage.removeItem('google_calendar_token');
          }
        } catch (error) {
          console.error("Error parsing stored Google token:", error);
          localStorage.removeItem('google_calendar_token');
        }
      }
    }
  };
  
  const handleConnectGoogle = () => {
    if (isGoogleConnected) {
      setIsGoogleConnected(false);
      localStorage.removeItem('google_calendar_token');
      
      // Also remove from user profile if available
      if (user?.id && updateUserProfile) {
        updateUserProfile({
          googleCalendarToken: null
        });
      }
      
      toast({
        title: "Google Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    } else {
      setIsConnectingGoogle(true);
      
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = encodeURIComponent([
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ].join(' '));
      const state = encodeURIComponent(JSON.stringify({ 
        returnTo: window.location.pathname,
        calendarAuth: true  // Flag to indicate this is for calendar auth, not login
      }));
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
      
      window.location.href = authUrl;
    }
  };
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchScheduleData(user);
      
      if (result.success) {
        setSchedule(result.data);
        if (result.message) {
          toast({ title: result.message.title, description: result.message.description });
        }
        if (result.fromCloud) {
          setLastSynced(new Date());
        }
      } else {
        console.error("Failed to load schedule:", result.error);
        setSchedule([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle shift updates (edit, delete)
  const handleShiftUpdated = useCallback(() => {
    loadData();
    
    // Also attempt to clean up potential duplicates in Google Calendar
    if (user?.id) {
      // Force a cleanup of any duplicate reminders
      toast({
        title: "Updating calendar",
        description: "Cleaning up any duplicate reminders"
      });
      
      // This runs in the background, no need to await it
      cleanupDuplicateEvents();
    }
  }, [user]);
  
  // Helper function to clean up duplicates
  const cleanupDuplicateEvents = async () => {
    try {
      // For each shift, check for and clean up duplicates
      for (const shift of schedule) {
        if (typeof shift.id === 'string') {
          await supabase.functions.invoke('setup-shift-reminders', {
            body: {
              userId: user?.id,
              shiftId: shift.id,
              deleteDuplicates: true
            }
          });
        }
      }
    } catch (error) {
      console.error("Error cleaning up duplicate events:", error);
    }
  };
  
  const handleSyncCalendar = async () => {
    if (!user?.id) {
      setIsCalendarDialogOpen(true);
      return;
    }
    
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Calendar will sync when you're back online",
        variant: "destructive"
      });
      return;
    }
    
    if (!isGoogleConnected) {
      setIsCalendarDialogOpen(true);
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const result = await syncCalendarData(user, schedule);
      
      if (result.success) {
        setSchedule(result.data);
        setLastSynced(new Date());
        
        toast({
          title: "Calendar synced",
          description: `Successfully synced with ${user?.email || 'your account'}`,
        });
      } else {
        toast({
          title: "Sync failed",
          description: "Could not sync your calendar. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };
  
  function getShiftsForDay(day: Date) {
    return schedule.filter(shift => isSameDay(shift.date, day));
  }
  
  const selectedDayShifts = selectedDay ? getShiftsForDay(selectedDay) : [];
  
  const handlePrevPeriod = useCallback(() => {
    if (viewMode === "weekly") {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  }, [viewMode]);

  const handleNextPeriod = useCallback(() => {
    if (viewMode === "weekly") {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  }, [viewMode]);
  
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <CalendarControls 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOnline={isOnline}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
        onSyncCalendar={handleSyncCalendar}
        setSelectedDay={setSelectedDay}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="relative touch-pan-y">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
            >
              <CarouselContent>
                <CarouselItem>
                  <CalendarGrid 
                    currentDate={currentDate}
                    viewMode={viewMode}
                    schedule={schedule}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                  />
                </CarouselItem>
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious onClick={handlePrevPeriod} />
                <CarouselNext onClick={handleNextPeriod} />
              </div>
              <div className="sm:hidden fixed inset-x-0 bottom-1/2 px-4 flex justify-between pointer-events-none">
                <CarouselPrevious onClick={handlePrevPeriod} className="pointer-events-auto opacity-70" />
                <CarouselNext onClick={handleNextPeriod} className="pointer-events-auto opacity-70" />
              </div>
            </Carousel>
          </div>
          
          {!isGoogleConnected && (
            <div className="p-4 md:p-6 bg-muted/50 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-foreground rounded-full">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Connect Your Calendar</h3>
                  <p className="text-sm text-muted-foreground">Sync your work schedule with your favorite calendar app</p>
                </div>
              </div>
              <Button 
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="flex gap-2 items-center"
              >
                {isConnectingGoogle ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M12 5c1.617 0 3.101.554 4.286 1.474l3.414-3.414C17.808 1.169 15.067 0 12 0 7.392 0 3.397 2.6 1.386 6.36l3.955 3.042C6.343 6.743 8.982 5 12 5z"/>
                      <path fill="#34A853" d="M5 12c0-.81.137-1.587.386-2.314L1.43 6.645C.518 8.283 0 10.093 0 12c0 1.906.518 3.717 1.43 5.355l3.955-3.042C5.137 13.587 5 12.81 5 12z"/>
                      <path fill="#FBBC05" d="M12 19c-3.018 0-5.657-1.743-6.659-4.297l-3.955 3.042C3.397 21.399 7.392 24 12 24c3.067 0 5.808-1.169 7.7-3.06l-3.414-3.414C15.101 18.446 13.617 19 12 19z"/>
                      <path fill="#EA4335" d="M23.5 12c0-.62-.054-1.22-.157-1.8H12v3.8h6.474c-.28 1.512-1.134 2.8-2.415 3.659l3.414 3.414C21.812 18.733 23.5 15.6 23.5 12z"/>
                    </svg>
                    Connect Google Calendar
                  </>
                )}
              </Button>
            </div>
          )}
          
          <SelectedDayView 
            selectedDay={selectedDay}
            selectedDayShifts={selectedDayShifts}
            user={user}
            onShiftUpdated={handleShiftUpdated}
          />
        </>
      )}
      
      {/* Calendar Connection Dialog */}
      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Your Calendar</DialogTitle>
            <DialogDescription>
              Sync your work schedule with your favorite calendar app
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M12 5c1.617 0 3.101.554 4.286 1.474l3.414-3.414C17.808 1.169 15.067 0 12 0 7.392 0 3.397 2.6 1.386 6.36l3.955 3.042C6.343 6.743 8.982 5 12 5z"/>
                  <path fill="#34A853" d="M5 12c0-.81.137-1.587.386-2.314L1.43 6.645C.518 8.283 0 10.093 0 12c0 1.906.518 3.717 1.43 5.355l3.955-3.042C5.137 13.587 5 12.81 5 12z"/>
                  <path fill="#FBBC05" d="M12 19c-3.018 0-5.657-1.743-6.659-4.297l-3.955 3.042C3.397 21.399 7.392 24 12 24c3.067 0 5.808-1.169 7.7-3.06l-3.414-3.414C15.101 18.446 13.617 19 12 19z"/>
                  <path fill="#EA4335" d="M23.5 12c0-.62-.054-1.22-.157-1.8H12v3.8h6.474c-.28 1.512-1.134 2.8-2.415 3.659l3.414 3.414C21.812 18.733 23.5 15.6 23.5 12z"/>
                </svg>
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Sync with your Google Calendar</p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
              >
                {isGoogleConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="5" fill="#FF3B30" />
                  <path fill="white" d="M17 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm-6.5 12.25h-1V16h1v1.25zm0-2.5h-1V7h1v7.75zM15 12h-4v-1h4v1z"/>
                </svg>
                <div>
                  <p className="font-medium">Apple Calendar</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalendarDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
