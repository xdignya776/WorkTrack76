
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Insight, getPriorityColor, getTypeIcon, formatDate } from "@/utils/insightUtils";

interface InsightsTableProps {
  insights: Insight[];
}

const InsightsTable = ({ insights }: InsightsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Insights</CardTitle>
        <CardDescription>Complete list of your personalized insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.map((insight) => {
              const IconComponent = getTypeIcon(insight.type);
              
              return (
                <TableRow key={insight.id} className={insight.genderSpecific ? "bg-primary/5" : ""}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="capitalize">{insight.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(insight.priority)} text-white`}>
                      {insight.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(insight.date)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InsightsTable;
