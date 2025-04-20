
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const SubscriptionHelp = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-6 pt-20 max-w-3xl">
        <div className="mb-6">
          <Link to="/settings?tab=subscription">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscription
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Subscription FAQ</h1>
          <p className="text-muted-foreground mt-2">Answers to common questions about WorkTrack Premium</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="billing-cycle">
            <AccordionTrigger>What billing cycles are available?</AccordionTrigger>
            <AccordionContent>
              WorkTrack offers both monthly and annual billing options. The annual plan provides a 17% discount compared to paying monthly.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment-methods">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent>
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) and some debit cards. We do not currently support PayPal or cryptocurrency payments.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel">
            <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
            <AccordionContent>
              You can cancel your subscription at any time from your account settings. Go to Settings → Subscription and click on "Cancel Subscription". Your premium features will remain active until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="refunds">
            <AccordionTrigger>What is your refund policy?</AccordionTrigger>
            <AccordionContent>
              If you're not satisfied with your premium subscription, you can request a refund within the first 7 days of your subscription. Contact our support team at support@worktrack-app.com with your account details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="trial">
            <AccordionTrigger>How does the free trial work?</AccordionTrigger>
            <AccordionContent>
              Our free trial gives you full access to all premium features for 7 days. No credit card is required to start the trial. You'll receive a notification before the trial ends so you can decide if you want to subscribe.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="change-plan">
            <AccordionTrigger>Can I switch between monthly and annual billing?</AccordionTrigger>
            <AccordionContent>
              Yes, you can switch between monthly and annual billing when your current subscription period ends. Go to Settings → Subscription and select your preferred billing cycle before renewal.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="enterprise">
            <AccordionTrigger>Do you offer team or enterprise plans?</AccordionTrigger>
            <AccordionContent>
              Yes, we offer special pricing for teams and enterprises. Please contact our sales team at sales@worktrack-app.com for more information and custom quotes.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 p-4 bg-primary/5 rounded-md">
          <h3 className="font-medium text-lg">Need more help?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            If you have questions that aren't answered here, please contact our support team at support@worktrack-app.com or use the in-app chat support.
          </p>
        </div>
      </div>
    </>
  );
};

export default SubscriptionHelp;
