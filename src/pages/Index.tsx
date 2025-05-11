
import DashboardMetrics from "@/components/DashboardMetrics";
import ClientCard, { Client } from "@/components/ClientCard";
import ProjectList, { Project } from "@/components/ProjectList";
import TimeTracker from "@/components/TimeTracker";
import RecentActivity from "@/components/RecentActivity";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Sample client data - would come from your data store
  const clients: Client[] = [
    { 
      id: "1", 
      name: "Acme Inc", 
      activeProjects: 3, 
      totalEarnings: "$4,500", 
      hoursLogged: 45.5 
    },
    { 
      id: "2", 
      name: "TechCo", 
      activeProjects: 2, 
      totalEarnings: "$3,200", 
      hoursLogged: 32.0 
    },
    { 
      id: "3", 
      name: "StartupX", 
      activeProjects: 1, 
      totalEarnings: "$1,800", 
      hoursLogged: 18.5 
    },
  ];

  // Sample project data - would come from your data store
  const projects: Project[] = [
    { 
      id: "1", 
      name: "Website Redesign", 
      client: "Acme Inc", 
      status: "active", 
      hoursLogged: 22.5, 
      budget: "$5,000", 
      dueDate: "June 15, 2025" 
    },
    { 
      id: "2", 
      name: "Mobile App Development", 
      client: "TechCo", 
      status: "active", 
      hoursLogged: 18.0, 
      budget: "$8,000", 
      dueDate: "July 30, 2025" 
    },
    { 
      id: "3", 
      name: "Brand Identity", 
      client: "StartupX", 
      status: "paused", 
      hoursLogged: 12.5, 
      budget: "$3,000", 
      dueDate: "August 10, 2025" 
    },
    { 
      id: "4", 
      name: "Marketing Campaign", 
      client: "Acme Inc", 
      status: "completed", 
      hoursLogged: 36.0, 
      budget: "$4,500", 
      dueDate: "Completed" 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link to="/time-entries/new">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
              New Time Entry
            </Button>
          </Link>
          <Link to="/projects/new">
            <Button className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2">
              <Plus size={16} />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Projects</h2>
              <Link to="/projects" className="text-sm text-brand-blue hover:underline">
                View all
              </Link>
            </div>
            <ProjectList projects={projects} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <RecentActivity />
          </div>
        </div>

        <div className="space-y-6">
          <TimeTracker />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Top Clients</h2>
              <Link to="/clients" className="text-sm text-brand-blue hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {clients.map(client => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
