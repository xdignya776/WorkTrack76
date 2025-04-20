
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Plus, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import ShiftForm from "./shifts/ShiftForm";
import ShiftList from "./shifts/ShiftList";
import CustomTitleDialog from "./shifts/CustomTitleDialog";
import { addShiftWithOverlapCheck } from "@/utils/calendarUtils";
import { syncShiftToGoogleCalendar, saveShiftsToDatabase } from "@/utils/shiftSyncUtils";

export interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  synced?: boolean;
  syncedToCalendar?: boolean;
}

interface ManualShiftEntryProps {
  onSaveSchedule: (shifts: Shift[]) => void;
}

const ManualShiftEntry = ({ onSaveSchedule }: ManualShiftEntryProps) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    date: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    title: "Day Shift",
  });
  const [open, setOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddShift = () => {
    if (!newShift.date || !newShift.startTime || !newShift.endTime || !newShift.title) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const id = crypto.randomUUID();
    const shiftToAdd = { ...newShift as Shift, id };
    
    const result = addShiftWithOverlapCheck(shiftToAdd, shifts);
    
    if (result.success) {
      setShifts(result.shifts);
      
      toast({
        title: "Shift added",
        description: `${newShift.title} on ${format(newShift.date as Date, "EEE, MMM d")} added to your schedule`,
      });
      
      setNewShift({
        date: newShift.date,
        startTime: "09:00",
        endTime: "17:00",
        title: "Day Shift",
      });
    }
  };

  const handleRemoveShift = (id: string) => {
    setShifts((prev) => prev.filter((shift) => shift.id !== id));
    
    toast({
      title: "Shift removed",
      description: "Shift has been removed from your schedule",
    });
  };

  const handleSaveSchedule = async () => {
    if (shifts.length === 0) {
      toast({
        title: "No shifts added",
        description: "Please add at least one shift to your schedule",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const syncedShifts = [...shifts];
    const syncResults = [];

    try {
      // Sync with Google Calendar
      for (let i = 0; i < shifts.length; i++) {
        console.log(`Attempting to sync shift ${i+1}/${shifts.length} to Google Calendar`);
        const syncSuccess = await syncShiftToGoogleCalendar(shifts[i], user);
        syncResults.push(syncSuccess);
        
        if (syncSuccess) {
          syncedShifts[i] = { ...syncedShifts[i], syncedToCalendar: true };
          console.log(`Shift ${i+1} synced to Google Calendar successfully`);
        } else {
          console.log(`Shift ${i+1} not synced to Google Calendar`);
        }
      }
      
      // Save to Supabase if user is logged in
      if (user?.id) {
        const dbSaved = await saveShiftsToDatabase(syncedShifts, user.id);
        if (dbSaved) {
          toast({
            title: "Schedule saved to cloud",
            description: "Your schedule has been saved and synced to your account",
          });
        }
      }
      
      // Always save to localStorage as backup
      const existingShifts = JSON.parse(localStorage.getItem('worktrack_schedule') || '[]');
      
      const shiftsToStore = syncedShifts.map(shift => ({
        ...shift, 
        date: shift.date.toISOString(),
        synced: !!user?.id
      }));
      
      const updatedShifts = [...existingShifts, ...shiftsToStore];
      localStorage.setItem('worktrack_schedule', JSON.stringify(updatedShifts));
      
      // Show appropriate toast messages
      const syncCount = syncResults.filter(Boolean).length;
      if (syncCount > 0) {
        toast({
          title: "Calendar sync complete",
          description: `${syncCount} of ${shifts.length} shifts added to Google Calendar.`,
        });
      } else if (syncResults.length > 0) {
        toast({
          title: "Calendar sync incomplete",
          description: "Shifts not synced to Google Calendar. Check your connection in Settings.",
          variant: "destructive"
        });
      }
      
      onSaveSchedule(syncedShifts);
      setShifts([]);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast({
        title: "Save error",
        description: "There was a problem saving your schedule to the cloud",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleSelect = (value: string) => {
    if (value === "custom") {
      setOpen(true);
    } else {
      setNewShift((prev) => ({ ...prev, title: value }));
    }
  };

  const handleSaveCustomTitle = () => {
    if (customTitle.trim() === "") {
      toast({
        title: "Invalid title",
        description: "Please enter a valid shift title",
        variant: "destructive",
      });
      return;
    }

    setNewShift((prev) => ({ ...prev, title: customTitle }));
    setOpen(false);
    setCustomTitle("");
  };

  return (
    <div className="border rounded-xl p-6 space-y-6 bg-white dark:bg-slate-900">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add New Shift</h3>
        
        <ShiftForm 
          newShift={newShift}
          setNewShift={setNewShift}
          onTitleSelect={handleTitleSelect}
        />
        
        <Button 
          className="w-full" 
          onClick={handleAddShift}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Shift
        </Button>
      </div>

      {shifts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Added Shifts</h3>
            <span className="text-sm text-muted-foreground">{shifts.length} shifts</span>
          </div>
          
          <ShiftList 
            shifts={shifts} 
            onRemoveShift={handleRemoveShift} 
          />
          
          <Button 
            className="w-full" 
            onClick={handleSaveSchedule}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Schedule
              </>
            )}
          </Button>
        </div>
      )}

      <CustomTitleDialog 
        open={open} 
        setOpen={setOpen}
        customTitle={customTitle}
        setCustomTitle={setCustomTitle}
        onSave={handleSaveCustomTitle}
      />
    </div>
  );
};

export default ManualShiftEntry;
