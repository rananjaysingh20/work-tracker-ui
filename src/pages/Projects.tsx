import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projects, clients } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FolderKanban, Plus, Search, Pencil } from "lucide-react";
import ProjectList from "@/components/ProjectList";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  client_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
}

interface ProjectsProps {
  isDark?: boolean;
}

export function Projects({ isDark = false }: ProjectsProps) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
  });
  const [clientError, setClientError] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projects.getAll(),
  });

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clients.getAll(),
  });

  const createProject = useMutation({
    mutationFn: (data: any) => projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        client_id: '',
        status: 'active',
        start_date: '',
        end_date: '',
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (projectId: string) => projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      client_id: project.client_id || '',
      status: project.status,
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
    });
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setNewProject({
      name: '',
      description: '',
      client_id: '',
      status: 'active',
      start_date: '',
      end_date: '',
    });
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingProject(null);
    setIsEditMode(false);
    setNewProject({
      name: '',
      description: '',
      client_id: '',
      status: 'active',
      start_date: '',
      end_date: '',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingProject) {
      setUpdateLoading(true);
      await projects.update(editingProject.id, newProject);
      setUpdateLoading(false);
    } else {
      createProject.mutate(newProject);
    }
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    handleModalClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDark ? 'text-white' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Projects</h1>
        <Button 
          onClick={handleCreateClick}
          className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
          <Input
            placeholder="Search projects..."
            className={`pl-10 ${isDark ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' : ''}`}
          />
        </div>

        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className={`w-[160px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="all" className={isDark ? 'text-white hover:bg-gray-700' : ''}>All Statuses</SelectItem>
              <SelectItem value="active" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Active</SelectItem>
              <SelectItem value="paused" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Paused</SelectItem>
              <SelectItem value="completed" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className={`w-[160px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}`}>
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="all" className={isDark ? 'text-white hover:bg-gray-700' : ''}>All Clients</SelectItem>
              {clientsData?.map((client) => (
                <SelectItem 
                  key={client.id} 
                  value={client.id}
                  className={isDark ? 'text-white hover:bg-gray-700' : ''}
                >
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : ''}`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : ''}`}>
          <div className="flex items-center gap-2">
            <FolderKanban className="text-brand-blue" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : ''}`}>{projectsData?.length} Projects</h2>
          </div>
        </div>
        <ProjectList 
          projects={projectsData} 
          onEdit={handleEditClick} 
          onDelete={deleteProject.mutateAsync}
          isDark={isDark}
        />
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleModalClose}
            />

            <div className={`inline-block transform overflow-hidden rounded-lg ${isDark ? 'bg-gray-900/90 backdrop-blur-sm' : 'bg-white'} px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle`}>
              <form onSubmit={handleFormSubmit}>
                <div>
                  <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Project Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={newProject.name}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <Textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={newProject.description}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="client_id" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Client
                      </label>
                      <Select
                        name="client_id"
                        value={newProject.client_id}
                        onValueChange={(value) => {
                          setNewProject(prev => ({ ...prev, client_id: value }));
                          setClientError('');
                        }}
                        required
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          {clientsData?.map((client) => (
                            <SelectItem 
                              key={client.id} 
                              value={client.id}
                              className={isDark ? 'text-white hover:bg-gray-700' : ''}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {clientError && (
                        <p className="text-red-500 text-xs mt-1">{clientError}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <Select
                        name="status"
                        value={newProject.status}
                        onValueChange={(value) => setNewProject(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          <SelectItem value="active" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Active</SelectItem>
                          <SelectItem value="paused" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Paused</SelectItem>
                          <SelectItem value="completed" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="start_date" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Start Date
                      </label>
                      <Input
                        type="date"
                        name="start_date"
                        id="start_date"
                        required
                        value={newProject.start_date}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="end_date" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        End Date
                      </label>
                      <Input
                        type="date"
                        name="end_date"
                        id="end_date"
                        value={newProject.end_date}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <Button type="submit" className="sm:col-start-2" disabled={updateLoading}>
                    {isEditMode ? (updateLoading ? 'Saving...' : 'Save Changes') : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`mt-3 sm:col-start-1 sm:mt-0 ${isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}`}
                    onClick={handleModalClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
