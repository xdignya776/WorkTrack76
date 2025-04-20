
import React from "react";
import { RefreshCw, Plus, Check } from "lucide-react";

export const GoogleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-red-500"
  >
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    <path d="M17.5 12h-11" />
    <path d="M12 6.5v11" />
  </svg>
);

export const AppleLogoIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 20.94c1.5 0 2.75-.67 3.95-1.34 1.25.7 2.3 1.3 3.95 1.3.5 0 .75-.03 1.1-.1v-8.2c-.35-.07-.6-.1-1.1-.1-1.65 0-2.7-.6-3.95-1.3C14.75 5.43 13.5 4.76 12 4.76s-2.75.67-3.95 1.34c-1.25.7-2.3 1.3-3.95 1.3-.5 0-.75-.03-1.1-.1v.82c.35.07.6.1 1.1.1 1.65 0 2.7.6 3.95 1.3 1.2.67 2.45 1.34 3.95 1.34" />
  </svg>
);

export const RefreshIcon = ({ className = "" }: {className?: string}) => (
  <RefreshCw className={`${className} animate-spin`} />
);

export const PlusIcon = ({ className = "" }: {className?: string}) => (
  <Plus className={className} />
);

export const CheckIcon = ({ className = "" }: {className?: string}) => (
  <Check className={className} />
);
