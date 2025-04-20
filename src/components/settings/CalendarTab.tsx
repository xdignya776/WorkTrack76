
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Import the new components
import ConnectedCalendars from "./calendar-tabs/ConnectedCalendars";
import SyncTab from "./calendar-tabs/SyncTab";
import AppearanceTab from "./calendar-tabs/AppearanceTab";
import ConflictsTab from "./calendar-tabs/ConflictsTab";

// Google Calendar configuration
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Updated with the correct client ID
const GOOGLE_CLIENT_ID = "155806295475-i0fp0lfmt99uk97t9jp6ieucn7k1udm1.apps.googleusercontent.com";

const CalendarTab = () => {
  const { user, updateUserProfile } = useAuth();
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingApple, setIsConnectingApple] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isAppleConnected, setIsAppleConnected] = useState(false);
  const [syncConflictMode, setSyncConflictMode] = useState("ask");
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [googleTokenData, setGoogleTokenData] = useState<{ accessToken: string; expiresAt: number } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  useEffect(() => {
    checkGoogleCalendarConnection();
    checkOAuthCallback();
  }, [user, updateUserProfile]);

  const checkGoogleCalendarConnection = () => {
    // Check if user has Google Calendar token in user profile
    if (user?.googleCalendarToken) {
      try {
        const tokenData = JSON.parse(user.googleCalendarToken);
        if (tokenData.expiresAt && tokenData.expiresAt > Date.now()) {
          setGoogleTokenData(tokenData);
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
            setGoogleTokenData(tokenData);
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

  const checkOAuthCallback = () => {
    // Check URL parameters for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const calendarConnected = urlParams.get('calendar_connected');
    const tokenParam = urlParams.get('calendar_token');
    
    if (calendarConnected === 'true' && tokenParam) {
      try {
        const token = JSON.parse(atob(tokenParam));
        setGoogleTokenData(token);
        setIsGoogleConnected(true);
        
        // Save token to user profile if logged in
        if (user?.id && updateUserProfile) {
          updateUserProfile({
            googleCalendarToken: JSON.stringify(token)
          });
        }
        
        // Also save to localStorage as fallback
        localStorage.setItem('google_calendar_token', JSON.stringify(token));
        
        toast({
          title: "Google Calendar connected",
          description: "Your Google Calendar has been successfully connected.",
        });
        
        // Remove the query parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (error) {
        console.error("Error processing calendar token:", error);
      }
    }
  };

  const handleConnectGoogle = () => {
    if (isGoogleConnected) {
      setIsGoogleConnected(false);
      setGoogleTokenData(null);
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
      console.log("Using Google Client ID for calendar connection:", GOOGLE_CLIENT_ID);
      
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = encodeURIComponent(GOOGLE_CALENDAR_SCOPES.join(' '));
      const state = encodeURIComponent(JSON.stringify({ 
        returnTo: '/settings',
        calendarAuth: true  // Flag to indicate this is for calendar auth, not login
      }));
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
      
      console.log("Redirecting to Google Calendar OAuth URL:", authUrl);
      window.location.href = authUrl;
    }
  };

  const handleConnectApple = () => {
    if (isAppleConnected) {
      setIsAppleConnected(false);
      toast({
        title: "Apple Calendar disconnected",
        description: "Your Apple Calendar has been disconnected.",
      });
    } else {
      setIsConnectingApple(true);
      setTimeout(() => {
        setIsConnectingApple(false);
        setIsAppleConnected(true);
        toast({
          title: "Apple Calendar connected",
          description: "Your Apple Calendar has been successfully connected.",
        });
      }, 1500);
    }
  };

  const handleTestCreateEvent = async () => {
    if (!googleTokenData) {
      toast({
        title: "Calendar not connected",
        description: "Please connect your Google Calendar first.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsCreatingEvent(true);
    
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Call the Supabase edge function to create the event
      const { data, error } = await supabase.functions.invoke('exchange-google-token', {
        body: {
          type: 'create_event',
          accessToken: googleTokenData.accessToken,
          event: {
            summary: "Test WorkTrack Shift",
            description: "This is a test shift created from WorkTrack.",
            start: {
              dateTime: now.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: oneHourLater.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        }
      });
      
      if (error) {
        console.error("Error calling edge function:", error);
        throw new Error(error.message);
      }
      
      if (!data?.success) {
        throw new Error("Failed to create event in Google Calendar");
      }
      
      console.log("Event created successfully:", data.eventData);
      
      toast({
        title: "Event created",
        description: `"Test WorkTrack Shift" has been added to your Google Calendar.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      toast({
        title: "Failed to create event",
        description: "There was an error creating the event in Google Calendar.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleSaveChanges = () => {
    // Save sync preferences to local storage
    localStorage.setItem('worktrack_calendar_settings', JSON.stringify({
      autoSyncEnabled,
      syncConflictMode,
      showColorOptions
    }));
    
    toast({
      title: "Calendar settings saved",
      description: "Your calendar preferences have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-medium">Calendar Settings</h2>
      
      <ConnectedCalendars
        user={user}
        isGoogleConnected={isGoogleConnected}
        isAppleConnected={isAppleConnected}
        isConnectingGoogle={isConnectingGoogle}
        isConnectingApple={isConnectingApple}
        handleConnectGoogle={handleConnectGoogle}
        handleConnectApple={handleConnectApple}
        isCreatingEvent={isCreatingEvent}
        handleTestCreateEvent={handleTestCreateEvent}
      />

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          <TabsTrigger value="appearance">Event Appearance</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Handling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sync">
          <SyncTab 
            isGoogleConnected={isGoogleConnected}
            isAppleConnected={isAppleConnected}
            autoSyncEnabled={autoSyncEnabled}
            setAutoSyncEnabled={setAutoSyncEnabled}
            handleConnectGoogle={handleConnectGoogle}
            handleConnectApple={handleConnectApple}
            isConnectingGoogle={isConnectingGoogle}
            isConnectingApple={isConnectingApple}
            handleTestCreateEvent={handleTestCreateEvent}
            isCreatingEvent={isCreatingEvent}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab 
            showColorOptions={showColorOptions}
            setShowColorOptions={setShowColorOptions}
          />
        </TabsContent>

        <TabsContent value="conflicts">
          <ConflictsTab 
            syncConflictMode={syncConflictMode}
            setSyncConflictMode={setSyncConflictMode}
          />
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default CalendarTab;
