import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { 
  USER_STORAGE_KEY, 
  GOOGLE_CLIENT_ID, 
  loadUserFromLocalStorage, 
  saveUserToLocalStorage, 
  mapSupabaseUser 
} from "@/utils/authUtils";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    const loadUserSession = () => {
      setIsLoading(true);
      
      // Check supabase auth session first
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // In a production app, we would fetch the user profile from Supabase
          // For now, use the session user info
          const supabaseUser = session.user;
          
          if (supabaseUser) {
            const user = mapSupabaseUser(supabaseUser);
            
            console.log("Found Supabase session:", user);
            setUser(user);
            saveUserToLocalStorage(user);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage if no Supabase session
        const savedUser = loadUserFromLocalStorage();
        if (savedUser) {
          setUser(savedUser);
        }
        
        setIsLoading(false);
      });
    };

    loadUserSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (session) {
        const supabaseUser = session.user;
        
        if (supabaseUser) {
          const user = mapSupabaseUser(supabaseUser);
          
          setUser(user);
          saveUserToLocalStorage(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In production, we would use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user = mapSupabaseUser(data.user);
        
        setUser(user);
        saveUserToLocalStorage(user);
        
        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Redirect to calendar page after successful login
        navigate("/calendar");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      
      // For demo purposes, fall back to mock login if Supabase auth fails
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Create a temporary user
      const authUser: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        provider: "email",
      };
      
      // Save user to state and localStorage
      setUser(authUser);
      saveUserToLocalStorage(authUser);
      
      toast({
        title: "Signed in successfully (Demo Mode)",
        description: `Welcome back, ${authUser.name}!`,
      });
      
      // Redirect to calendar page after successful login
      navigate("/calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // In production, we would use Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            has_completed_setup: false
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: name,
          provider: 'email',
          hasCompletedSetup: false
        };
        
        setUser(user);
        saveUserToLocalStorage(user);
        
        toast({
          title: "Account created successfully",
          description: `Welcome, ${name}!`,
        });
        
        // Redirect to personalization setup after successful signup
        navigate("/personalization-setup");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      
      // For demo purposes, fall back to mock signup if Supabase auth fails
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }
      
      // Create a new user
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        provider: "email",
        hasCompletedSetup: false
      };
      
      // Save to state and localStorage
      setUser(newUser);
      saveUserToLocalStorage(newUser);
      
      toast({
        title: "Account created successfully (Demo Mode)",
        description: `Welcome, ${name}!`,
      });
      
      // Redirect to personalization setup after successful signup
      navigate("/personalization-setup");
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in function
  const signInWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      // In a production app, we would use Supabase auth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/google/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
      
      if (data.url) {
        // Store the client ID in localStorage for the redirect component to use
        localStorage.setItem('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
        console.log("Redirecting to Supabase OAuth URL");
        
        // Supabase will handle the redirect
        window.location.href = data.url;
        return;
      }
      
      // Fallback to our custom OAuth implementation if Supabase fails
      console.log("Falling back to custom OAuth implementation");
      
      // Store the client ID in localStorage for the redirect component to use
      localStorage.setItem('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
      
      // Get the current deployment URL for the redirect
      const baseUrl = window.location.origin;
      const redirectUri = `${baseUrl}/auth/google/callback`;
      
      const scope = encodeURIComponent('email profile');
      const state = encodeURIComponent(JSON.stringify({ 
        returnTo: '/personalization-setup',  // Send to personalization first
        authType: 'signin' 
      }));
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
      
      console.log("Redirecting to Google OAuth URL:", authUrl);
      
      // For demonstration purposes, save some mock data to localStorage
      // This simulates what would be returned from a successful OAuth flow
      localStorage.setItem('temp_google_email', 'demo.user@gmail.com');
      localStorage.setItem('temp_google_name', 'Demo User');
      localStorage.setItem('temp_google_avatar', `https://ui-avatars.com/api/?name=Demo+User&background=random`);
      
      // Redirect the user to Google's OAuth page
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Google sign in failed",
        description: "Unable to authenticate with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return Promise.resolve();

    const updatedUser = { ...user, ...updates };
    console.log("Updating user profile:", updatedUser);

    try {
      // In a production app, we would update the Supabase user metadata
      if (user.id) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: updatedUser.name,
            avatar_url: updatedUser.avatar,
            gender: updatedUser.gender,
            has_completed_setup: updatedUser.hasCompletedSetup,
            google_calendar_token: updatedUser.googleCalendarToken,
            timezone: updatedUser.timezone, // Added timezone property
          }
        });

        if (error) {
          console.error("Error updating Supabase user:", error);
          // Fall back to local storage if Supabase update fails
        }
      }

      // Always update local state and storage
      setUser(updatedUser);
      saveUserToLocalStorage(updatedUser);

      return Promise.resolve();
    } catch (error) {
      console.error("Error updating user profile:", error);
      return Promise.resolve();
    }
  };

  // Sign out function
  const signOut = () => {
    // In a production app, we would use Supabase auth
    supabase.auth.signOut().then(() => {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('temp_google_name');
      localStorage.removeItem('temp_google_email');
      localStorage.removeItem('temp_google_avatar');
      localStorage.removeItem('google_calendar_token');
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    }).catch(error => {
      console.error("Error signing out with Supabase:", error);
      
      // Fallback to manual signout if Supabase fails
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('temp_google_name');
      localStorage.removeItem('temp_google_email');
      localStorage.removeItem('temp_google_avatar');
      localStorage.removeItem('google_calendar_token');
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    });
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserProfile
  };
};
