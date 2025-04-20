
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface AppearanceTabProps {
  showColorOptions: boolean;
  setShowColorOptions: (value: boolean) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
  showColorOptions,
  setShowColorOptions
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Event Appearance</CardTitle>
        <CardDescription>
          Customize how your work shifts appear in your calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="event-prefix">Event Title Format</Label>
          <Input 
            id="event-prefix" 
            defaultValue="Work Shift: "
            placeholder="E.g., Work Shift: "
          />
          <p className="text-xs text-muted-foreground">
            This text will appear before your shift details in calendar events
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Use Shift Colors</h3>
            <p className="text-sm text-muted-foreground">Color-code shifts in your calendar</p>
          </div>
          <Switch 
            defaultChecked 
            onCheckedChange={setShowColorOptions}
          />
        </div>
        
        {showColorOptions && (
          <div className="border rounded-md p-3 space-y-3">
            <div className="grid gap-2">
              <Label>Morning Shift Color</Label>
              <div className="flex space-x-2">
                <Button className="bg-blue-500 hover:bg-blue-600" size="sm"><Check className="h-3 w-3" /></Button>
                <Button className="bg-green-500 hover:bg-green-600" size="sm"></Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600" size="sm"></Button>
                <Button className="bg-red-500 hover:bg-red-600" size="sm"></Button>
                <Button className="bg-purple-500 hover:bg-purple-600" size="sm"></Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Afternoon Shift Color</Label>
              <div className="flex space-x-2">
                <Button className="bg-blue-500 hover:bg-blue-600" size="sm"></Button>
                <Button className="bg-green-500 hover:bg-green-600" size="sm"></Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600" size="sm"><Check className="h-3 w-3" /></Button>
                <Button className="bg-red-500 hover:bg-red-600" size="sm"></Button>
                <Button className="bg-purple-500 hover:bg-purple-600" size="sm"></Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Night Shift Color</Label>
              <div className="flex space-x-2">
                <Button className="bg-blue-500 hover:bg-blue-600" size="sm"></Button>
                <Button className="bg-green-500 hover:bg-green-600" size="sm"></Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600" size="sm"></Button>
                <Button className="bg-red-500 hover:bg-red-600" size="sm"></Button>
                <Button className="bg-purple-500 hover:bg-purple-600" size="sm"><Check className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Include Location</h3>
            <p className="text-sm text-muted-foreground">Add work location to calendar events</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceTab;
