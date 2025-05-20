import React, { useState } from "react";
import { FaPlayCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`h-screen ${
        collapsed ? "w-[60px]" : "w-[220px]"
      } bg-[#1a1f2c] text-white flex flex-col shadow-xl border-r border-gray-700/30 transition-all duration-300 ease-in-out relative`}
    >
      <div
        className={`${
          collapsed ? "py-4 px-2 justify-center" : "py-6 px-5"
        } border-b border-gray-700/50 flex flex-col`}
      >
        {!collapsed && (
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
              News
            </h1>
            <h2 className="text-3xl font-bold text-gray-100">Chatbot</h2>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <span className="text-2xl font-bold text-blue-400">N</span>
          </div>
        )}
      </div>

      <div className={`${collapsed ? "px-2" : "px-4"} pt-8`}>
        <div
          className={`flex items-center ${
            collapsed ? "justify-center px-2" : "px-4"
          } py-2.5 text-white font-medium rounded-md bg-blue-600/20 border-l-4 border-blue-500 hover:bg-blue-600/30 transition-colors cursor-pointer`}
        >
          <FaPlayCircle className="h-5 w-5 text-blue-400" />
          {!collapsed && <span className="ml-3">Playground</span>}
        </div>

        <div className="mt-6">{/* More menu items can be added here */}</div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 rounded-full w-6 h-6 flex items-center justify-center hover:text-white transition-colors border border-gray-600 z-10 bg-[#1a1f2c] cursor-pointer"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
      </button>
    </div>
  );
};

export default Sidebar;
