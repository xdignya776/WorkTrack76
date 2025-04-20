
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Smartphone, Settings, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const MobileApp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                Mobile App
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Download WorkTrack Mobile
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take WorkTrack with you and never miss a shift, even when you're on the go.
              </p>
            </div>
            
            <Card className="p-6 mb-8">
              <div className="flex flex-col items-center">
                <Smartphone className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Download WorkTrack for Android</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Get the native Android experience with our dedicated app
                </p>
                
                <Button 
                  size="lg" 
                  className="mb-4"
                  asChild
                >
                  <a 
                    href="../public/download/WorkTrack76.apk" 
                    download="WorkTrack76.apk"
                    className="flex items-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download APK (v1.0.0)
                  </a>
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Requirements:</span> Android 9.0+ required
                </div>
              </div>
            </Card>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Installation Guide</h3>
              
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">1</span>
                    Download the APK
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tap the "Download APK" button above to download the WorkTrack application to your device.
                  </p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">2</span>
                    Enable Unknown Sources
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Go to <span className="font-medium">Settings &gt; Security</span> and enable <span className="font-medium">"Unknown Sources"</span> or <span className="font-medium">"Install unknown apps"</span> for your browser.
                  </p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">3</span>
                    Install the App
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Open your Downloads folder, tap the APK file, and follow the on-screen instructions to install.
                  </p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">4</span>
                    Sign In and Enjoy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Open WorkTrack, sign in with your account, and enjoy all features on your mobile device.
                  </p>
                </Card>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Security Notice</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    This app is not available from the Google Play Store. Only download from our official website to ensure you're getting a secure version.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Subscription Information</h3>
              <p className="text-muted-foreground">
                Access premium features in the mobile app using the same account you use on the web:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Premium Features</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Unlock unlimited uploads, smart reminders, and ad-free experience on mobile.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start">
                    <Settings className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Manage Subscription</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upgrade or manage your plan in the app's settings section after installation.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="text-center mt-6">
                <Link to="/settings" className="text-primary hover:underline">
                  View subscription options
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileApp;
