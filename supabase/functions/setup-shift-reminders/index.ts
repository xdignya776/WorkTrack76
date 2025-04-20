
// Follow Deno runtime API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, shiftId, reminderTime, deleteDuplicates, queryOnly } = await req.json();
    
    if (!userId || !shiftId) {
      return new Response(
        JSON.stringify({ error: "User ID and Shift ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: { 
          persistSession: false 
        }
      }
    );
    
    // Get the user's Google access token
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('google_calendar_token')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile?.google_calendar_token) {
      console.error('Error fetching Google Calendar token:', profileError);
      return new Response(
        JSON.stringify({ 
          error: "Google Calendar not connected",
          details: "The user needs to connect their Google Calendar first" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the shift details
    const { data: shift, error: shiftError } = await supabaseAdmin
      .from('work_schedules')
      .select('*')
      .eq('id', shiftId)
      .single();
      
    if (shiftError || !shift) {
      console.error('Error fetching shift:', shiftError);
      return new Response(
        JSON.stringify({ error: "Shift not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate reminder time (default to 30 minutes before if not specified)
    const reminderMinutes = reminderTime || 30;
    const shiftDate = new Date(shift.date);
    
    // Parse HH:MM time
    const [hours, minutes] = shift.start_time.split(':').map(Number);
    shiftDate.setHours(hours, minutes, 0, 0);
    
    // Create the event with notification
    const event = {
      summary: `Shift Reminder: ${shift.title}`,
      description: `Reminder for your upcoming shift: ${shift.title}`,
      start: {
        dateTime: shiftDate.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(shiftDate.getTime() + 15 * 60000).toISOString(), // 15 min reminder event
        timeZone: 'UTC'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes }
        ]
      }
    };
    
    // Check for existing events with the same title on the same day
    try {
      // Use a wider window (6 hours before and 6 hours after) to ensure we catch all duplicates
      const checkEventsResponse = await supabaseAdmin.functions.invoke('exchange-google-token', {
        body: { 
          type: 'list_events',
          query: {
            timeMin: new Date(shiftDate.getTime() - 6 * 60 * 60000).toISOString(), // 6 hours before
            timeMax: new Date(shiftDate.getTime() + 6 * 60 * 60000).toISOString(), // 6 hours after
            q: shift.title // Search for events with this title
          },
          accessToken: profile.google_calendar_token
        }
      });

      if (checkEventsResponse.error) {
        console.error('Error checking for existing events:', checkEventsResponse.error);
      } else if (checkEventsResponse.data?.events?.items?.length > 0) {
        // Check if any of the found events are for the same shift
        const exactShiftTitle = `Shift Reminder: ${shift.title}`;
        const similarEvents = checkEventsResponse.data.events.items.filter((existingEvent: any) => {
          return existingEvent.summary === exactShiftTitle;
        });
        
        if (similarEvents.length > 0) {
          console.log('Found existing similar events:', similarEvents.length);
          
          // If we're only querying for existing events, return the found events
          if (queryOnly === true) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: "Found existing events",
                duplicate: true,
                eventDetails: similarEvents[0],
                duplicateCount: similarEvents.length - 1,
                allEvents: similarEvents
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // If we should delete duplicates and there's more than one, or if deleteDuplicates is explicitly set
          if ((similarEvents.length > 0 && deleteDuplicates !== false) || deleteDuplicates === true) {
            console.log('Deleting all duplicate events...');
            
            // Delete all similar events - we'll create a fresh one
            for (const eventToDelete of similarEvents) {
              try {
                await supabaseAdmin.functions.invoke('exchange-google-token', {
                  body: { 
                    type: 'delete_event',
                    eventId: eventToDelete.id,
                    accessToken: profile.google_calendar_token
                  }
                });
                console.log(`Successfully deleted duplicate event: ${eventToDelete.id}`);
              } catch (deleteError) {
                console.error(`Error deleting duplicate event ${eventToDelete.id}:`, deleteError);
              }
            }
            
            // If we're only querying and deleting, don't create a new event
            if (queryOnly === true) {
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  message: "Removed duplicate reminders",
                  deletedCount: similarEvents.length
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            
            // Create a fresh event after deleting all duplicates
            const response = await supabaseAdmin.functions.invoke('exchange-google-token', {
              body: { 
                type: 'create_event',
                event,
                accessToken: profile.google_calendar_token
              }
            });
            
            if (response.error) {
              throw new Error(response.error);
            }
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: "Removed duplicate reminders and created new one",
                deletedCount: similarEvents.length,
                eventDetails: response.data?.eventData
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // If we're not deleting duplicates, just report that we found them
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Reminder already exists",
              duplicate: true,
              eventDetails: similarEvents[0],
              duplicateCount: similarEvents.length - 1
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // If we're only querying for events and found none
      if (queryOnly === true) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No existing events found",
            duplicate: false
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If no duplicate found, proceed with event creation
      const response = await supabaseAdmin.functions.invoke('exchange-google-token', {
        body: { 
          type: 'create_event',
          event,
          accessToken: profile.google_calendar_token
        }
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Reminder set successfully",
          eventDetails: response.data?.eventData
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (calendarError) {
      console.error('Error creating Google Calendar event:', calendarError);
      return new Response(
        JSON.stringify({ error: "Failed to create calendar reminder", details: calendarError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (err) {
    console.error('Unexpected error in setup-shift-reminders function:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
