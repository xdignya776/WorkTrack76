
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { CreditCard, AlertCircle, Clock, Zap, BarChart4, HeadphonesIcon, Shield as ShieldIcon, Calendar, Upload, Bell, Loader2, CheckCircle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import PlanComparisonCard from "./PlanComparisonCard";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SubscriptionTab = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  
  const [uploadCount, setUploadCount] = useState(0);
  const [isAnnualSelected, setIsAnnualSelected] = useState(false);
  
  const { 
    isLoading, 
    isVerifying, 
    plan, 
    isAnnual, 
    renewalDate,
    isInTrial,
    trialEnd,
    verifySubscription,
    createCheckoutSession,
    startFreeTrial
  } = useSubscription();
  
  useEffect(() => {
    if (status === 'success') {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated. Enjoy premium features!",
      });
      verifySubscription();
    } else if (status === 'canceled') {
      toast({
        title: "Payment canceled",
        description: "Your payment was not completed. You can try again when ready.",
        variant: "destructive",
      });
    } else if (status === 'demo-mode') {
      toast({
        title: "Demo Mode",
        description: "Using placeholder price IDs. In production, replace with actual Stripe price IDs.",
      });
    }
  }, [status]);
  
  useEffect(() => {
    const count = parseInt(localStorage.getItem('worktrack_upload_count') || '0');
    setUploadCount(count);
  }, []);
  
  useEffect(() => {
    // Set the selected billing cycle to match the current subscription
    setIsAnnualSelected(isAnnual);
  }, [isAnnual]);

  const handleUpgrade = async () => {
    await createCheckoutSession(isAnnualSelected);
  };

  const handleDowngrade = async () => {
    toast({
      title: "Downgrade initiated",
      description: "Your plan will change to Free at the end of your billing period.",
    });
  };

  const handleStartTrial = async () => {
    await startFreeTrial();
  };

  const freeFeatures = [
    { 
      name: "Single calendar sync (Google OR Apple)", 
      included: true,
      icon: <Calendar className="h-4 w-4 mr-1 inline text-primary" />
    },
    { 
      name: "Basic shift reminders", 
      included: true,
      icon: <Bell className="h-4 w-4 mr-1 inline text-primary" />,
      description: "1 default reminder"
    },
    { 
      name: "Manual time tracking", 
      included: true,
      icon: <Clock className="h-4 w-4 mr-1 inline text-primary" />
    },
    { 
      name: "3 schedule uploads/month", 
      included: true,
      icon: <Upload className="h-4 w-4 mr-1 inline text-primary" />,
      highlight: uploadCount >= 3
    },
    { 
      name: "Community support", 
      included: true,
      icon: <HeadphonesIcon className="h-4 w-4 mr-1 inline text-primary" />,
      description: "72h response time"
    },
    { 
      name: "Contains ads for relevant work products", 
      included: true,
      description: "Subtle banners"
    },
  ];

  const premiumFeatures = [
    { 
      name: "Unlimited calendar syncs", 
      included: true, 
      icon: <Calendar className="h-4 w-4 mr-1 inline text-primary" />,
      description: "Google + Apple + Outlook",
      highlight: true
    },
    { 
      name: "Smart Reminders", 
      included: true, 
      icon: <Bell className="h-4 w-4 mr-1 inline text-primary" />,
      description: "Custom pre-shift times & traffic alerts",
      highlight: true
    },
    { 
      name: "Auto-Time Tracking", 
      included: true, 
      icon: <Clock className="h-4 w-4 mr-1 inline text-primary" />,
      description: "Including overtime alerts",
      highlight: true
    },
    { 
      name: "Unlimited uploads + Priority OCR", 
      included: true, 
      icon: <Upload className="h-4 w-4 mr-1 inline text-primary" />,
      description: "Handles messy schedules better",
      highlight: true
    },
    { 
      name: "Work Analytics", 
      included: true, 
      icon: <BarChart4 className="h-4 w-4 mr-1 inline text-primary" />,
      description: "Earnings projections & insights",
      highlight: true
    },
    { 
      name: "Ad-free experience", 
      included: true, 
      icon: <ShieldIcon className="h-4 w-4 mr-1 inline text-primary" />,
      highlight: true
    },
  ];

  if (isVerifying) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying subscription status...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-medium">Subscription Settings</h2>
        {uploadCount >= 3 && plan === "free" && (
          <Badge variant="destructive" className="mt-2 sm:mt-0">
            3/3 uploads used this month
          </Badge>
        )}
      </div>
      
      {status === 'demo-mode' && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            Using placeholder price IDs. In a production environment, you would need to replace these with actual Stripe price IDs.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-primary/5 rounded-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              Current Plan: {plan === "premium" ? "Premium" : "Free"}
              {isInTrial && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">Trial</Badge>}
            </h3>
            {plan === "premium" && renewalDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Your {isAnnual ? 'annual' : 'monthly'} subscription {isInTrial ? 'starts' : 'renews'} on {isInTrial && trialEnd ? trialEnd : renewalDate}
              </p>
            )}
          </div>
          {plan === "premium" && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </Badge>
          )}
        </div>
      </div>

      {isInTrial && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTitle className="flex items-center text-amber-800">
            <Clock className="h-4 w-4 mr-2" /> Trial Period Active
          </AlertTitle>
          <AlertDescription>
            You're currently in your free trial period which ends on {trialEnd}. Enjoy all premium features!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center mb-6">
        <div className="bg-accent/50 p-1 rounded-full flex items-center">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!isAnnualSelected ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            onClick={() => setIsAnnualSelected(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isAnnualSelected ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
            onClick={() => setIsAnnualSelected(true)}
          >
            Annual (17% savings)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PlanComparisonCard
          title="Free Plan"
          description="Basic Schedule Management"
          price="$0"
          priceDescription="/month"
          features={freeFeatures}
          isCurrent={plan === "free"}
          buttonText="Downgrade"
          onButtonClick={handleDowngrade}
        />

        <PlanComparisonCard
          title="Premium Plan"
          description="Pro Schedule Automation"
          price={isAnnualSelected ? "$9.99" : "$0.99"}
          priceDescription={isAnnualSelected ? "/year" : "/month"}
          features={premiumFeatures}
          isCurrent={plan === "premium" && !isInTrial}
          isRecommended={true}
          buttonText={`Upgrade ${isAnnualSelected ? 'Yearly' : 'Monthly'}`}
          onButtonClick={handleUpgrade}
          isProcessing={isLoading}
          isTrialing={isInTrial}
        />
      </div>

      {plan === "free" && (
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-md p-4 text-center">
          <h3 className="font-medium mb-1">Try Premium Features FREE</h3>
          <p className="text-sm mb-3">Experience all premium features for your next 5 shifts</p>
          <Button variant="outline" className="bg-white dark:bg-slate-900" onClick={handleStartTrial}>Start Free Trial</Button>
        </div>
      )}

      <div className="bg-muted/50 rounded-md p-4 text-center text-muted-foreground text-sm">
        <p>87% of premium users say they're never late for shifts</p>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        
        {plan === "premium" ? (
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-muted p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">No payment method on file</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll need to add a payment method when upgrading to Premium.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <Button variant="outline">Billing History</Button>
          <Button variant="outline">Update Payment Method</Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTab;
