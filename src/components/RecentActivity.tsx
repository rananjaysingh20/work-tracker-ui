
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, FolderKanban, Users } from "lucide-react";

type ActivityType = 'time' | 'payment' | 'project' | 'client';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  const iconMap = {
    time: <Clock size={16} className="text-blue-600" />,
    payment: <DollarSign size={16} className="text-green-600" />,
    project: <FolderKanban size={16} className="text-purple-600" />,
    client: <Users size={16} className="text-brand-teal" />
  };

  return (
    <div className="p-2 bg-gray-100 rounded-full">
      {iconMap[type]}
    </div>
  );
};

const RecentActivity = () => {
  // Sample activity data - would come from your data store
  const activities: Activity[] = [
    {
      id: "1",
      type: "time",
      description: "Logged 2.5 hours on Website Redesign",
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      type: "payment",
      description: "Received payment of $1,200 from Acme Inc",
      timestamp: "Yesterday"
    },
    {
      id: "3",
      type: "project",
      description: "Created new project: Mobile App Development",
      timestamp: "Yesterday"
    },
    {
      id: "4",
      type: "client",
      description: "Added new client: StartupX",
      timestamp: "2 days ago"
    },
    {
      id: "5",
      type: "time",
      description: "Logged 1.5 hours on Brand Identity",
      timestamp: "3 days ago"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3">
            <ActivityIcon type={activity.type} />
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
