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
  isDark?: boolean;
}

const RecentActivity = ({ projects, isLoading = false, error = null, isDark = false }: RecentActivityProps) => {
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
      <Card isDark={isDark}>
        <CardHeader isDark={isDark}>
          <CardTitle isDark={isDark}>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent isDark={isDark}>
          <div className="h-[300px] w-full space-y-4">
            <Skeleton className={`w-full h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <Skeleton className={`w-full h-[250px] ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card isDark={isDark}>
        <CardHeader isDark={isDark}>
          <CardTitle isDark={isDark}>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent isDark={isDark}>
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
      <Card isDark={isDark}>
        <CardHeader isDark={isDark}>
          <CardTitle isDark={isDark}>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent isDark={isDark}>
          <div className={`h-[300px] w-full flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
    
    return tasks.map(task => {
      const taskStart = parseISO(task.created_at);
      const taskEnd = parseISO(task.due_date);
      
      // Calculate days from project start (day 1) to task dates
      const startOffset = Math.max(0, differenceInDays(taskStart, projectStart) + 1);
      // Calculate duration from task start to task end
      const endOffset = Math.max(0, differenceInDays(taskEnd, projectStart) + 1);
      const duration = endOffset - startOffset + 1;
      
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
      <Card isDark={isDark}>
        <CardHeader isDark={isDark}>
          <div className="flex justify-between items-center">
            <CardTitle isDark={isDark}>Project Timeline</CardTitle>
            <div className="w-[250px]">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className={isDark ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-200'}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}>
                  {projects.map((project) => (
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
          </div>
        </CardHeader>
        <CardContent isDark={isDark}>
          <div className={`h-[300px] w-full flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
    <Card isDark={isDark} className="shadow-md">
      <CardHeader isDark={isDark} className="pb-2 border-b border-gray-200/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle isDark={isDark} className="text-lg font-semibold">Project Timeline</CardTitle>
          <div className="w-full sm:w-[250px]">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className={`transition-colors ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700 text-white hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}>
                {projects.map((project) => (
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
        </div>
      </CardHeader>
      <CardContent isDark={isDark}>
        <div className="h-[400px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={coloredGanttData}
              layout="vertical"
              barSize={28}
              margin={{ 
                top: 10, 
                right: 10, 
                left: 10, 
                bottom: 10 
              }}
              className="font-sans"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke={isDark ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `Day ${value}`}
                tick={{ 
                  fill: isDark ? '#9CA3AF' : '#6B7280', 
                  fontSize: 12 
                }}
                axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                tickLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
                padding={{ left: 0, right: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ 
                  fill: isDark ? '#F3F4F6' : '#374151', 
                  fontSize: 13, 
                  fontWeight: 500,
                  textAnchor: 'end'
                }}
                tickFormatter={(value) => {
                  if (value.length > 20) {
                    return value.slice(0, 20) + '...';
                  }
                  return value;
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: isDark ? '#1F2937' : '#f3f4f6' }}
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  color: isDark ? '#F3F4F6' : 'inherit'
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'duration') {
                    const startDay = props.payload.start;
                    const endDay = startDay + value - 1;
                    return [
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          Day {startDay} - Day {endDay} ({value} days)
                        </span>
                        <span className="text-sm font-medium" style={{ color: props.payload.fill }}>
                          {props.payload.status.toUpperCase()}
                        </span>
                      </div>
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
                x={differenceInDays(new Date(), parseISO(selectedProject.start_date)) + 1}
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
