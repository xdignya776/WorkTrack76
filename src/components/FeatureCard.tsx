
import { useRef } from "react";
import { useAnimateOnScroll } from "@/utils/animations";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useAnimateOnScroll(cardRef, "animate-fade-up");
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative p-6 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0",
        index % 2 === 0 ? "hover:border-primary/50" : "hover:border-primary/50"
      )}
      style={{ animationFillMode: "forwards", animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      
      {/* Subtle hover effect */}
      <div className="absolute inset-0 border border-primary/0 rounded-xl transition-all duration-300 group-hover:border-primary/20"></div>
    </div>
  );
};

export default FeatureCard;
