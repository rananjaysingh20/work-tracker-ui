
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type Client = {
  id: string;
  name: string;
  activeProjects: number;
  totalEarnings: string;
  hoursLogged: number;
};

interface ClientCardProps {
  client: Client;
}

const ClientCard = ({ client }: ClientCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium">{client.name}</CardTitle>
          <Link 
            to={`/clients/${client.id}`}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Active Projects</p>
            <p className="font-semibold">{client.activeProjects}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Earnings</p>
            <p className="font-semibold">{client.totalEarnings}</p>
          </div>
          <div className="col-span-2 mt-1">
            <p className="text-gray-500">Hours Logged</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{client.hoursLogged.toFixed(1)}</p>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-teal rounded-full"
                  style={{ width: `${Math.min(client.hoursLogged / 100 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
