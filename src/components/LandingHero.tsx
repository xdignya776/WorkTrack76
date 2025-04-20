
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, CalendarSync, Settings } from "lucide-react";

const LandingHero = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Simplify Your Work Schedule
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            Effortlessly Track Your<br />Work Schedule
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Create your schedule, sync with your calendar, and never miss a shift again. The simplest way to manage your work hours.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <Button size="lg" className="px-8 shadow-md hover:shadow-lg transition-all" onClick={() => navigate('/Schedule')}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
          
          <div className="relative w-full max-w-3xl aspect-[16/9] rounded-xl overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <div className="absolute inset-0 glass-morph rounded-xl"></div>
            <div className="absolute inset-0 p-8 flex items-center justify-center">
              <div className="w-full max-w-xl bg-background rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs font-medium">WorkTrack</div>
                  <div className="w-8"></div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  <FeaturePreview 
                    icon={<Calendar className="h-8 w-8 text-primary" />}
                    title="Calendar View"
                    delay={1.2}
                  />
                  <FeaturePreview 
                    icon={<CalendarSync className="h-8 w-8 text-primary" />}
                    title="Schedule Sync"
                    delay={1.4}
                  />
                  <FeaturePreview 
                    icon={<Settings className="h-8 w-8 text-primary" />}
                    title="Customization"
                    delay={1.6}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturePreview = ({ 
  icon, 
  title, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  delay: number;
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/50 opacity-0 animate-fade-in" 
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      {icon}
      <span className="mt-2 text-sm font-medium">{title}</span>
    </div>
  );
};

export default LandingHero;
