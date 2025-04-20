
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type SubscriptionPlan = 'free' | 'premium';

interface SubscriptionStatus {
  isLoading: boolean;
  isVerifying: boolean;
  plan: SubscriptionPlan;
  isAnnual: boolean;
  renewalDate: string | null;
  isInTrial: boolean;
  trialEnd: string | null;
  status: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isLoading: true,
    isVerifying: false,
    plan: 'free',
    isAnnual: false,
    renewalDate: null,
    isInTrial: false,
    trialEnd: null,
    status: null
  });

  const verifySubscription = async () => {
    if (!user?.email) return;
    
    setStatus(prev => ({ ...prev, isVerifying: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        body: { email: user.email }
      });
      
      if (error) throw error;
      
      setStatus({
        isLoading: false,
        isVerifying: false,
        plan: data.plan,
        isAnnual: data.isAnnual,
        renewalDate: data.renewalDate || null,
        isInTrial: data.isInTrial || false,
        trialEnd: data.trialEnd || null,
        status: data.status || null
      });
    } catch (error) {
      console.error("Error verifying subscription:", error);
      toast({
        title: "Verification failed",
        description: "Could not verify your subscription status. Please try again later.",
        variant: "destructive",
      });
      setStatus(prev => ({ ...prev, isLoading: false, isVerifying: false }));
    }
  };

  const createCheckoutSession = async (isAnnual: boolean) => {
    if (!user?.email) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }
    
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Using placeholder price IDs - replace these with actual Stripe price IDs
      // Format: price_XXXXXXXXXXXXXXXXXXXX
      const priceId = isAnnual 
        ? "price_placeholder_annual" 
        : "price_placeholder_monthly";
      
      console.log(`Creating checkout session with priceId: ${priceId}, isAnnual: ${isAnnual}`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId, 
          isAnnual, 
          email: user.email 
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message)
          : "Could not initiate checkout. Please try again later.",
        variant: "destructive",
      });
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const startFreeTrial = async () => {
    // This would need to be implemented in the backend
    toast({
      title: "Free trial",
      description: "Free trial functionality coming soon!",
    });
  };

  useEffect(() => {
    if (user?.email) {
      verifySubscription();
    } else {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  return {
    ...status,
    verifySubscription,
    createCheckoutSession,
    startFreeTrial
  };
}
