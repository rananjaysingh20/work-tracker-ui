import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntries, tasks, projects } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Clock, Plus, Pencil, Trash2, Upload, Paperclip, Check } from "lucide-react";
import { useAuth } from '../lib/auth';
import { timeEntryFiles } from '../lib/api';

interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  duration: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
}

interface TimeEntriesProps {
  isDark?: boolean;
}

export function TimeEntries({ isDark = false }: TimeEntriesProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [newTimeEntry, setNewTimeEntry] = useState({
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '17:00',
    duration: 8,
  });
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<TimeEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fileInputs, setFileInputs] = useState<{ [key: string]: File | null }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadError, setUploadError] = useState<{ entryId: string, message: string } | null>(null);

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projects.getAll(),
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => tasks.getAll(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: timeEntriesData, isLoading: isLoadingTimeEntries } = useQuery({
    queryKey: ['timeEntries', selectedTaskId],
    queryFn: () => timeEntries.getAll(selectedTaskId),
    enabled: !!selectedTaskId,
  });

  const { data: timeEntryFilesData = {}, refetch: refetchFiles } = useQuery({
    queryKey: ["timeEntryFiles", selectedTaskId],
    queryFn: async () => {
      if (!tasksData) return {};
      const filesByEntry: { [key: string]: any[] } = {};
      await Promise.all(
        tasksData.flatMap((task: any) =>
          (timeEntriesData || []).map(async (entry: any) => {
            const files = await timeEntryFiles.list(entry.id);
            filesByEntry[entry.id] = files;
          })
        )
      );
      return filesByEntry;
    },
    enabled: !!selectedTaskId && !!timeEntriesData,
  });

  const createTimeEntry = useMutation({
    mutationFn: (data: any) => timeEntries.create(selectedTaskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setIsCreateModalOpen(false);
      setNewTimeEntry({
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '17:00',
        duration: 8,
      });
    },
  });

  // Update mutation for editing a time entry
  const updateTimeEntry = useMutation({
    mutationFn: (data: any) => timeEntries.update(editEntry?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setIsCreateModalOpen(false);
      setEditEntry(null);
      setNewTimeEntry({
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '17:00',
        duration: 8,
      });
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: (entryId: string) => timeEntries.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setDeleteEntry(null);
      setDeleteError(null);
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.detail || error.message || 'Failed to delete time entry.');
    },
  });

  // Helper to calculate duration in hours (decimal)
  const calculateDuration = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    return diffMs / (1000 * 60 * 60); // hours
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTimeEntry((prev) => {
      const updated = { ...prev, [name]: value };
      if (["startDate", "startTime", "endDate", "endTime"].includes(name)) {
        updated.duration = calculateDuration(
          updated.startDate,
          updated.startTime,
          updated.endDate,
          updated.endTime
        );
      }
      return updated;
    });
  };

  const handleCreateOrEditTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    const timeEntryData = {
      description: newTimeEntry.description,
      date: newTimeEntry.startDate,
      duration: newTimeEntry.duration,
      start_time: `${newTimeEntry.startDate}T${newTimeEntry.startTime}`,
      end_time: `${newTimeEntry.endDate}T${newTimeEntry.endTime}`,
      task_id: selectedTaskId,
      user_id: user.id,
    };
    if (editEntry) {
      updateTimeEntry.mutate(timeEntryData);
    } else {
      createTimeEntry.mutate(timeEntryData);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTaskId('');
  };

  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const openEditModal = (entry: TimeEntry) => {
    setEditEntry(entry);
    setNewTimeEntry({
      description: entry.description,
      startDate: entry.start_time ? entry.start_time.split('T')[0] : entry.date,
      startTime: entry.start_time ? entry.start_time.split('T')[1]?.slice(0,5) : '09:00',
      endDate: entry.end_time ? entry.end_time.split('T')[0] : entry.date,
      endTime: entry.end_time ? entry.end_time.split('T')[1]?.slice(0,5) : '17:00',
      duration: entry.duration,
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteEntry) return;
    setIsDeleting(true);
    deleteTimeEntry.mutate(deleteEntry.id, {
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleDeleteClick = (entry: TimeEntry) => {
    setDeleteEntry(entry);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteEntry(null);
    setDeleteError(null);
  };

  const handleFileChange = (entryId: string, file: File | null) => {
    setFileInputs((prev) => ({ ...prev, [entryId]: file }));
  };

  const handleFileUpload = async (entryId: string) => {
    const file = fileInputs[entryId];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [entryId]: true }));
    try {
      await timeEntryFiles.upload(entryId, file);
      setFileInputs((prev) => ({ ...prev, [entryId]: null }));
      refetchFiles();
    } catch (err: any) {
      setUploadError({
        entryId,
        message: err?.response?.data?.detail || err?.message || "Failed to upload file.",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [entryId]: false }));
    }
  };

  const handleFileDelete = async (entryId: string, fileId: string) => {
    await timeEntryFiles.delete(entryId, fileId);
    refetchFiles();
  };

  if (isLoadingProjects) {
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDark ? 'text-white' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Time Entries</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedTaskId}
          className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2"
        >
          <Plus size={16} />
          New Time Entry
        </Button>
      </div>

      {/* Project and Task Selection */}
      <div className="mb-6 flex gap-4">
        <div className="flex flex-col">
          <label htmlFor="project-select" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Project</label>
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger id="project-select" className={`w-[300px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}`}>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <SelectItem value="all" className={isDark ? 'text-white hover:bg-gray-700' : ''}>All Projects</SelectItem>
              {projectsData?.map((project) => (
                <SelectItem key={project.id} value={project.id} className={isDark ? 'text-white hover:bg-gray-700' : ''}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProjectId && (
          <div className="flex flex-col">
            <label htmlFor="task-select" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Task</label>
            <Select value={selectedTaskId} onValueChange={handleTaskChange}>
              <SelectTrigger id="task-select" className={`w-[300px] ${isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}`}>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <SelectItem value="all" className={isDark ? 'text-white hover:bg-gray-700' : ''}>All Tasks</SelectItem>
                {tasksData?.map((task) => (
                  <SelectItem key={task.id} value={task.id} className={isDark ? 'text-white hover:bg-gray-700' : ''}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Time Entries List */}
      {selectedTaskId ? (
        isLoadingTimeEntries ? (
          <div className="p-8 text-center">Loading time entries...</div>
        ) : timeEntriesData?.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No time entries found for this task. Create your first time entry to get started.
          </div>
        ) : (
          <div className={`${isDark ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : ''}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : ''}`}>
              <div className="flex items-center gap-2">
                <Clock className="text-brand-blue" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : ''}`}>Time Entries</h2>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (hours)</th>
                    <th className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntriesData?.map((entry: TimeEntry) => (
                    <tr key={entry.id} className={`${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.start_time
                          ? new Date(entry.start_time).toLocaleDateString()
                          : (entry.date ? new Date(entry.date).toLocaleDateString() : '')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.duration.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end items-center">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFileChange(entry.id, e.target.files?.[0] || null)}
                              disabled={uploading[entry.id]}
                            />
                            <Paperclip size={16} className={`text-blue-600 hover:text-blue-800 ${isDark ? 'text-gray-400' : ''}`} />
                          </label>
                          {fileInputs[entry.id] && (
                            <>
                              <span className="text-xs text-gray-700 max-w-[120px] truncate inline-block align-middle">{fileInputs[entry.id]?.name}</span>
                              <button
                                type="button"
                                className={`text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-gray-100 ${isDark ? 'text-gray-400 hover:bg-gray-700' : ''}`}
                                onClick={() => handleFileUpload(entry.id)}
                                disabled={uploading[entry.id]}
                              >
                                {uploading[entry.id] ? <Upload size={16} className="animate-spin" /> : <Upload size={16} />}
                              </button>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 ${isDark ? 'text-gray-400 hover:bg-gray-700' : ''}`}
                          onClick={() => openEditModal(entry)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className={`text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-gray-100 ${isDark ? 'text-gray-400 hover:bg-gray-700' : ''}`}
                          onClick={() => handleDeleteClick(entry)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <ul className="space-y-1">
                          {(timeEntryFilesData[entry.id] || []).map((file: any) => {
                            const fileUrl = file.file_url;
                            return (
                              <li key={file.id} className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : ''}`}>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`text-blue-600 underline ${isDark ? 'text-gray-400' : ''}`}>
                                  {file.file_name}
                                </a>
                                <button
                                  className={`text-red-600 hover:text-red-800 ${isDark ? 'text-gray-400 hover:bg-gray-700' : ''}`}
                                  onClick={() => handleFileDelete(entry.id, file.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Please select a project and task to view time entries
        </div>
      )}

      {/* Create/Edit Time Entry Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => { setIsCreateModalOpen(false); setEditEntry(null); }}
            />
            <div className={`inline-block transform overflow-hidden rounded-lg ${isDark ? 'bg-gray-900/90 backdrop-blur-sm' : 'bg-white'} px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle`}>
              <form onSubmit={handleCreateOrEditTimeEntry}>
                <div>
                  <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editEntry ? 'Edit Time Entry' : 'Create New Time Entry'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="description" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <Textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={newTimeEntry.description}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <label htmlFor="startDate" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                        <Input
                          type="date"
                          name="startDate"
                          id="startDate"
                          required
                          value={newTimeEntry.startDate}
                          onChange={handleInputChange}
                          className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                        />
                      </div>
                      <div>
                        <label htmlFor="startTime" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</label>
                        <Input
                          type="time"
                          name="startTime"
                          id="startTime"
                          required
                          value={newTimeEntry.startTime}
                          onChange={handleInputChange}
                          className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <label htmlFor="endDate" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                        <Input
                          type="date"
                          name="endDate"
                          id="endDate"
                          required
                          value={newTimeEntry.endDate}
                          onChange={handleInputChange}
                          className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>End Time</label>
                        <Input
                          type="time"
                          name="endTime"
                          id="endTime"
                          required
                          value={newTimeEntry.endTime}
                          onChange={handleInputChange}
                          className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Duration (hours)</label>
                      <Input
                        type="number"
                        name="duration"
                        id="duration"
                        step="0.01"
                        min="0"
                        value={newTimeEntry.duration}
                        readOnly
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`}
                  >
                    {editEntry ? 'Save Changes' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className={`mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`}
                    onClick={() => { setIsCreateModalOpen(false); setEditEntry(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Time Entry Modal */}
      {deleteEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>Delete Time Entry</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete this time entry? This action cannot be undone.
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

      {/* Upload Error Modal */}
      {uploadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-2 text-red-700">File Upload Error</h2>
            <div className="mb-4 text-gray-800">{uploadError.message}</div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setUploadError(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
