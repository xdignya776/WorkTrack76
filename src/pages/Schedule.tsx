import { useState } from "react";
import Navbar from "@/components/Navbar";
import ManualShiftEntry from "@/components/ManualShiftEntry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Sun, CalendarPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { saveScheduleToStorage, saveInsightsToStorage, generateInsightsFromSchedule } from "@/utils/insightGenerator";

const Upload = () => {
  const { user } = useAuth();
  const [syncingCalendar, setSyncingCalendar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const navigate = useNavigate();

  const handleSaveManualSchedule = async (shifts: any[]) => {
    // Save to the database if user is logged in
    if (user?.id) {
      try {
        await saveScheduleToStorage(shifts, user.id);
        
        // Generate insights based on the new schedule
        const insights = await generateInsightsFromSchedule(shifts, user.gender, user.id);
        
        if (insights && insights.length > 0) {
          await saveInsightsToStorage(insights, user.id);
        }
        
        toast({
          title: "Schedule Saved",
          description: `${shifts.length} shifts have been added to your schedule and synced to your account`,
        });
      } catch (error) {
        console.error("Error saving schedule to database:", error);
        toast({
          title: "Sync Error",
          description: "Your schedule was saved locally but couldn't be synced to your account",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Schedule Saved Locally",
        description: `${shifts.length} shifts have been added to your schedule`,
      });
    }
    
    // Redirect to calendar page after a brief delay
    setTimeout(() => {
      navigate('/calendar');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                Insert Shifts
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Add Your Work Schedule
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Insert your shifts and stay on top of your schedule.
              </p>
            </div>
            
            <div className="w-auto mb-12">
              <div>
                <ManualShiftEntry onSaveSchedule={handleSaveManualSchedule} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
