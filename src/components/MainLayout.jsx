import React from "react";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 ml-72 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
