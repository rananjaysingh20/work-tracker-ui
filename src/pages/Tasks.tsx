import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasks, projects } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export function Tasks() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    due_date: '',
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const location = useLocation();
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        priority: 'medium',
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
        priority: 'medium',
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

  const handleCreateOrEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTask) {
      updateTask.mutate({
        ...newTask,
        project_id: selectedProjectId,
      });
    } else {
      createTask.mutate(newTask);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
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
        <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <Select
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
        >
          <SelectTrigger id="project-select" className="w-[300px]">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projectsData?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
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
          <div className="p-8 text-center text-gray-500">
            No tasks found for this project. Create your first task to get started.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasksData?.map((task: Task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-6 whitespace-nowrap align-top">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 max-w-[300px] whitespace-normal break-words mt-1">{task.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.due_date ? (
                        <div className="flex items-center gap-2">
                          {new Date(task.due_date).toLocaleDateString()}
                          {isTaskOverdue(task) && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Task Due
                            </Badge>
                          )}
                        </div>
                      ) : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium gap-2">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 inline-flex"
                        onClick={() => openEditModal(task)}
                        title="Edit task"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-gray-100 inline-flex"
                        onClick={() => handleDeleteClick(task)}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <form onSubmit={handleCreateOrEditTask}>
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{editTask ? 'Edit Task' : 'Create New Task'}</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Task Title
                      </label>
                      <Input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={newTask.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={newTask.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <Select
                        name="priority"
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        name="due_date"
                        id="due_date"
                        value={newTask.due_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  >
                    {editTask ? 'Save Changes' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={() => { setIsCreateModalOpen(false); setEditTask(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {deleteTask && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseDeleteModal}
            />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Task</h3>
                <div className="mt-2 text-gray-700">
                  Are you sure you want to delete the task "{deleteTask.title}"? This action cannot be undone.
                </div>
                {deleteError && (
                  <div className="mt-4 text-red-600 text-sm border border-red-200 rounded p-2 bg-red-50">
                    {deleteError}
                  </div>
                )}
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 