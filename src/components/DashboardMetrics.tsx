
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Users, FolderKanban } from "lucide-react";

const DashboardMetrics = () => {
  // These would come from your data source in a real app
  const metrics = [
    {
      title: "Total Hours",
      value: "127.5",
      change: "+12%",
      icon: <Clock className="h-5 w-5 text-brand-teal" />,
      description: "vs. last month",
    },
    {
      title: "Total Earnings",
      value: "$9,850",
      change: "+24%",
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "vs. last month",
    },
    {
      title: "Active Clients",
      value: "8",
      change: "+2",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: "vs. last month",
    },
    {
      title: "Active Projects",
      value: "12",
      change: "+3",
      icon: <FolderKanban className="h-5 w-5 text-purple-600" />,
      description: "vs. last month",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              {metric.title}
            </CardTitle>
            <div className="p-2 bg-gray-100 rounded-md">{metric.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className={`font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </span>
              <span className="ml-1">{metric.description}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardMetrics;
