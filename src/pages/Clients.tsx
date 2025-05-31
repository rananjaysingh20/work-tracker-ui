import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { clients } from '../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Paperclip, Trash2, ArrowUpFromLine, Pencil } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ClientsProps {
  isDark?: boolean;
}

export function Clients({ isDark = false }: ClientsProps) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
  });
  const [fileInputs, setFileInputs] = useState<{ [clientId: string]: File | null }>({});
  const [uploading, setUploading] = useState<{ [clientId: string]: boolean }>({});
  const [deleting, setDeleting] = useState<{ [fileId: string]: boolean }>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [clientDeleting, setClientDeleting] = useState<{ [clientId: string]: boolean }>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; clientId: string | null }>({ open: false, clientId: null });
  const [viewClient, setViewClient] = useState<Client | null>(null);

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clients.getAll(),
  });
  
  const safeClientsData = Array.isArray(clientsData) ? clientsData : [];

  const fileQueries = useQueries({
    queries: safeClientsData.map(client => ({
      queryKey: ['clientFiles', client.id],
      queryFn: () => clients.getFiles(client.id),
      enabled: !!client.id,
    })),
  });

  const createClient = useMutation({
    mutationFn: (data: any) => clients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsCreateModalOpen(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        notes: '',
      });
    },
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(newClient);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (clientId: string, file: File | null) => {
    setFileInputs((prev) => ({ ...prev, [clientId]: file }));
  };

  const handleFileUpload = async (clientId: string) => {
    const file = fileInputs[clientId];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [clientId]: true }));
    try {
      await clients.uploadFile(clientId, file);
      queryClient.invalidateQueries({ queryKey: ['clientFiles', clientId] });
      setFileInputs((prev) => ({ ...prev, [clientId]: null }));
    } finally {
      setUploading((prev) => ({ ...prev, [clientId]: false }));
    }
  };

  const handleFileDelete = async (clientId: string, fileId: string) => {
    setDeleting((prev) => ({ ...prev, [fileId]: true }));
    try {
      await clients.deleteFile(clientId, fileId);
      queryClient.invalidateQueries({ queryKey: ['clientFiles', clientId] });
    } finally {
      setDeleting((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const openConfirmDelete = (clientId: string) => {
    setConfirmDelete({ open: true, clientId });
  };

  const closeConfirmDelete = () => {
    setConfirmDelete({ open: false, clientId: null });
  };

  const confirmDeleteClient = async () => {
    if (confirmDelete.clientId) {
      await handleClientDelete(confirmDelete.clientId);
    }
    closeConfirmDelete();
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      company: client.company,
      notes: client.notes,
    });
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingClient(null);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
    });
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingClient(null);
    setIsEditMode(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingClient) {
      setUpdateLoading(true);
      await clients.update(editingClient.id, newClient);
      setUpdateLoading(false);
    } else {
      createClient.mutate(newClient);
    }
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    handleModalClose();
  };

  const handleClientDelete = async (clientId: string) => {
    setClientDeleting((prev) => ({ ...prev, [clientId]: true }));
    try {
      await clients.delete(clientId);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || 'Failed to delete client');
    } finally {
      setClientDeleting((prev) => ({ ...prev, [clientId]: false }));
    }
  };

  // Helper to format ISO date strings
  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>;
  }

  return (
    <div className={isDark ? 'text-white' : ''}>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Clients</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            A list of all clients including their name, email, and company.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Clients List */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${isDark ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-300">
                <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'} sm:pl-6`}>
                      Name
                    </th>
                    <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Company
                    </th>
                    <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Email
                    </th>
                    <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Phone
                    </th>
                    <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Files
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-transparent' : 'divide-gray-200 bg-white'}`}>
                  {safeClientsData.map((client: Client, idx: number) => (
                    <tr key={client.id} className={isDark ? 'hover:bg-gray-800/50' : ''}>
                      <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} sm:pl-6`}>
                        <button
                          type="button"
                          className="hover:underline text-left"
                          onClick={() => setViewClient(client)}
                          title="View client details"
                        >
                          {client.name}
                        </button>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {client.company}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {client.email}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {client.phone}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} min-w-[220px]`}>
                        <ul className="space-y-1">
                          {fileQueries[idx]?.data?.map((file: any) => (
                            <li key={file.id} className="flex items-center gap-2 group">
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer" className={`hover:underline truncate max-w-[120px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                {file.file_name}
                              </a>
                              <button
                                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                                onClick={() => handleFileDelete(client.id, file.id)}
                                disabled={deleting[file.id]}
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => handleFileChange(client.id, e.target.files?.[0] || null)}
                            disabled={uploading[client.id]}
                          />
                          <Paperclip className={`w-5 h-5 transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`} />
                        </label>
                        {fileInputs[client.id] && !uploading[client.id] && (
                          <span className={`ml-2 max-w-[120px] truncate text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} title={fileInputs[client.id]?.name}>
                            {fileInputs[client.id]?.name}
                          </span>
                        )}
                        {fileInputs[client.id] && !uploading[client.id] && (
                          <button
                            onClick={() => handleFileUpload(client.id)}
                            className={`ml-1 transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                            title="Upload file"
                          >
                            <ArrowUpFromLine className="w-5 h-5" />
                          </button>
                        )}
                        {uploading[client.id] && (
                          <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Uploading...</span>
                        )}
                        <button
                          type="button"
                          className={`ml-2 transition-colors ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'}`}
                          onClick={() => handleEditClick(client)}
                          title="Edit client"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          className={`ml-2 transition-colors ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
                          onClick={() => openConfirmDelete(client.id)}
                          title="Delete client"
                          disabled={clientDeleting[client.id]}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
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
                    {isEditMode ? 'Edit Client' : 'Create New Client'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={newClient.name}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Company
                      </label>
                      <Input
                        type="text"
                        name="company"
                        id="company"
                        value={newClient.company}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={newClient.email}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={newClient.phone}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address
                      </label>
                      <Textarea
                        name="address"
                        id="address"
                        rows={2}
                        value={newClient.address}
                        onChange={handleInputChange}
                        className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : ''}
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Notes
                      </label>
                      <Textarea
                        name="notes"
                        id="notes"
                        rows={3}
                        value={newClient.notes}
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
                    className={`mt-3 sm:col-start-1 sm:mt-0 ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`}
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

      {/* Error Modal for Delete */}
      {deleteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Delete Client Failed</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{deleteError}</p>
            <Button onClick={() => setDeleteError(null)} className="w-full">OK</Button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>Delete Client</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Are you sure you want to delete this client?</p>
            <div className="flex gap-2">
              <Button onClick={confirmDeleteClient} className="w-full" variant="destructive">Delete</Button>
              <Button 
                onClick={closeConfirmDelete} 
                className={`w-full ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {viewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-md w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>Client Details</h2>
            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <div><span className="font-semibold">Name:</span> {viewClient.name}</div>
              <div><span className="font-semibold">Company:</span> {viewClient.company}</div>
              <div><span className="font-semibold">Email:</span> {viewClient.email}</div>
              <div><span className="font-semibold">Phone:</span> {viewClient.phone}</div>
              <div><span className="font-semibold">Address:</span> {viewClient.address}</div>
              <div><span className="font-semibold">Notes:</span> {viewClient.notes}</div>
              <div><span className="font-semibold">Created At:</span> {formatDate(viewClient.created_at)}</div>
              <div><span className="font-semibold">Updated At:</span> {formatDate(viewClient.updated_at)}</div>
            </div>
            <Button 
              onClick={() => setViewClient(null)} 
              className={`mt-6 w-full ${isDark ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
