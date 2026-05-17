import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, User, LogOut, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      title: "Routing",
      path: "/routine",
      icon: <CalendarDays size={22} />,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-white/70 backdrop-blur-2xl border-r border-white/20 flex flex-col z-50">
      <div className="p-8 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Trace
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold">{item.title}</span>
                </div>
                {isActive && <ChevronRight size={18} className="animate-pulse" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-gray-50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
             {user ? (
               <span className="text-primary font-bold">{user.name[0]}</span>
             ) : (
               <User size={24} className="text-gray-400" />
             )}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.name || "User Profile"}</p>
            <p className="text-xs text-gray-400 font-medium truncate">{user?.email || "Pro Plan"}</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/signup";
          }}
          className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
