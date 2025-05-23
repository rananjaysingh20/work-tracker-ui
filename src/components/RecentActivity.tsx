import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO, differenceInDays, addDays, isWithinInterval } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { tasks } from '@/lib/api';

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

interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  client_id: string;
  status: string;
  start_date: string;
  end_date: string;
  client_name: string;
}

interface RecentActivityProps {
  projects: Project[];
  isLoading?: boolean;
  error?: Error | null;
}

const RecentActivity = ({ projects, isLoading = false, error = null }: RecentActivityProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Set the first project as default when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  // Fetch tasks for selected project
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => tasks.getAll(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  if (isLoading || isLoadingTasks) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full space-y-4">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-[250px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-red-500">
            Error loading project data
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  if (!selectedProject) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
            No project selected
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process tasks data for the Gantt chart
  const processGanttData = (tasks: Task[] = [], project: Project) => {
    if (!tasks?.length) return [];

    const projectStart = project.start_date ? parseISO(project.start_date) : parseISO(project.created_at);
    const projectEnd = project.end_date ? parseISO(project.end_date) : addDays(new Date(), 30);
    
    // Calculate the total duration in days
    const totalDays = differenceInDays(projectEnd, projectStart) + 1;
    
    return tasks.map(task => {
      const taskStart = parseISO(task.created_at);
      const taskEnd = task.due_date ? parseISO(task.due_date) : addDays(taskStart, 7);
      
      // Calculate the start position as percentage from project start
      const startOffset = Math.max(0, differenceInDays(taskStart, projectStart));
      const duration = differenceInDays(taskEnd, taskStart) + 1;
      
      return {
        name: task.title,
        start: startOffset,
        duration: duration,
        status: task.status,
        priority: task.priority,
      };
    });
  };

  const ganttData = processGanttData(tasksData, selectedProject);

  if (!tasksData?.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Project Timeline</CardTitle>
            <div className="w-[250px]">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
            No tasks found for this project
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process the data to include color based on status
  const coloredGanttData = ganttData.map(task => ({
    ...task,
    fill: (() => {
      switch (task.status.toLowerCase()) {
        case 'completed':
          return '#22c55e'; // Brighter green
        case 'in_progress':
          return '#3b82f6'; // Brighter blue
        case 'todo':
          return '#f59e0b'; // Brighter amber
        default:
          return '#6b7280'; // Nicer grey
      }
    })()
  }));

  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Project Timeline</CardTitle>
          <div className="w-[250px]">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300 transition-colors">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={coloredGanttData}
              layout="vertical"
              barSize={24}
              margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              className="font-sans"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `Day ${value}`}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'duration') {
                    const startDay = props.payload.start;
                    const endDay = props.payload.start + value - 1;
                    return [
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">{props.payload.name}</span>
                        <span className="text-sm text-gray-500">
                          Day {startDay} - Day {endDay} ({value} days)
                        </span>
                        <span className="text-sm font-medium" style={{ color: props.payload.fill }}>
                          {props.payload.status.toUpperCase()}
                        </span>
                      </div>,
                      ''
                    ];
                  }
                  return [value, name];
                }}
              />
              <Bar
                dataKey="duration"
                radius={[4, 4, 4, 4]}
                stackId="a"
                fill="#8884d8"
                fillOpacity={0.9}
              />
              <ReferenceLine 
                x={differenceInDays(new Date(), parseISO(selectedProject.start_date))} 
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ 
                  value: 'Today',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 500
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
