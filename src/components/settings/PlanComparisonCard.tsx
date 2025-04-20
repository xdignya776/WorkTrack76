
import { Check, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface PlanComparisonCardProps {
  title: string;
  description: string;
  price: string;
  priceDescription: string;
  features: PlanFeature[];
  isCurrent: boolean;
  isRecommended?: boolean;
  buttonText: string;
  onButtonClick: () => void;
  isProcessing?: boolean;
  isTrialing?: boolean;
}

const PlanComparisonCard = ({
  title,
  description,
  price,
  priceDescription,
  features,
  isCurrent,
  isRecommended = false,
  buttonText,
  onButtonClick,
  isProcessing = false,
  isTrialing = false
}: PlanComparisonCardProps) => {
  return (
    <Card className={`${isCurrent ? "border-2 border-primary" : ""} 
                     ${isTrialing ? "border-2 border-amber-400" : ""}
                     ${isRecommended ? "shadow-lg" : ""}
                     transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <div className="mt-2 text-xl font-bold">
              {price}
              <span className="text-sm font-normal text-muted-foreground"> {priceDescription}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {isRecommended && (
              <Badge className="bg-primary/20 text-primary border-primary/20">
                Recommended
              </Badge>
            )}
            {isCurrent && !isTrialing && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                Current Plan
              </Badge>
            )}
            {isTrialing && (
              <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50">
                Trial Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-start ${feature.highlight ? 'bg-primary/10 p-2 rounded-md' : ''}`}
            >
              {feature.included ? (
                <Check className={`h-4 w-4 mr-2 mt-1 ${feature.highlight ? 'text-primary' : 'text-primary'}`} />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${feature.highlight ? 'font-medium' : ''}`}>
                  {feature.icon && <span className="mr-1">{feature.icon}</span>}
                  {feature.name}
                </p>
                {feature.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                )}
              </div>
              {feature.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">{feature.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent || isTrialing ? "outline" : isRecommended ? "default" : "outline"}
          onClick={onButtonClick}
          disabled={(isCurrent && !isTrialing) || isProcessing}
        >
          {isProcessing ? "Processing..." : (isCurrent && !isTrialing) ? "Current Plan" : isTrialing ? "Active Trial" : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanComparisonCard;
