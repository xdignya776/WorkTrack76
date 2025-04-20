
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
    const { priceId, isAnnual, email } = await req.json();
    
    if (!priceId || !email) {
      throw new Error("Missing required parameters: priceId and email are required");
    }

    console.log(`Received request with priceId: ${priceId}, isAnnual: ${isAnnual}, email: ${email}`);
    
    // Check for placeholder price IDs - in production, these would be replaced with actual IDs
    if (priceId === "price_placeholder_annual" || priceId === "price_placeholder_monthly") {
      // Return a mock checkout URL for development/testing
      return new Response(
        JSON.stringify({
          url: "/settings?tab=subscription&status=demo-mode",
          message: "Using placeholder price IDs. In production, replace with actual Stripe price IDs."
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Check if customer already has an active subscription for this price
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        price: priceId,
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: "You already have an active subscription to this plan" 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }
    }
    
    // Set up success and cancel URLs to include origin
    const origin = req.headers.get('origin') || 'https://worktrack-app.netlify.app';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/settings?tab=subscription&status=success`,
      cancel_url: `${origin}/settings?tab=subscription&status=canceled`,
      metadata: {
        isAnnual: isAnnual ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          isAnnual: isAnnual ? 'true' : 'false',
        },
      },
      allow_promotion_codes: true,
    });
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
