export interface User {
  id: string;
  email: string;
  name: string;
  provider: "email" | "google" | "apple";
  avatar?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  hasCompletedSetup?: boolean;
  accessToken?: string; // For OAuth providers
  googleCalendarToken?: string; // For storing Google Calendar token
  timezone?: string; // Added timezone property
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}
