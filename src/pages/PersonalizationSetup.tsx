
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const PersonalizationSetup = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<string>(user?.gender || "prefer_not_to_say");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check if user profile info is already available
  useEffect(() => {
    // If user data has loaded and they've already completed setup, redirect to calendar
    if (user) {
      setIsLoading(false);
      if (user.hasCompletedSetup) {
        navigate("/calendar");
      }
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserProfile({ 
        gender: gender as "male" | "female" | "other" | "prefer_not_to_say",
        hasCompletedSetup: true 
      });
      
      toast({
        title: "Profile updated",
        description: "Your personalization settings have been saved.",
      });
      
      // Redirect to calendar page
      navigate("/calendar");
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast({
        variant: "destructive",
        title: "Error saving preferences",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking user data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Loading your profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Personalize Your Experience</CardTitle>
          <CardDescription>
            Help us tailor WorkTrack to your needs. This information helps us provide more relevant insights.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What is your gender?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This helps us provide gender-specific insights and recommendations.
              </p>
              <RadioGroup defaultValue="prefer_not_to_say" value={gender} onValueChange={setGender}>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="flex-1 cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="flex-1 cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex-1 cursor-pointer">Other</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                  <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                  <Label htmlFor="prefer_not_to_say" className="flex-1 cursor-pointer">Prefer not to say</Label>
                </div>
              </RadioGroup>

              {gender === "female" && (
                <div className="mt-6 p-4 bg-primary/10 rounded-md">
                  <h4 className="text-md font-medium mb-2">Female-specific features</h4>
                  <p className="text-sm mb-3">
                    As a female user, you'll have access to:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Menstrual cycle tracking</li>
                    <li>Hormone-based sleep recommendations</li>
                    <li>Period and ovulation predictions</li>
                    <li>Work-life balance tips for different cycle phases</li>
                  </ul>
                  <p className="text-sm mt-3">
                    You can set up these features in the settings page after completing this setup.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save and Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PersonalizationSetup;
