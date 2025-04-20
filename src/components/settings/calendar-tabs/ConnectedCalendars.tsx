
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { GoogleIcon, AppleLogoIcon, RefreshIcon, PlusIcon } from "./CalendarIcons";

interface ConnectedCalendarsProps {
  user: any;
  isGoogleConnected: boolean;
  isAppleConnected: boolean;
  isConnectingGoogle: boolean;
  isConnectingApple: boolean;
  handleConnectGoogle: () => void;
  handleConnectApple: () => void;
  isCreatingEvent: boolean;
  handleTestCreateEvent: () => void;
}

const ConnectedCalendars: React.FC<ConnectedCalendarsProps> = ({
  user,
  isGoogleConnected,
  isAppleConnected,
  isConnectingGoogle,
  isConnectingApple,
  handleConnectGoogle,
  handleConnectApple
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-medium">
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          Connected Calendars
        </CardTitle>
        <CardDescription>
          Connect your calendars to sync your work schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center">
            <GoogleIcon />
            <div className="ml-3">
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                {isGoogleConnected 
                  ? `Connected (${user?.email || 'your account'})` 
                  : "Not connected"}
              </p>
            </div>
          </div>
          <Button 
            variant={isGoogleConnected ? "outline" : "default"}
            onClick={handleConnectGoogle}
            disabled={isConnectingGoogle}
          >
            {isConnectingGoogle ? (
              <>
                <RefreshIcon className="mr-2 h-4 w-4" />
                Connecting...
              </>
            ) : (
              isGoogleConnected ? "Disconnect" : "Connect"
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center">
            <AppleLogoIcon />
            <div className="ml-3">
              <h3 className="font-medium">Apple Calendar</h3>
              <p className="text-sm text-muted-foreground">
                {isAppleConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Button 
            variant={isAppleConnected ? "outline" : "default"}
            onClick={handleConnectApple}
            disabled={isConnectingApple}
          >
            {isConnectingApple ? (
              <>
                <RefreshIcon className="mr-2 h-4 w-4" />
                Connecting...
              </>
            ) : (
              isAppleConnected ? "Disconnect" : "Connect"
            )}
          </Button>
        </div>

        <Button variant="outline" className="w-full mt-2">
          <PlusIcon className="mr-2 h-4 w-4" />
          Connect Another Calendar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectedCalendars;
