import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="my-8">
            <h2 className="flex items-center text-xl font-semibold mb-4">
              <Lock className="mr-2 h-5 w-5 text-primary" /> 
              Your Privacy Matters
            </h2>
            <p>
              At WorkTrack, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our service. Please read this policy carefully.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-lg font-medium mt-4">Personal Information</h3>
            <p>
              When you create an account, we collect information such as your name, email address, 
              and profile information. This information is used to provide you with our services 
              and improve your experience on our platform.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Work Schedule Information</h3>
            <p>
              When you upload your work schedule, we collect and process the schedule data to provide 
              our core services. This includes shift times, work locations, and any other information 
              included in your schedule.
            </p>
            
            <h3 className="text-lg font-medium mt-4">Usage Information</h3>
            <p>
              We collect information about how you interact with our service, including your device 
              information, IP address, browser type, and actions you take on our platform.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and store your work schedules</li>
              <li>Sync your schedule with your preferred calendar applications</li>
              <li>Send notifications and reminders about your shifts</li>
              <li>Generate insights about your work patterns</li>
              <li>Communicate with you about service updates and new features</li>
            </ul>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect 
              your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Schedule data encryption at rest</li>
              <li>Secure schedule storage systems</li>
              <li>Limited calendar access (only for work events)</li>
              <li>Regular security assessments and updates</li>
            </ul>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
            <p>
              We may use third-party services to help us operate our service or administer activities 
              on our behalf, such as sending newsletters or analyzing how our service is used. 
              These third parties may have access to your personal information only to perform these 
              tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              You can access and update most of your information through your account settings. 
              If you wish to delete your account, you can do so in the Privacy section of the Settings page.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p className="mt-2">
              We recommend that you review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <section className="my-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@worktrack.example.com" className="text-primary">
                privacy@worktrack.example.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
