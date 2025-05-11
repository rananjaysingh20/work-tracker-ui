
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export type Project = {
  id: string;
  name: string;
  client: string;
  status: "active" | "paused" | "completed";
  hoursLogged: number;
  budget: string;
  dueDate: string;
};

interface ProjectListProps {
  projects: Project[];
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  completed: "bg-blue-100 text-blue-800",
};

const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[project.status]}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{project.hoursLogged.toFixed(1)}</TableCell>
              <TableCell>{project.budget}</TableCell>
              <TableCell>{project.dueDate}</TableCell>
              <TableCell>
                <Link 
                  to={`/projects/${project.id}`}
                  className="p-1 rounded-full hover:bg-gray-100 inline-flex"
                >
                  <ExternalLink size={16} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectList;
