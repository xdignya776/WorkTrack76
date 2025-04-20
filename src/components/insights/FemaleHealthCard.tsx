
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Heart, Moon } from "lucide-react";

const FemaleHealthCard = () => {
  return (
    <div className="mb-6">
      <Card className="overflow-hidden border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Heart className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Female Health Insights</CardTitle>
            </div>
            <Badge className="bg-primary">New</Badge>
          </div>
          <CardDescription>
            Personalized insights based on your menstrual cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Your insights are now personalized based on your cycle, helping you optimize your work schedule according to your natural hormonal patterns.
          </p>
          <div className="flex justify-between items-center bg-background/80 p-3 rounded-md text-sm">
            <div className="flex items-center">
              <Moon className="h-4 w-4 mr-2 text-primary" />
              <span>Cycle tracking is available in Settings</span>
            </div>
            <Badge variant="outline" className="ml-2">Coming soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FemaleHealthCard;
