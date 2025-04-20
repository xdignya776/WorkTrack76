
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDuration } from "../calendar/calendarUtils";

export interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  synced?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface ShiftListProps {
  shifts: Shift[];
  onRemoveShift: (id: string) => void;
}

const ShiftList = ({ shifts, onRemoveShift }: ShiftListProps) => {
  // Calculate if a shift is long (>8 hours)
  const isLongShift = (startTime: string, endTime: string) => {
    const duration = calculateDuration(startTime, endTime);
    return parseFloat(duration) > 8;
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
      {shifts.map((shift) => (
        <div 
          key={shift.id} 
          className={`border rounded-md p-3 flex justify-between items-start hover:bg-accent/50 transition-colors
            ${shift.priority === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-950/10 dark:border-red-900/50' : ''}
            ${isLongShift(shift.startTime, shift.endTime) ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900/50' : ''}
          `}
        >
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{shift.title}</h4>
              {isLongShift(shift.startTime, shift.endTime) && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Long shift
                </span>
              )}
              {shift.priority === 'high' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  High priority
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(shift.date, "EEE, MMM d")} • {shift.startTime} - {shift.endTime}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveShift(shift.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ShiftList;
