
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Insight } from "@/utils/insightUtils";
import { 
  generateInsightsFromSchedule, 
  saveInsightsToStorage, 
  getInsightsFromStorage,
  getScheduleFromStorage
} from "@/utils/insightGenerator";

interface UseInsightsProps {
  userId?: string;
  gender?: string;
}

export const useInsights = ({ userId, gender }: UseInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightStats, setInsightStats] = useState<any>({
    types: [],
    priority: [],
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load insights on initial load
  const loadInsights = async () => {
    setLoading(true);
    console.log("Loading insights for user:", userId);
    
    if (!userId) {
      console.error("Cannot load insights: No user ID available");
      setLoading(false);
      return;
    }
    
    try {
      // Get existing insights from database using user ID
      let existingInsights = await getInsightsFromStorage(userId);
      
      // If no insights exist, generate them from schedule
      if (existingInsights.length === 0) {
        console.log("No existing insights found, generating from schedule");
        const schedule = await getScheduleFromStorage(userId);
        existingInsights = await generateInsightsFromSchedule(schedule, gender, userId);
        await saveInsightsToStorage(existingInsights, userId);
      }
      
      // Filter insights based on gender if specified
      const filteredInsights = existingInsights.filter(insight => {
        // If gender specific insight and user gender doesn't match, exclude it
        if (insight.genderSpecific && gender !== 'female') {
          return false;
        }
        return true;
      });
      
      setInsights(filteredInsights);
      generateInsightStats(filteredInsights);
      
      if (existingInsights.length > 0 && filteredInsights.length < existingInsights.length) {
        console.log(`Filtered ${existingInsights.length - filteredInsights.length} gender-specific insights`);
      }
    } catch (error) {
      console.error("Error loading insights:", error);
      toast({
        title: "Error",
        description: "Failed to load insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate statistics for insights
  const generateInsightStats = (insights: Insight[]) => {
    // Calculate type distribution
    const typeCount: Record<string, number> = {};
    insights.forEach(insight => {
      typeCount[insight.type] = (typeCount[insight.type] || 0) + 1;
    });
    
    const typeData = Object.keys(typeCount).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: typeCount[type]
    }));

    // Calculate priority distribution
    const priorityCount: Record<string, number> = {};
    insights.forEach(insight => {
      priorityCount[insight.priority] = (priorityCount[insight.priority] || 0) + 1;
    });
    
    const priorityData = Object.keys(priorityCount).map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: priorityCount[priority]
    }));

    // Calculate insights over time (last 7 days)
    const timelineData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const count = insights.filter(insight => {
        const insightDate = new Date(insight.date);
        return insightDate >= date && insightDate < nextDay;
      }).length;
      
      timelineData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: count
      });
    }

    setInsightStats({
      types: typeData,
      priority: priorityData,
      timeline: timelineData
    });
  };

  // Refresh insights
  const refreshInsights = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to refresh insights.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Get latest schedule data
      const schedule = await getScheduleFromStorage(userId);
      console.log(`Refreshing insights based on ${schedule.length} schedule entries`);
      
      // Generate new insights
      const newInsights = await generateInsightsFromSchedule(schedule, gender, userId);
      
      // Save to database and update UI
      await saveInsightsToStorage(newInsights, userId);
      
      // Filter insights based on gender if specified
      const filteredInsights = newInsights.filter(insight => {
        // If gender specific insight and user gender doesn't match, exclude it
        if (insight.genderSpecific && gender !== 'female') {
          return false;
        }
        return true;
      });
      
      setInsights(filteredInsights);
      generateInsightStats(filteredInsights);
      
      toast({
        title: "Insights Refreshed",
        description: `Your work insights have been personalized based on your latest schedule and profile.`
      });
    } catch (error) {
      console.error("Error refreshing insights:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId, gender]);

  return {
    insights,
    insightStats,
    loading,
    isRefreshing,
    refreshInsights
  };
};
