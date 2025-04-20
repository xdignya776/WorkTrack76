
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface SyncTabProps {
  isGoogleConnected: boolean;
  isAppleConnected: boolean;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (value: boolean) => void;
  handleConnectGoogle: () => void;
  handleConnectApple: () => void;
  isConnectingGoogle: boolean;
  isConnectingApple: boolean;
  handleTestCreateEvent: () => void;
  isCreatingEvent: boolean;
}

const SyncTab: React.FC<SyncTabProps> = ({
  isGoogleConnected,
  isAppleConnected,
  autoSyncEnabled,
  setAutoSyncEnabled,
  handleConnectGoogle,
  handleConnectApple,
  isConnectingGoogle,
  isConnectingApple,
  handleTestCreateEvent,
  isCreatingEvent
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Synchronization</CardTitle>
        <CardDescription>
          Control how your work schedules sync to your calendars
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Google Calendar Sync</h3>
            <p className="text-sm text-muted-foreground">Sync your schedule with Google Calendar</p>
          </div>
          <Switch checked={isGoogleConnected} 
            onCheckedChange={isChecked => {
              if (!isChecked && isGoogleConnected) {
                handleConnectGoogle();
              } else if (isChecked && !isGoogleConnected) {
                handleConnectGoogle();
              }
            }} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Apple Calendar Sync</h3>
            <p className="text-sm text-muted-foreground">Sync your schedule with Apple Calendar</p>
          </div>
          <Switch 
            checked={isAppleConnected} 
            disabled={!isAppleConnected} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Auto-Sync New Schedules</h3>
            <p className="text-sm text-muted-foreground">Automatically sync new uploaded schedules</p>
          </div>
          <Switch 
            checked={autoSyncEnabled} 
            onCheckedChange={setAutoSyncEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">Sync schedule changes immediately</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="grid gap-2 pt-2">
          <Label htmlFor="calendar-view">Default Calendar View</Label>
          <Select defaultValue="week">
            <SelectTrigger>
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 pt-2">
          <Label htmlFor="timezone">Time Zone</Label>
          <Select defaultValue="america_new_york">
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="america_new_york">America/New York</SelectItem>
              <SelectItem value="america_los_angeles">America/Los Angeles</SelectItem>
              <SelectItem value="europe_london">Europe/London</SelectItem>
              <SelectItem value="asia_tokyo">Asia/Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isGoogleConnected && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={handleTestCreateEvent}
            disabled={isCreatingEvent}
          >
            {isCreatingEvent ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Creating Event...
              </>
            ) : (
              "Test Calendar Integration"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncTab;
