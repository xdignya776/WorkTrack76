
import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Shift } from "../ManualShiftEntry";

export const DEFAULT_SHIFT_TITLES = [
  "Morning Shift",
  "Day Shift",
  "Evening Shift",
  "Night Shift",
  "On-Call Shift",
  "Remote Work",
  "Office Day",
];

interface ShiftFormProps {
  newShift: Partial<Shift>;
  setNewShift: Dispatch<SetStateAction<Partial<Shift>>>;
  onTitleSelect: (value: string) => void;
}

const ShiftForm = ({ newShift, setNewShift, onTitleSelect }: ShiftFormProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !newShift.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {newShift.date ? (
                format(newShift.date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newShift.date}
              onSelect={(date) => setNewShift((prev) => ({ ...prev, date }))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="shift-title">Shift Type</Label>
        <Select 
          value={newShift.title} 
          onValueChange={onTitleSelect}
        >
          <SelectTrigger id="shift-title">
            <SelectValue placeholder="Select a shift type" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_SHIFT_TITLES.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom title...</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="start-time">Start Time</Label>
        <Input
          id="start-time"
          type="time"
          value={newShift.startTime}
          onChange={(e) => setNewShift((prev) => ({ ...prev, startTime: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-time">End Time</Label>
        <Input
          id="end-time"
          type="time"
          value={newShift.endTime}
          onChange={(e) => setNewShift((prev) => ({ ...prev, endTime: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default ShiftForm;
