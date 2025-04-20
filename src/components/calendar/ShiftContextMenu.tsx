
import { useState } from "react";
import { Bell, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShiftEvent } from "../CalendarView";
import { setupShiftReminder } from "@/utils/shiftSyncUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ShiftContextMenuProps {
  children: React.ReactNode;
  shift: ShiftEvent;
  onShiftUpdated: () => void;
}

export default function ShiftContextMenu({ children, shift, onShiftUpdated }: ShiftContextMenuProps) {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedStartTime, setEditedStartTime] = useState(shift.startTime);
  const [editedEndTime, setEditedEndTime] = useState(shift.endTime);
  const [editedTitle, setEditedTitle] = useState(shift.title);
  const isMobile = useIsMobile();
  
  const handleSetReminder = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to set reminders",
      });
      return;
    }
    
    // Convert shift to the right type for setupShiftReminder
    const shiftWithStringId = {
      ...shift,
      id: shift.id.toString() // Convert id to string
    };
    
    const success = await setupShiftReminder(shiftWithStringId, user, 30);
    
    if (success) {
      onShiftUpdated();
      if (isMobile) {
        setIsMobileActionsOpen(false);
      }
    }
  };
  
  const handleEditShift = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit shifts",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('work_schedules')
        .update({
          title: editedTitle,
          start_time: editedStartTime,
          end_time: editedEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', shift.id.toString()); // Convert id to string for consistency
      
      if (error) throw error;
      
      toast({
        title: "Shift updated",
        description: "Your shift has been successfully updated"
      });
      
      setIsEditDialogOpen(false);
      if (isMobile) {
        setIsMobileActionsOpen(false);
      }
      onShiftUpdated();
    } catch (error) {
      console.error("Error updating shift:", error);
      toast({
        title: "Update failed",
        description: "Could not update shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteShift = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete shifts",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // First, if Google Calendar is connected, try to delete the corresponding event
      if (user.googleCalendarToken) {
        try {
          // Get the Google Calendar reminders for this shift to get the eventId
          const { data: reminderResponse } = await supabase.functions.invoke('setup-shift-reminders', {
            body: {
              userId: user.id,
              shiftId: shift.id.toString(),
              // Just query for the event, don't create a new one
              queryOnly: true
            }
          });
          
          // If we found events in Google Calendar, delete them
          if (reminderResponse?.duplicate && reminderResponse?.eventDetails?.id) {
            console.log("Found Google Calendar event to delete:", reminderResponse.eventDetails.id);
            
            // Parse the token
            const tokenData = JSON.parse(user.googleCalendarToken);
            
            // Delete the event through our edge function
            await supabase.functions.invoke('exchange-google-token', {
              body: { 
                type: 'delete_event',
                eventId: reminderResponse.eventDetails.id,
                accessToken: tokenData.accessToken
              }
            });
            
            console.log("Successfully deleted Google Calendar event");
          }
        } catch (calendarError) {
          console.error("Error deleting from Google Calendar:", calendarError);
          // Continue with local deletion even if Google Calendar deletion fails
        }
      }
      
      // Now delete from Supabase
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', shift.id.toString()); // Convert id to string
      
      if (error) throw error;
      
      toast({
        title: "Shift deleted",
        description: "Your shift has been successfully removed from all calendars"
      });
      
      setIsDeleteDialogOpen(false);
      if (isMobile) {
        setIsMobileActionsOpen(false);
      }
      onShiftUpdated();
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast({
        title: "Deletion failed",
        description: "Could not delete shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleOpenEdit = () => {
    setIsMobileActionsOpen(false);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDelete = () => {
    setIsMobileActionsOpen(false);
    setIsDeleteDialogOpen(true);
  };
  
  // For mobile, we use a bottom sheet triggered by a click on the shift
  if (isMobile) {
    return (
      <>
        {/* Use simple click instead of long press for mobile */}
        <div onClick={() => setIsMobileActionsOpen(true)} className="w-full h-full">
          {children}
        </div>
        
        {/* Mobile Bottom Sheet */}
        <Sheet open={isMobileActionsOpen} onOpenChange={setIsMobileActionsOpen}>
          <SheetContent side="bottom" className="px-0">
            <SheetHeader className="px-4">
              <SheetTitle>{shift.title}</SheetTitle>
              <SheetDescription>
                {format(shift.date, "EEEE, MMMM d, yyyy")} · {shift.startTime} - {shift.endTime}
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-0 py-4">
              <Button 
                variant="ghost" 
                className="justify-start rounded-none h-12 px-4 font-normal" 
                onClick={handleOpenEdit}
              >
                <Edit className="h-4 w-4 mr-3" /> Edit Shift
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start rounded-none h-12 px-4 font-normal" 
                onClick={handleSetReminder}
              >
                <Bell className="h-4 w-4 mr-3" /> Set Reminder
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start rounded-none h-12 px-4 font-normal text-destructive hover:text-destructive" 
                onClick={handleOpenDelete}
              >
                <Trash2 className="h-4 w-4 mr-3" /> Delete Shift
              </Button>
            </div>
            
            <SheetFooter className="px-4">
              <SheetClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        {/* Keep the edit and delete dialogs */}
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>
                Make changes to your shift on {format(shift.date, "EEEE, MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  value={editedTitle} 
                  onChange={(e) => setEditedTitle(e.target.value)} 
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={editedStartTime} 
                  onChange={(e) => setEditedStartTime(e.target.value)} 
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={editedEndTime} 
                  onChange={(e) => setEditedEndTime(e.target.value)} 
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditShift} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Shift</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this shift? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Title:</span>
                <span>{shift.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(shift.date, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{shift.startTime} - {shift.endTime}</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteShift} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Shift"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  // For desktop, we use the context menu
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem className="flex gap-2" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
            <span>Edit Shift</span>
          </ContextMenuItem>
          <ContextMenuItem className="flex gap-2" onClick={handleSetReminder}>
            <Bell className="h-4 w-4" />
            <span>Set Reminder</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            className="flex gap-2 text-destructive focus:text-destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Shift</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Make changes to your shift on {format(shift.date, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input 
                id="title" 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)} 
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">Start Time</Label>
              <Input 
                id="startTime" 
                type="time"
                value={editedStartTime} 
                onChange={(e) => setEditedStartTime(e.target.value)} 
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">End Time</Label>
              <Input 
                id="endTime" 
                type="time"
                value={editedEndTime} 
                onChange={(e) => setEditedEndTime(e.target.value)} 
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditShift} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Title:</span>
              <span>{shift.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{format(shift.date, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>{shift.startTime} - {shift.endTime}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteShift} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete Shift"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
