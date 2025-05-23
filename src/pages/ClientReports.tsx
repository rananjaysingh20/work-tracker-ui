import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reports } from '../lib/api';
import { Button } from '@/components/ui/button';

export default function ClientReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['clientsFullReport'],
    queryFn: reports.getClientsFullReport,
  });
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No reports found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Client Reports</h1>
      <ul className="space-y-2">
        {data.map((client: any) => (
          <li key={client.id}>
            <button
              className="text-blue-600 hover:underline text-lg font-medium"
              onClick={() => setSelectedReport(client)}
            >
              {client.name} Report
            </button>
          </li>
        ))}
      </ul>

      {/* Modal for report details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">{selectedReport.name} Report</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div><span className="font-semibold">Company:</span> {selectedReport.company}</div>
              <div><span className="font-semibold">Email:</span> {selectedReport.email}</div>
              <div><span className="font-semibold">Phone:</span> {selectedReport.phone}</div>
              <div><span className="font-semibold">Address:</span> {selectedReport.address}</div>
              <div><span className="font-semibold">Notes:</span> {selectedReport.notes}</div>
              <div className="mt-4">
                <span className="font-semibold">Projects:</span>
                {selectedReport.projects.map((project: any) => (
                  <span key={project.id}> {project.name}</span>
                ))}
                <ul className="ml-4 list-disc">
                  {selectedReport.projects.map((project: any) => (
                    <li key={project.id} className="mt-2">
                      <div className="font-medium">{project.title}</div>
                      <div className="ml-4">
                        <span className="font-semibold">Tasks:</span>
                        <ul className="ml-4 list-decimal">
                          {project.tasks.map((task: any) => (
                            <li key={task.id} className="mt-1">
                              <div className="font-medium">
                                {task.title}
                                {task.description && (
                                  <span className="text-gray-600 font-normal"> - {task.description}</span>
                                )}
                              </div>
                              {task.time_entries.length > 0 && <div className="ml-4">
                                <span className="font-semibold">Time Entries:</span>
                                <ul className="ml-4 list-disc">
                                  {task.time_entries.map((te: any) => (
                                    <li key={te.id} className="mt-2">
                                      <div className="space-y-1">
                                        <div>
                                          <span className="font-medium">Description:</span>{' '}
                                          {te.description || 'No description'}
                                        </div>
                                        <div>
                                          <span className="font-medium">Duration:</span>{' '}
                                          {te.duration.toFixed(2)} hours
                                        </div>
                                        {te.time_entry_files && te.time_entry_files.length > 0 && (
                                          <div>
                                            <span className="font-medium">Files:</span>
                                            <ul className="ml-4 list-disc">
                                              {te.time_entry_files.map((file: any) => (
                                                <li key={file.id}>
                                                  <a
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                  >
                                                    {file.file_name}
                                                  </a>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                {selectedReport.client_files && selectedReport.client_files.length > 0 && (
                  <div className="mb-2">
                    <div><b>Total Time:</b> { (selectedReport.projects || []).flatMap(p => p.tasks?.flatMap(t => t.time_entries || []) || []).reduce((sum, e) => sum + (e.duration || 0), 0)} hours</div>
                    <span className="font-semibold">Client Files:</span>
                    <ul className="ml-4 list-disc">
                      {selectedReport.client_files.map((file: any) => {
                        const url = file.url || file.file_url || '';
                        const name = file.name || file.file_name || 'File';
                        return (
                          <li key={file.id}>
                            {url ? (
                              <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {name}
                              </a>
                            ) : (
                              <span>{name}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={() => setSelectedReport(null)} className="mt-6 w-full">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 