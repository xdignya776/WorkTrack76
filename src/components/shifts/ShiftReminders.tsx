
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShiftRemindersProps {
  shiftId: string;
  shiftTitle: string;
  shiftDate: Date;
  shiftTime: string;
}

const reminderOptions = [
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
];

const ShiftReminders = ({ shiftId, shiftTitle, shiftDate, shiftTime }: ShiftRemindersProps) => {
  const { user } = useAuth();
  const [reminderTime, setReminderTime] = useState("30");
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to set reminders.",
        variant: "destructive"
      });
      return;
    }

    setIsSettingReminder(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-shift-reminders', {
        body: {
          userId: user.id,
          shiftId,
          reminderTime: parseInt(reminderTime)
        }
      });
      
      if (error) {
        if (error.message?.includes("Google Calendar not connected")) {
          toast({
            title: "Google Calendar Not Connected",
            description: "Please connect your Google Calendar in settings first.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setReminderSet(true);
        toast({
          title: "Reminder Set",
          description: `You'll receive a notification ${reminderTime} minutes before your shift.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Failed to set reminder:", error);
      toast({
        title: "Failed to Set Reminder",
        description: "Could not set up Google Calendar reminder. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSettingReminder(false);
    }
  };

  if (reminderSet) {
    return (
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Reminder set</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={reminderTime}
        onValueChange={setReminderTime}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {reminderOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline"
        size="sm"
        onClick={handleSetReminder}
        disabled={isSettingReminder}
        className="flex items-center gap-2"
      >
        {isSettingReminder ? (
          <span>Setting...</span>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            <span>Set Reminder</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ShiftReminders;
