import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 max-w-4xl pt-24 pb-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the WorkTrack application, website, and services (collectively, the "Services"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              you may not access or use the Services.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Services</h2>
            <p>
              WorkTrack provides a platform that allows users to upload work schedules, sync them with calendar 
              applications, and receive shift reminders. We also offer additional features like schedule management, 
              insights, and personalization options.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              To use certain features of our Services, you must create an account. You agree to provide accurate, 
              current, and complete information during the registration process and to update such information 
              to keep it accurate, current, and complete.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding your password and for all activities that occur under your account. 
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">4. User Content</h2>
            <p>
              Our Services allow you to upload, store, and share content, including work schedules, preferences, 
              and other information ("User Content"). You retain ownership of your User Content, but you grant 
              us a license to use, store, and process it in connection with providing our Services.
            </p>
            <p className="mt-2">
              You represent and warrant that your User Content does not violate any third-party rights 
              and complies with all applicable laws and regulations.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">5. Subscription and Billing</h2>
            <p>
              Some of our Services require payment of fees. You agree to pay all fees as described in the Services. 
              Payment obligations are non-cancelable, and fees paid are non-refundable, except as expressly set 
              forth in these Terms or as required by applicable law.
            </p>
            <p className="mt-2">
              Subscription plans automatically renew until canceled. You may cancel your subscription at any time, 
              and your subscription will continue until the end of your billing period.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">6. Privacy</h2>
            <p>
              Our Privacy Policy describes how we handle the information you provide to us when you use our Services. 
              By using our Services, you agree to our collection, use, and sharing of information as described in our 
              Privacy Policy.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              Our Services and their contents, features, and functionality are owned by us or our licensors 
              and are protected by copyright, trademark, patent, and other intellectual property laws.
            </p>
            <p className="mt-2">
              You may not copy, modify, create derivative works, publicly display, perform, or distribute any portion 
              of our Services without our express written permission.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our Services at our discretion, without notice, 
              for any reason, including if you violate these Terms.
            </p>
            <p className="mt-2">
              You may terminate your account at any time by following the instructions in the Settings page. 
              Upon termination, you lose access to our Services, and we may delete your User Content.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, 
              EXPRESS OR IMPLIED. WE EXPLICITLY DISCLAIM ALL WARRANTIES, INCLUDING ANY WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING 
              OR USAGE OF TRADE.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL WE BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, 
              INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, 
              OR INABILITY TO USE, OUR SERVICES.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. If we do, we will let you know by posting the modified Terms 
              on this site and updating the "Last updated" date. By continuing to use our Services after we post 
              any modifications, you agree to be bound by the modified Terms.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br />
              <a href="mailto:terms@worktrack.example.com" className="text-primary">
                terms@worktrack.example.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
