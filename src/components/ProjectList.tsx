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
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  client_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
};

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => Promise<void>;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  completed: "bg-blue-100 text-blue-800",
};

const ProjectList = ({ projects, onEdit, onDelete }: ProjectListProps) => {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  if (!projects || projects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No projects found. Create your first project to get started.
      </div>
    );
  }

  const isProjectOverdue = (project: Project) => {
    if (project.status !== 'active' || !project.end_date) return false;
    const endDate = new Date(project.end_date);
    const today = new Date();
    return endDate < today;
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(projectToDelete.id);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      setProjectToDelete(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          "Failed to delete project. Please try again.";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
    setProjectToDelete(null);
  };

  return (
    <TooltipProvider>
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      {project.name}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>{project.description || 'No description available'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{project.client_name}</TableCell>
              <TableCell>
                  <Badge variant="secondary" className={statusColors[project.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </TableCell>
                <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
              <TableCell>
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                  {isProjectOverdue(project) && (
                    <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                      Project Due
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                <Link 
                    to={`/tasks?projectId=${project.id}`}
                  className="p-1 rounded-full hover:bg-gray-100 inline-flex"
                >
                  <ExternalLink size={16} />
                </Link>
                  {onEdit && (
                    <button
                      type="button"
                      className="p-1 rounded-full hover:bg-gray-100 inline-flex text-gray-500 hover:text-indigo-600"
                      onClick={() => onEdit(project)}
                      title="Edit project"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="p-1 rounded-full hover:bg-gray-100 inline-flex text-gray-500 hover:text-red-600"
                      onClick={() => handleDeleteClick(project)}
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the project "{projectToDelete?.name}". This action cannot be undone.
                {projectToDelete?.status === 'active' && (
                  <p className="mt-2 text-amber-600">
                    Warning: This project is currently active. Deleting it may affect ongoing work.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!error} onOpenChange={handleCloseError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cannot Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseError}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
    </TooltipProvider>
  );
};

export default ProjectList;
