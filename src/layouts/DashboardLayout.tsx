import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import DecryptedText from '@/components/DecryptedText';
import Iridescence from '@/components/BackgroundAnimation';
import LiquidChrome from '@/components/LiquidChrome';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Projects',
    path: '/projects',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: 'Tasks',
    path: '/tasks',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Time Entries',
    path: '/time-entries',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Clients',
    path: '/clients',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  }
];

// Helper to get user initials
const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface DashboardChildProps {
  isDark?: boolean;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isIridescent, setIsIridescent] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Wrap children with dark mode context
  const wrappedChildren = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    return React.Children.map(childrenArray, child => {
      if (React.isValidElement<DashboardChildProps>(child)) {
        return React.cloneElement(child, {
          isDark: !isIridescent,
          ...child.props
        });
      }
      return child;
    });
  }, [children, isIridescent]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="absolute inset-0 z-0">
        {isIridescent ? (
          <Iridescence
            color={[1, 1, 1]}
            mouseReact={false}
            amplitude={0.1}
            speed={1.0}
          />
        ) : (
          <LiquidChrome 
            baseColor={[0.1, 0.1, 0.1]}
            speed={0.2}
            amplitude={0.5}
            interactive={false}
          />
        )}
      </div>
      <div className={`relative z-10 ${!isIridescent ? 'text-white' : 'text-gray-800'}`}>
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-40 flex md:hidden ${
            sidebarOpen ? 'visible' : 'invisible'
          }`}
        >
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          <div
            className={`relative flex w-full max-w-xs flex-1 flex-col ${isIridescent ? 'bg-white/50' : 'bg-gray-800/50'} backdrop-blur-sm transition-transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200/50">
              <div className={`text-xl font-semibold ${!isIridescent ? 'text-white' : 'text-gray-800'}`}>Work Vault</div>
              <button
                type="button"
                className={`${!isIridescent ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-600'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? !isIridescent 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-900'
                      : !isIridescent
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div
                    className={`mr-3 h-6 w-6 ${
                      location.pathname === item.path 
                        ? !isIridescent ? 'text-white' : 'text-gray-500'
                        : !isIridescent ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className={`flex min-h-0 flex-1 flex-col border-r border-gray-200/50 ${isIridescent ? 'bg-white/50' : 'bg-gray-800/50'} backdrop-blur-sm`}>
            <div className="flex h-16 items-center px-4 border-b border-gray-200/50">
              <div className={`text-xl font-semibold ${!isIridescent ? 'text-white' : 'text-gray-800'}`}>
                <DecryptedText
                  text="Work Vault"
                  animateOn="view"
                  revealDirection="center"
                />
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? !isIridescent 
                        ? 'bg-gray-900/50 text-white' 
                        : 'bg-gray-900/10 text-gray-900'
                      : !isIridescent
                        ? 'text-gray-300 hover:bg-gray-900/30 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-900/5 hover:text-gray-900'
                  }`}
                >
                  <div
                    className={`mr-3 h-6 w-6 ${
                      location.pathname === item.path 
                        ? !isIridescent ? 'text-white' : 'text-gray-700'
                        : !isIridescent ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-center border-t border-gray-200/50">
              <div className={`h-10 ${!isIridescent ? 'text-gray-300' : 'text-gray-600'}`}>
                Support the <a href="https://rananjaysingh20.github.io/" target="_blank" className="text-brand-blue hover:text-brand-blue/80 transition-colors">developer</a>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col md:pl-64">
          <div className={`sticky top-0 z-10 ${isIridescent ? 'bg-white/50' : 'bg-gray-800/50'} backdrop-blur-sm pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden`}>
            <button
              type="button"
              className={`-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md ${
                !isIridescent ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <main className="flex-1 overflow-hidden">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 min-w-0">
                {/* User profile dropdown */}
                <div className="flex justify-end mb-4 items-center gap-4">
                  {/* Theme toggle button */}
                  <button
                    onClick={() => setIsIridescent(!isIridescent)}
                    className={`px-3 py-1.5 rounded-lg ${
                      isIridescent 
                        ? 'bg-white/50 border-gray-200/50 text-gray-700 hover:bg-white/60' 
                        : 'bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-800/60'
                    } backdrop-blur-sm border text-sm font-medium transition-colors`}
                  >
                    {isIridescent ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  </button>
                  
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => setShowMenu((v) => !v)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className={`h-8 w-8 rounded-full ${isIridescent ? 'bg-gray-200' : 'bg-gray-700'} flex items-center justify-center ${!isIridescent ? 'text-white' : ''}`}>
                        {getInitials(user?.full_name)}
                      </div>
                    </button>
                    {showMenu && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                        isIridescent ? 'bg-white' : 'bg-gray-800'
                      } ring-1 ring-black ring-opacity-5 z-10`}>
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className={`block w-full px-4 py-2 text-left text-sm ${
                              !isIridescent 
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Page content wrapper */}
                <div className="overflow-x-auto">
                  {wrappedChildren}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
