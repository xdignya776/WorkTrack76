
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Missing required parameter: email");
    }
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          plan: "free",
          isAnnual: false,
          renewalDate: null,
          trialEnd: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 10
    });
    
    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          plan: "free",
          isAnnual: false,
          renewalDate: null,
          trialEnd: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Get the subscription with metadata
    const subscription = subscriptions.data[0];
    const isAnnual = subscription.metadata?.isAnnual === 'true';
    
    // Get renewal date and trial info
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const isInTrial = subscription.status === 'trialing';
    
    return new Response(
      JSON.stringify({ 
        subscribed: true,
        plan: "premium",
        isAnnual: isAnnual,
        renewalDate: currentPeriodEnd.toISOString().split('T')[0],
        trialEnd: trialEnd ? trialEnd.toISOString().split('T')[0] : null,
        isInTrial: isInTrial,
        status: subscription.status
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
