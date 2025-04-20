import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Heart } from "lucide-react";

const AccountTab = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("prefer_not_to_say");
  const [timezone, setTimezone] = useState<string>("america_new_york");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (user) {
      console.log("User data in AccountTab:", user);
      
      // Set the actual user data from the authentication
      setName(user.name || "");
      setEmail(user.email || "");
      setTimezone(user.timezone || "america_new_york");
      
      if (user.gender) {
        setGender(user.gender);
      }
      
      setIsLoading(false);
    }
  }, [user]);
  
  const handleGenderChange = (value: string) => {
    setGender(value);
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
  };
  
  const saveAccountChanges = () => {
    updateUserProfile({ 
      name,
      gender: gender as "male" | "female" | "other" | "prefer_not_to_say",
      timezone,
    });

    toast({
      title: "Account updated",
      description: "Your account settings have been saved.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-medium">Account Settings</h2>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            placeholder="Your name" 
            value={name}
            onChange={handleNameChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Your email" 
            value={email} 
            readOnly={user?.provider !== "email"}
            disabled={user?.provider !== "email"}
          />
          {user?.provider !== "email" && (
            <p className="text-sm text-muted-foreground">
              Your email is managed by your {user?.provider} account.
            </p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select defaultValue="america_new_york">
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="america_new_york">America/New York</SelectItem>
              <SelectItem value="america_los_angeles">America/Los Angeles</SelectItem>
              <SelectItem value="europe_london">Europe/London</SelectItem>
              <SelectItem value="asia_tokyo">Asia/Tokyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Gender Selection */}
        <div className="grid gap-2 pt-2">
          <Label>Gender</Label>
          <div className="bg-accent/20 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Personalization Settings</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This helps us provide gender-specific insights. Female users get access to cycle tracking features.
            </p>
            <RadioGroup value={gender} onValueChange={handleGenderChange}>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                <RadioGroupItem value="male" id="gender-male" />
                <Label htmlFor="gender-male" className="flex-1 cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                <RadioGroupItem value="female" id="gender-female" />
                <Label htmlFor="gender-female" className="flex-1 cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                <RadioGroupItem value="other" id="gender-other" />
                <Label htmlFor="gender-other" className="flex-1 cursor-pointer">Other</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                <RadioGroupItem value="prefer_not_to_say" id="gender-prefer-not" />
                <Label htmlFor="gender-prefer-not" className="flex-1 cursor-pointer">Prefer not to say</Label>
              </div>
            </RadioGroup>
            
            {gender === "female" && (
              <div className="mt-4 p-4 bg-primary/10 rounded-md">
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
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Button onClick={saveAccountChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default AccountTab;
