import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CalendarClock, Upload, LineChart, LayoutGrid, Calendar, BookText } from "lucide-react";

const Index = () => {
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <LandingHero />
      
      {/* Features section */}
      <section className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CalendarClock />}
              title="Automated Schedule Sync"
              description="Automatically sync your work schedule with your favorite calendar apps."
              index={0}
            />
            <FeatureCard
              icon={<LineChart />}
              title="Insightful Analytics"
              description="Gain valuable insights into your work patterns and earnings."
              index={2}
            />
            <FeatureCard
              icon={<LayoutGrid />}
              title="Customizable Views"
              description="Customize your schedule views to match your preferences."
              index={3}
            />
            <FeatureCard
              icon={<Calendar />}
              title="Shift Reminders"
              description="Receive timely reminders for upcoming shifts."
              index={4}
            />
            <FeatureCard
              icon={<BookText />}
              title="Detailed Reporting"
              description="Generate detailed reports on your work hours and earnings."
              index={5}
            />
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Your Schedule</h3>
              <p className="text-muted-foreground">Easily create your work schedule.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <CalendarClock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sync with Calendar</h3>
              <p className="text-muted-foreground">Automatically sync your schedule with Google Calendar, Outlook, and more.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <LineChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
              <p className="text-muted-foreground">Gain valuable insights into your work patterns and earnings.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8">Take control of your work schedule and gain valuable insights.</p>
          <Button asChild size="lg" className="px-8 shadow-md hover:shadow-lg transition-all">
            <Link to="/sign-up">Sign Up for Free</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
