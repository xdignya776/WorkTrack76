
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, Lock, FileText, Download, InfoIcon, Shield } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const PrivacyTab = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    // Simulate data export
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    }, 1500);
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    // This would trigger the account deletion flow
    setTimeout(() => {
      setIsDeletingAccount(false);
      toast({
        title: "Account deletion initiated",
        description: "We've sent a confirmation email. Please check your inbox.",
        variant: "destructive"
      });
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-medium">Privacy Settings</h2>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-medium">
            <Lock className="mr-2 h-4 w-4 text-primary" />
            Data Protection
          </CardTitle>
          <CardDescription>
            Control how your data is collected, stored, and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Data Collection</h3>
              <p className="text-sm text-muted-foreground">Allow anonymous usage data collection</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Location Services</h3>
              <p className="text-sm text-muted-foreground">Enable location-based features</p>
            </div>
            <Switch />
          </div>
          
          <Alert className="mt-4 bg-primary/5 border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
            <AlertTitle>Enhanced Security Features</AlertTitle>
            <AlertDescription className="text-sm">
              The following security features are always enabled for your protection:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Schedule storage for future reference</li>
                <li>Limited calendar access (only for work events)</li>
                <li>Schedule data encryption at rest</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-medium">
            <FileText className="mr-2 h-4 w-4 text-primary" />
            Privacy Documents
          </CardTitle>
          <CardDescription>
            Review our privacy policy and terms of service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="justify-center" asChild>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" className="justify-center" asChild>
              <Link to="/terms-of-service">Terms of Service</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="pt-4 mt-6 border-t space-y-4">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Export Your Data</DrawerTitle>
              <DrawerDescription>
                You can download all of your WorkTrack data, including schedules, preferences, and account information.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-format">Export Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-center">JSON</Button>
                  <Button variant="outline" className="justify-center">CSV</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="export-schedules" defaultChecked />
                    <Label htmlFor="export-schedules">Work Schedules</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="export-settings" defaultChecked />
                    <Label htmlFor="export-settings">Settings & Preferences</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="export-account" defaultChecked />
                    <Label htmlFor="export-account">Account Information</Label>
                  </div>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleExportData} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="destructive" className="w-full justify-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Delete Your Account</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="rounded-md bg-destructive/10 p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Warning</h4>
                    <p className="text-sm text-destructive/90 mt-1">
                      Deleting your account will:
                    </p>
                    <ul className="list-disc pl-5 mt-1 text-sm text-destructive/90 space-y-1">
                      <li>Remove all your saved schedules</li>
                      <li>Disconnect calendar integrations</li>
                      <li>Cancel any active subscriptions</li>
                      <li>Delete your profile information</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Type "DELETE" to confirm</Label>
                <input
                  id="delete-confirm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="DELETE"
                />
              </div>
            </div>
            <DrawerFooter>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                {isDeletingAccount ? "Processing..." : "Permanently Delete Account"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default PrivacyTab;
