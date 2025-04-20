
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import InsightCard from "@/components/insights/InsightCard";
import FemaleHealthCard from "@/components/insights/FemaleHealthCard";
import InsightCharts from "@/components/insights/InsightCharts";
import InsightsTable from "@/components/insights/InsightsTable";
import EmptyInsights from "@/components/insights/EmptyInsights";
import { useInsights } from "@/hooks/useInsights";

const Insights = () => {
  const { user } = useAuth();
  const { 
    insights, 
    insightStats, 
    loading, 
    isRefreshing, 
    refreshInsights 
  } = useInsights({ 
    userId: user?.id, 
    gender: user?.gender 
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                AI Insights
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Your Personalized Work Insights
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI analyzes your work schedule to provide scientifically-backed insights 
                that help optimize your productivity, sleep patterns, and work-life balance.
                {user?.gender && <span className="block mt-1 text-sm font-medium text-primary">Personalized for {user.gender === 'female' ? 'women' : 'men'}</span>}
              </p>
              <Button 
                variant="outline" 
                onClick={refreshInsights}
                disabled={isRefreshing}
                className="mt-4"
              >
                {isRefreshing ? "Refreshing..." : "Refresh Insights"}
              </Button>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="charts">Analytics</TabsTrigger>
                <TabsTrigger value="all-insights">All Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-pulse">Loading insights...</div>
                  </div>
                ) : insights.length > 0 ? (
                  <>
                    {user?.gender === "female" && <FemaleHealthCard />}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {insights.slice(0, 6).map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyInsights />
                )}
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-pulse">Loading analytics...</div>
                  </div>
                ) : (
                  <InsightCharts insightStats={insightStats} />
                )}
              </TabsContent>
              
              <TabsContent value="all-insights">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-pulse">Loading insights...</div>
                  </div>
                ) : (
                  <InsightsTable insights={insights} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
