import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Users, FolderKanban } from "lucide-react";

interface DashboardMetricsProps {
  isDark?: boolean;
}

const DashboardMetrics = ({ isDark = false }: DashboardMetricsProps) => {
  // These would come from your data source in a real app
  const metrics = [
    {
      title: "Total Hours",
      value: "127.5",
      change: "+12%",
      icon: <Clock className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-brand-teal'}`} />,
      description: "vs. last month",
    },
    {
      title: "Total Earnings",
      value: "$9,850",
      change: "+24%",
      icon: <DollarSign className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />,
      description: "vs. last month",
    },
    {
      title: "Active Clients",
      value: "8",
      change: "+2",
      icon: <Users className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
      description: "vs. last month",
    },
    {
      title: "Active Projects",
      value: "12",
      change: "+3",
      icon: <FolderKanban className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />,
      description: "vs. last month",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} isDark={isDark} className={isDark ? 'bg-gray-900/40 backdrop-blur-sm' : ''}>
          <CardHeader isDark={isDark} className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle isDark={isDark} className={`text-sm font-medium ${isDark ? 'text-gray-100' : ''}`}>
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent isDark={isDark}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : ''}`}>{metric.value}</div>
            <p className={`text-xs flex items-center mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className={`font-medium ${
                metric.change.startsWith('+') 
                  ? isDark ? 'text-green-400' : 'text-green-500'
                  : isDark ? 'text-red-400' : 'text-red-500'
              }`}>
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
