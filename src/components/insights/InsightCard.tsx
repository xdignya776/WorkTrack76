
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Insight, getPriorityColor, getTypeIcon, formatDate } from "@/utils/insightUtils";
import { Bell, Calendar, Share2, BookmarkPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ShiftReminders from "@/components/shifts/ShiftReminders";

interface InsightCardProps {
  insight: Insight;
}

const InsightCard = ({ insight }: InsightCardProps) => {
  const { user } = useAuth();
  const IconComponent = getTypeIcon(insight.type);
  const [showReminder, setShowReminder] = useState(false);
  
  const handleSaveInsight = () => {
    // In a future implementation, this could save to a "saved insights" collection
    toast({
      title: "Insight Saved",
      description: "This insight has been saved to your collection."
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.description,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support the share functionality."
      });
    }
  };
  
  return (
    <Card className={`overflow-hidden border border-border hover:shadow-md transition-shadow ${insight.genderSpecific ? 'border-l-4 border-l-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <IconComponent className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge className={`${getPriorityColor(insight.priority)} text-white`}>
            {insight.priority}
          </Badge>
        </div>
        <CardDescription>
          {formatDate(insight.date)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => setShowReminder(!showReminder)}
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            Remind
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={handleSaveInsight}
          >
            <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
        </div>
      </CardFooter>
      
      {showReminder && user?.id && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Set a reminder for this insight</h4>
            <ShiftReminders 
              shiftId={insight.id.toString()}
              shiftTitle={insight.title}
              shiftDate={new Date(insight.date)}
              shiftTime="09:00" // Default time for insights
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default InsightCard;
