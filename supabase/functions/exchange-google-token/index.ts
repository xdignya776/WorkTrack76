
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = "155806295475-i0fp0lfmt99uk97t9jp6ieucn7k1udm1.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (!GOOGLE_CLIENT_SECRET) {
      console.error("Google Client Secret is not configured in environment variables");
      throw new Error("Google Client Secret is not configured in environment variables");
    }
    
    const requestData = await req.json();
    const { code, redirectUri, type, event, accessToken, query, eventId } = requestData;
    
    if (type === 'delete_event' && accessToken && eventId) {
      // Handle deleting an event
      console.log("Deleting calendar event with ID:", eventId);
      
      try {
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, 
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!calendarResponse.ok) {
          if (calendarResponse.status !== 204) { // 204 is success for DELETE
            const errorText = await calendarResponse.text();
            console.error("Error deleting event:", errorText);
            throw new Error(`Failed to delete calendar event: ${errorText}`);
          }
        }
        
        console.log("Event deleted successfully:", eventId);
        
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error("Calendar API error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    } else if (type === 'list_events' && accessToken && query) {
      // Handle listing events to check for duplicates
      console.log("Listing calendar events with query:", query);
      
      try {
        // Build the query string
        const queryParams = new URLSearchParams();
        if (query.timeMin) queryParams.append('timeMin', query.timeMin);
        if (query.timeMax) queryParams.append('timeMax', query.timeMax);
        if (query.q) queryParams.append('q', query.q);
        
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json();
          console.error("Error listing events:", errorData);
          throw new Error(`Failed to list calendar events: ${errorData.error?.message || JSON.stringify(errorData)}`);
        }
        
        const events = await calendarResponse.json();
        console.log(`Found ${events.items ? events.items.length : 0} events matching query`);
        
        return new Response(
          JSON.stringify({ success: true, events }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error("Calendar API error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    } else if (type === 'create_event' && event) {
      // Handle event creation
      if (!accessToken) {
        console.error("No access token provided for event creation");
        throw new Error("No access token provided for event creation");
      }
      
      console.log("Creating calendar event:", JSON.stringify(event));
      
      try {
        const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
        
        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json();
          console.error("Error creating event:", errorData);
          throw new Error(`Failed to create calendar event: ${errorData.error?.message || JSON.stringify(errorData)}`);
        }
        
        const eventData = await calendarResponse.json();
        console.log("Event created successfully:", eventData.id);
        
        return new Response(
          JSON.stringify({ success: true, eventData }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error("Calendar API error:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    }
    
    // Token exchange flow
    if (!code || !redirectUri) {
      console.error("Missing required parameters:", { code: !!code, redirectUri });
      throw new Error("Missing required parameters: code and redirectUri are required");
    }
    
    console.log(`Processing ${type} token exchange for code: ${code.substring(0, 10)}...`);
    console.log(`Redirect URI: ${redirectUri}`);
    
    // Build form data for token request
    const formData = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      // Include more details about why the token exchange failed
      const errorDetails = {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenData.error,
        error_description: tokenData.error_description,
        code_length: code ? code.length : 0,
        redirect_uri: redirectUri
      };
      console.error('Token exchange error details:', errorDetails);
      throw new Error(`Failed to exchange token: ${tokenData.error_description || tokenData.error || "Unknown error"}`);
    }
    
    console.log('Token exchange successful, received tokens');
    
    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = Date.now() + expires_in * 1000;
    
    // For sign-in flow, get user info
    if (type === 'signin') {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Retrieved user info:', { email: userInfo.email, name: userInfo.name });
        
        return new Response(
          JSON.stringify({
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt,
            userInfo,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (userInfoError) {
        console.error('Error fetching user info:', userInfoError);
        throw userInfoError;
      }
    }
    
    // For calendar auth, just return the tokens
    return new Response(
      JSON.stringify({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in Google token exchange:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
