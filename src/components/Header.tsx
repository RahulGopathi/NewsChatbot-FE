import React from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiRefreshCw } from "react-icons/fi";

interface HeaderProps {
  onResetSession: () => void;
}

const Header: React.FC<HeaderProps> = ({ onResetSession }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-[#1a1f2c] text-white border-b border-gray-700">
      <div className="flex items-center">
        <div className="text-xl font-medium">
          Welcome back, <span className="font-bold">Rahul Gopathi</span>{" "}
          <span className="ml-1">👋</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onResetSession}
          className="flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
          title="Reset Session"
        >
          <FiRefreshCw className="h-4 w-4 mr-2" />
          <span>New Chat</span>
        </button>

        <IoMdNotificationsOutline className="h-6 w-6" />

        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
          <span>RG</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
