import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// User storage key
export const USER_STORAGE_KEY = "worktrack_user_data";

// Google OAuth client ID
export const GOOGLE_CLIENT_ID = "155806295475-i0fp0lfmt99uk97t9jp6ieucn7k1udm1.apps.googleusercontent.com";

// Load user from local storage
export const loadUserFromLocalStorage = (): User | null => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  
  if (savedUser) {
    try {
      console.log("Loading saved user from localStorage");
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to parse saved user:", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
  
  return null;
};

// Save user to local storage
export const saveUserToLocalStorage = (user: User | null): void => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

// Map Supabase user to our User type
export const mapSupabaseUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
    provider: (supabaseUser.app_metadata.provider as any) || 'email',
    avatar: supabaseUser.user_metadata.avatar_url,
    hasCompletedSetup: supabaseUser.user_metadata.has_completed_setup || false,
    gender: supabaseUser.user_metadata.gender,
    timezone: supabaseUser.user_metadata.timezone || 'america_new_york', // Added timezone mapping
  };
};
