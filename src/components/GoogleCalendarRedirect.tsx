
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Make sure the client ID is accessible
const GOOGLE_CLIENT_ID = "155806295475-i0fp0lfmt99uk97t9jp6ieucn7k1udm1.apps.googleusercontent.com";

const GoogleCalendarRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [netlifyInfo, setNetlifyInfo] = useState<{
    isNetlify: boolean;
    path: string;
    fullUrl: string;
  }>({
    isNetlify: false,
    path: '',
    fullUrl: ''
  });

  useEffect(() => {
    // Save the client ID to localStorage for future reference
    localStorage.setItem('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
    
    // Check if we're on Netlify
    const isNetlify = window.location.hostname.includes('netlify') || 
                     document.referrer.includes('netlify');
    
    setNetlifyInfo({
      isNetlify,
      path: window.location.pathname,
      fullUrl: window.location.href
    });
    
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const stateParam = urlParams.get('state');

        // For debugging
        console.log("OAuth callback params:", { 
          code: code ? "present" : "missing", 
          error, 
          errorDescription,
          state: stateParam,
          fullUrl: window.location.href,
          isNetlify,
          hostname: window.location.hostname
        });

        if (error) {
          setStatus('error');
          setErrorMessage('Authorization was denied: ' + error);
          if (errorDescription) {
            setErrorDetails(errorDescription);
          }
          console.error('OAuth error:', error, errorDescription);
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }

        // Parse the state parameter (contains return path and auth type)
        let returnPath = '/settings';
        let authType = '';
        let isCalendarAuth = false;
        
        if (stateParam) {
          try {
            const stateObj = JSON.parse(decodeURIComponent(stateParam));
            if (stateObj.returnTo) {
              returnPath = stateObj.returnTo;
            }
            if (stateObj.authType) {
              authType = stateObj.authType;
            }
            if (stateObj.calendarAuth) {
              isCalendarAuth = true;
            }
            console.log("Parsed state:", stateObj);
          } catch (e) {
            console.error('Error parsing state parameter:', e);
          }
        }
        
        try {
          console.log("Processing OAuth callback with code:", code.substring(0, 10) + "...");
          const redirectUri = `${window.location.origin}/auth/google/callback`;
          
          if (isCalendarAuth) {
            // Handle calendar OAuth flow with Supabase Edge Function
            console.log("Processing as Calendar OAuth");
            
            try {
              // Exchange the code for tokens using a secure server-side function
              const { data, error } = await supabase.functions.invoke('exchange-google-token', {
                body: { 
                  code,
                  redirectUri,
                  type: 'calendar'
                }
              });
              
              if (error) {
                throw new Error(`Token exchange failed: ${error.message}`);
              }
              
              if (!data || !data.accessToken) {
                throw new Error('No access token received from token exchange');
              }
              
              console.log("Received tokens from edge function:", { 
                accessToken: data.accessToken ? "present" : "missing",
                refreshToken: data.refreshToken ? "present" : "missing" 
              });
              
              // Store calendar tokens in user profile
              await updateUserProfile({
                googleCalendarToken: JSON.stringify({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  expiresAt: data.expiresAt
                })
              });
              
              // Also store in localStorage as a backup
              localStorage.setItem('google_calendar_token', JSON.stringify({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt
              }));
              
              setStatus('success');
              
              toast({
                title: "Google Calendar Connected",
                description: "Your Google Calendar has been successfully connected!",
              });
              
              // Auto-navigate after processing
              setTimeout(() => {
                navigate(`${returnPath}?calendar_connected=true`);
              }, 1500);
              
            } catch (err) {
              console.error("Error exchanging calendar token:", err);
              setStatus('error');
              setErrorMessage("Failed to connect Google Calendar");
              if (err instanceof Error) {
                setErrorDetails(err.message);
              }
            }
            
          } else {
            // This is a sign-in/sign-up flow
            console.log("Processing as Auth OAuth");
            
            try {
              // Exchange the code for tokens and user info
              const { data, error } = await supabase.functions.invoke('exchange-google-token', {
                body: { 
                  code,
                  redirectUri,
                  type: 'signin'
                }
              });
              
              if (error) {
                throw new Error(`Token exchange failed: ${error.message}`);
              }
              
              if (!data || !data.userInfo) {
                throw new Error('No user info received from token exchange');
              }
              
              const { userInfo, accessToken } = data;
              
              console.log("Received user info from Google:", { 
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
              });
              
              // Create a user object with the Google data
              const userData = {
                id: crypto.randomUUID(),
                email: userInfo.email,
                name: userInfo.name,
                provider: 'google' as const,
                avatar: userInfo.picture,
                accessToken,
                hasCompletedSetup: false
              };
              
              console.log("Storing user data:", userData);
              
              // Save the user data in localStorage for auth context
              localStorage.setItem('worktrack_user_data', JSON.stringify(userData));
              
              // Update the user profile with the Google data
              await updateUserProfile(userData);
              
              toast({
                title: "Signed in with Google",
                description: `Welcome, ${userInfo.name}! Complete your profile setup to continue.`,
              });
              
              setStatus('success');
              
              // Auto-navigate after processing
              setTimeout(() => {
                navigate(returnPath);
              }, 1500);
              
            } catch (err) {
              console.error("Error processing signin:", err);
              setStatus('error');
              setErrorMessage("Failed to authenticate with Google");
              if (err instanceof Error) {
                setErrorDetails(err.message);
              }
            }
          }
          
        } catch (err) {
          console.error("Error processing OAuth callback:", err);
          setStatus('error');
          setErrorMessage("Failed to authenticate with Google");
          if (err instanceof Error) {
            setErrorDetails(err.message);
          }
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setErrorMessage('Failed to complete authentication');
        if (error instanceof Error) {
          setErrorDetails(error.message);
        }
      }
    };

    handleOAuthCallback();
  }, [location, navigate, updateUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'loading' && 'Connecting to Google...'}
            {status === 'success' && 'Google Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p>Establishing connection to Google</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p>Your Google account has been successfully connected!</p>
                <p className="text-sm text-muted-foreground">Redirecting you back...</p>
                <Button onClick={() => navigate('/personalization-setup')} variant="outline">
                  Go to Personalization
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p>Could not connect to Google</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                {errorDetails && (
                  <p className="text-xs text-red-500 mt-1 max-w-sm break-words">
                    Error details: {errorDetails}
                  </p>
                )}
                
                {netlifyInfo.isNetlify && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-xs text-left w-full mt-2">
                    <p className="font-medium text-yellow-800 dark:text-yellow-400">Netlify Deployment Issue Detected:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                      <li>Make sure you have a proper netlify.toml configuration</li>
                      <li>Current path: {netlifyInfo.path}</li>
                      <li>Your app needs proper redirect rules for client-side routing</li>
                    </ul>
                  </div>
                )}
                
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-xs text-left w-full mt-2">
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">Troubleshooting:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>Verify your Google Cloud project is properly configured</li>
                    <li>Check that your OAuth consent screen is set up</li>
                    <li>Add <strong>{window.location.origin}/auth/google/callback</strong> to your OAuth redirect URIs</li>
                    <li>Verify that your client ID is correct: {GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'Not found'}</li>
                  </ul>
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-primary mt-2 hover:underline"
                  >
                    Open Google Cloud Console <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    Return to Settings
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/personalization-setup')}>
                    Go to Personalization
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendarRedirect;
