
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { FolderKanban, Plus, Search } from "lucide-react";
import ProjectList, { Project } from "@/components/ProjectList";

const Projects = () => {
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
    { 
      id: "5", 
      name: "E-commerce Platform", 
      client: "Shop Co", 
      status: "active", 
      hoursLogged: 42.0, 
      budget: "$12,000", 
      dueDate: "September 5, 2025" 
    },
    { 
      id: "6", 
      name: "SEO Optimization", 
      client: "TechCo", 
      status: "completed", 
      hoursLogged: 15.5, 
      budget: "$2,500", 
      dueDate: "Completed" 
    },
    { 
      id: "7", 
      name: "Product Photoshoot", 
      client: "StartupX", 
      status: "paused", 
      hoursLogged: 8.0, 
      budget: "$1,500", 
      dueDate: "TBD" 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <Link to="/projects/new">
          <Button className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2">
            <Plus size={16} />
            New Project
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search projects..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="1">Acme Inc</SelectItem>
              <SelectItem value="2">TechCo</SelectItem>
              <SelectItem value="3">StartupX</SelectItem>
              <SelectItem value="4">Shop Co</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <FolderKanban className="text-brand-blue" />
            <h2 className="font-semibold">{projects.length} Projects</h2>
          </div>
        </div>
        <ProjectList projects={projects} />
      </div>
    </div>
  );
};

export default Projects;
