
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Bell, Clock, Calendar, RefreshCw, Mail, Smartphone, MessageSquare } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const NotificationsTab = () => {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const handleSaveChanges = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-medium">Notification Settings</h2>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-medium">
            <Smartphone className="mr-2 h-4 w-4 text-primary" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you'd like to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive text messages for important alerts</p>
              </div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="shifts">Shift Alerts</TabsTrigger>
          <TabsTrigger value="updates">Schedule Updates</TabsTrigger>
          <TabsTrigger value="system">System Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shifts">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base font-medium">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                Shift Reminders
              </CardTitle>
              <CardDescription>
                Configure notifications for your upcoming shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Shift Reminders</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications before your shift starts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-2 pt-2">
                <Label htmlFor="reminder-time">First Reminder Time</Label>
                <Select defaultValue="60_min">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15_min">15 minutes before</SelectItem>
                    <SelectItem value="30_min">30 minutes before</SelectItem>
                    <SelectItem value="60_min">1 hour before</SelectItem>
                    <SelectItem value="120_min">2 hours before</SelectItem>
                    <SelectItem value="day_before">Day before (9 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="additional-reminder">Additional Reminder</Label>
                  <Switch id="additional-reminder" defaultChecked />
                </div>
                <Select defaultValue="15_min">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_min">5 minutes before</SelectItem>
                    <SelectItem value="10_min">10 minutes before</SelectItem>
                    <SelectItem value="15_min">15 minutes before</SelectItem>
                    <SelectItem value="30_min">30 minutes before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <h3 className="font-medium">End of Shift Notification</h3>
                  <p className="text-sm text-muted-foreground">Receive notification when your shift is ending</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base font-medium">
                <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                Schedule Updates
              </CardTitle>
              <CardDescription>
                Manage notifications for changes to your work schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Schedule Updates</h3>
                  <p className="text-sm text-muted-foreground">Notifications when your schedule changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="border rounded-md p-3 space-y-3">
                <Label className="font-medium">Notify me about:</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-shifts" className="flex-1 text-sm font-normal">New shifts added</Label>
                    <Switch id="new-shifts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="changed-shifts" className="flex-1 text-sm font-normal">Time changes to existing shifts</Label>
                    <Switch id="changed-shifts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="removed-shifts" className="flex-1 text-sm font-normal">Canceled/removed shifts</Label>
                    <Switch id="removed-shifts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location-changes" className="flex-1 text-sm font-normal">Location changes</Label>
                    <Switch id="location-changes" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 pt-2">
                <Label>Update Notification Priority</Label>
                <RadioGroup defaultValue="high">
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                    <RadioGroupItem value="high" id="priority-high" />
                    <Label htmlFor="priority-high" className="flex-1 cursor-pointer">High (all channels)</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                    <RadioGroupItem value="medium" id="priority-medium" />
                    <Label htmlFor="priority-medium" className="flex-1 cursor-pointer">Medium (push and email)</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                    <RadioGroupItem value="low" id="priority-low" />
                    <Label htmlFor="priority-low" className="flex-1 cursor-pointer">Low (push only)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">System Notifications</CardTitle>
              <CardDescription>
                Control notifications about app updates and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">App Updates</h3>
                  <p className="text-sm text-muted-foreground">Notifications about new app features</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Tips & Tricks</h3>
                  <p className="text-sm text-muted-foreground">Helpful tips to get the most out of WorkTrack</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Subscription Updates</h3>
                  <p className="text-sm text-muted-foreground">Notifications about your subscription status</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default NotificationsTab;
