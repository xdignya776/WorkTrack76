
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTab from "@/components/settings/AccountTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import CalendarTab from "@/components/settings/CalendarTab";
import PrivacyTab from "@/components/settings/PrivacyTab";
import SubscriptionTab from "@/components/settings/SubscriptionTab";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'account';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(params => {
      // Keep other params but update the tab
      params.set('tab', value);
      return params;
    });
  };

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['account', 'notifications', 'calendar', 'privacy', 'subscription' ] .includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-6 max-w-7xl pt-20">
        <div className="pb-4 mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and app settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b">
            <div className="overflow-auto pb-px">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="account"
                  className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent font-medium data-[state=active]:border-b-foreground"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent font-medium data-[state=active]:border-b-foreground"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent font-medium data-[state=active]:border-b-foreground"
                >
                  Calendar
                </TabsTrigger>
                <TabsTrigger
                  value="subscription"
                  className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent font-medium data-[state=active]:border-b-foreground"
                >
                  Subscription
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent font-medium data-[state=active]:border-b-foreground"
                >
                  Privacy
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="account" className="mt-0 p-0 pt-4">
            <AccountTab />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0 p-0 pt-4">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="calendar" className="mt-0 p-0 pt-4">
            <CalendarTab />
          </TabsContent>
          <TabsContent value="privacy" className="mt-0 p-0 pt-4">
            <PrivacyTab />
          </TabsContent>
          <TabsContent value="subscription" className="mt-0 p-0 pt-4">
            <SubscriptionTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;
