
import { Dispatch, SetStateAction } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomTitleDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  customTitle: string;
  setCustomTitle: Dispatch<SetStateAction<string>>;
  onSave: () => void;
}

const CustomTitleDialog = ({
  open,
  setOpen,
  customTitle,
  setCustomTitle,
  onSave
}: CustomTitleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom Shift Title</DialogTitle>
          <DialogDescription>
            Enter a custom title for this shift.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="custom-title">Title</Label>
            <Input
              id="custom-title"
              placeholder="Enter shift title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave}>Save Title</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTitleDialog;
