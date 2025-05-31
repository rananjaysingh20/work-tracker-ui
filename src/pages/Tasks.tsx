import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasks, projects } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Search, Pencil, Trash2, CheckSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
} as const;

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

interface TasksProps {
  isDark?: boolean;
}

export function Tasks({ isDark = false }: TasksProps) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    project_id: string;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string;
  }>({
    title: '',
    description: '',
    project_id: '',
    status: 'todo',
    priority: 'low',
    due_date: '',
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const location = useLocation();
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projects.getAll(),
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => tasks.getAll(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('projectId');
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [location.search]);

  const createTask = useMutation({
    mutationFn: (data: any) => tasks.create(selectedProjectId, {
      ...data,
      project_id: selectedProjectId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        project_id: '',
        status: 'todo',
        priority: 'low',
        due_date: '',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: (data: any) => tasks.update(editTask?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateModalOpen(false);
      setEditTask(null);
      setNewTask({
        title: '',
        description: '',
        project_id: '',
        status: 'todo',
        priority: 'low',
        due_date: '',
      });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      tasks.update(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasks.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteTask(null);
      setDeleteError(null);
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.detail || error.message || 'Failed to delete task.');
    },
  });

  const handleCreateOrEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      if (editTask) {
        await updateTask.mutateAsync({
          ...newTask,
          project_id: selectedProjectId,
        });
      } else {
        await createTask.mutateAsync(newTask);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskStatus.mutate({ taskId, status: newStatus });
  };

  const isTaskOverdue = (task: Task) => {
    if (task.status === 'completed' || !task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today;
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTask) return;
    setIsDeleting(true);
    deleteTaskMutation.mutate(deleteTask.id, {
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleDeleteClick = (task: Task) => {
    setDeleteTask(task);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTask(null);
    setDeleteError(null);
  };

  if (isLoadingProjects) {
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDark ? 'text-white' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tasks</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedProjectId}
          className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2"
        >
          <Plus size={16} />
          New Task
        </Button>
      </div>

      {/* Project Selection */}
      <div className="mb-6">
        <label htmlFor="project-select" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Project</label>
        <Select
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
        >
          <SelectTrigger id="project-select" className={`w-[300px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}`}>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
            {projectsData?.map((project) => (
              <SelectItem 
                key={project.id} 
                value={project.id}
                className={isDark ? 'text-white hover:bg-gray-700' : ''}
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {selectedProjectId ? (
        isLoadingTasks ? (
          <div className="p-8 text-center">Loading tasks...</div>
        ) : tasksData?.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No tasks found for this project. Create your first task to get started.
          </div>
        ) : (
          <div className={`${isDark ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : ''}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : ''}`}>
              <div className="flex items-center gap-2">
                <CheckSquare className="text-brand-blue" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : ''}`}>Project Tasks</h2>
              </div>
            </div>
            <div className="p-4">
              {tasksData?.map((task: Task) => (
                <div 
                  key={task.id} 
                  className={`mb-4 p-4 rounded-lg border ${
                    isDark 
                      ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Due:</span>{' '}
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Status:</span>{' '}
                          <Badge variant="secondary" className={statusColors[task.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Badge>
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Priority:</span>{' '}
                          <Badge variant="secondary" className={priorityColors[task.priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-800"}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`p-1 rounded-full inline-flex ${
                          isDark 
                            ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                        }`}
                        onClick={() => openEditModal(task)}
                        title="Edit task"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={`p-1 rounded-full inline-flex ${
                          isDark 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                        }`}
                        onClick={() => handleDeleteClick(task)}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="p-8 text-center text-gray-500">
          Please select a project to view its tasks
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => { setIsCreateModalOpen(false); setEditTask(null); }}
            />

            <div className={`inline-block transform overflow-hidden rounded-lg ${isDark ? 'bg-gray-900/90 backdrop-blur-sm' : 'bg-white'} px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle`}>
              <form onSubmit={handleCreateOrEditTask}>
                <div>
                  <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title
                      </label>
                      <Input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={newTask.title}
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
                        value={newTask.description}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <Select
                        name="status"
                        value={newTask.status}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value as 'todo' | 'in_progress' | 'completed' }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          <SelectItem value="todo" className={isDark ? 'text-white hover:bg-gray-700' : ''}>To Do</SelectItem>
                          <SelectItem value="in_progress" className={isDark ? 'text-white hover:bg-gray-700' : ''}>In Progress</SelectItem>
                          <SelectItem value="completed" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="priority" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Priority
                      </label>
                      <Select
                        name="priority"
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          <SelectItem value="low" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Low</SelectItem>
                          <SelectItem value="medium" className={isDark ? 'text-white hover:bg-gray-700' : ''}>Medium</SelectItem>
                          <SelectItem value="high" className={isDark ? 'text-white hover:bg-gray-700' : ''}>High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="due_date" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Due Date
                      </label>
                      <Input
                        type="date"
                        name="due_date"
                        id="due_date"
                        value={newTask.due_date}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <Button type="submit" className="sm:col-start-2" disabled={updateLoading}>
                    {editTask ? (updateLoading ? 'Saving...' : 'Save Changes') : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`mt-3 sm:col-start-1 sm:mt-0 ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`}
                    onClick={() => { setIsCreateModalOpen(false); setEditTask(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {deleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>Delete Task</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDeleteConfirm} className="w-full" variant="destructive">Delete</Button>
              <Button 
                onClick={handleCloseDeleteModal} 
                className={`w-full ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 