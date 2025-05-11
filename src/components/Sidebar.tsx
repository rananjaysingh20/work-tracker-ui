
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Clock, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      to: "/",
    },
    {
      label: "Clients",
      icon: <Users size={20} />,
      to: "/clients",
    },
    {
      label: "Projects",
      icon: <FolderKanban size={20} />,
      to: "/projects",
    },
    {
      label: "Time Entries",
      icon: <Clock size={20} />,
      to: "/time-entries",
    },
    {
      label: "Payments",
      icon: <CreditCard size={20} />,
      to: "/payments",
    },
    {
      label: "Settings",
      icon: <Settings size={20} />,
      to: "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        {!collapsed && (
          <h2 className="font-bold text-lg text-brand-blue">WorkTracker</h2>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-2.5 gap-3 transition-all",
                    isActive 
                      ? "bg-brand-light text-brand-blue font-medium" 
                      : "text-gray-600 hover:bg-gray-100",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center">
            <span className="font-medium">JD</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
