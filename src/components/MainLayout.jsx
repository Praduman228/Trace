import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 pt-safe bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6 z-40" style={{ height: "calc(4rem + env(safe-area-inset-top, 0px))" }}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100/50 active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Trace
          </span>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-72 min-h-screen w-full pt-[calc(4rem + env(safe-area-inset-top, 0px))] lg:pt-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
