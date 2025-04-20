
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertCircle } from "lucide-react";

interface ConflictsTabProps {
  syncConflictMode: string;
  setSyncConflictMode: (value: string) => void;
}

const ConflictsTab: React.FC<ConflictsTabProps> = ({
  syncConflictMode,
  setSyncConflictMode
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-medium">
          <AlertCircle className="mr-2 h-4 w-4 text-primary" />
          Conflict Handling
        </CardTitle>
        <CardDescription>
          Manage how schedule conflicts are handled during syncing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>When conflicts are detected:</Label>
          <ToggleGroup 
            type="single" 
            variant="outline"
            value={syncConflictMode}
            onValueChange={(value) => {
              if (value) setSyncConflictMode(value);
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="ask" className="flex-1">Ask me</ToggleGroupItem>
            <ToggleGroupItem value="overwrite" className="flex-1">Overwrite</ToggleGroupItem>
            <ToggleGroupItem value="skip" className="flex-1">Skip</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Detect Schedule Overlaps</h3>
            <p className="text-sm text-muted-foreground">Alert when work shifts overlap</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Detect Calendar Conflicts</h3>
            <p className="text-sm text-muted-foreground">Alert when shifts conflict with existing events</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConflictsTab;
