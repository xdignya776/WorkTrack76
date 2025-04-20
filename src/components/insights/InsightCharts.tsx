
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from "recharts";

interface InsightStatsProps {
  insightStats: {
    types: Array<{ name: string; value: number }>;
    priority: Array<{ name: string; value: number }>;
    timeline: Array<{ name: string; count: number }>;
  };
}

const InsightCharts = ({ insightStats }: InsightStatsProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e83e8c'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Insight Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Types</CardTitle>
          <CardDescription>Distribution of insight categories</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer 
            config={{
              sleep: { color: "#0088FE" },
              productivity: { color: "#00C49F" },
              health: { color: "#FFBB28" },
              balance: { color: "#FF8042" },
              break: { color: "#8884d8" },
              cycle: { color: "#e83e8c" }
            }}
          >
            <PieChart>
              <Pie
                data={insightStats.types}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {insightStats.types.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Breakdown by priority level</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              high: { color: "#ef4444" },
              medium: { color: "#f59e0b" },
              low: { color: "#10b981" }
            }}
          >
            <BarChart data={insightStats.priority}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="#8884d8">
                {insightStats.priority.map((entry: any, index: number) => {
                  let fill = "#10b981";
                  if (entry.name.toLowerCase() === "high") fill = "#ef4444";
                  if (entry.name.toLowerCase() === "medium") fill = "#f59e0b";
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Insights Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Insights Over Time</CardTitle>
          <CardDescription>Number of insights generated per day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{
              count: { color: "#3b82f6" }
            }}
          >
            <BarChart data={insightStats.timeline}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightCharts;
