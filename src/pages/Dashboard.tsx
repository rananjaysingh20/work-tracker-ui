import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projects, tasks, timeEntries } from '../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CountUp from '@/components/CountUp';
import DecryptedText from '@/components/DecryptedText';
import RecentActivity from '@/components/RecentActivity';

export function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log("Dashboard - Fetching projects...");
      try {
        const data = await projects.getAll();
        console.log("Dashboard - Projects API response:", data);
        return data;
      } catch (error) {
        console.error("Dashboard - Error fetching projects:", error);
        throw error;
      }
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => tasks.getAll(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: timeEntriesData } = useQuery({
    queryKey: ['timeEntries', selectedProjectId],
    queryFn: () => timeEntries.getAll(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: activeTasksData } = useQuery({
    queryKey: ['activeTasks'],
    queryFn: () => tasks.getActive(),
  });

  const stats = [
    {
      name: 'Total Projects',
      value: projectsData?.length || 0,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      link: '/projects',
    },
    {
      name: 'Active Tasks',
      value: activeTasksData?.length || 0,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/tasks',
    },
    {
      name: 'Total Hours',
      value: timeEntriesData?.reduce((acc: number, entry: any) => acc + entry.duration, 0) || 0,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/time-entries',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        <DecryptedText
          text="Dashboard"
          animateOn="view"
          revealDirection="center"
        />
      </h1>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <div className="h-6 w-6 text-white">{stat.icon}</div>
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                <DecryptedText
                  text={stat.name}
                  animateOn="view"
                  revealDirection="center"
                />
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                <CountUp
                  from={0}
                  to={stat.value}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                  onStart={() => {}}
                  onEnd={() => {}}
                />
              </p>
            </dd>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Timeline Tracking</h2>
        <div className="mt-4">
          <RecentActivity 
            projects={projectsData || []} 
            isLoading={projectsLoading}
            error={projectsError as Error | null}
          />
        </div>
      </div>
    </div>
  );
} 