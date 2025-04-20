
import { Brain } from "lucide-react";

const EmptyInsights = () => {
  return (
    <div className="text-center py-12 border rounded-xl bg-accent/10">
      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No insights yet</h3>
      <p className="text-muted-foreground">
        Upload your work schedule to receive personalized AI insights.
      </p>
    </div>
  );
};

export default EmptyInsights;
