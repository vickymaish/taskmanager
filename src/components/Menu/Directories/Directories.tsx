import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import { Task } from "../../../interfaces";

const ContentDirectories: React.FC<{ classActive: string }> = ({ classActive }) => {
  const directories = useAppSelector((state) => state.tasks.directories);
  const location = useLocation();

  return (
    <ul className="max-h-36 overflow-auto">
      {directories.map((dir: string) => {
        // Check if current path matches directory path
        const isActive = location.pathname === `/tasks/dir/${dir}`;
        
        return (
          <li key={dir} className="flex items-center pr-4 pl-9 py-1">
            <Link
              to={`/tasks/dir/${dir}`}
              className={`w-full hover:text-rose-600 dark:hover:text-slate-200 ${
                isActive ? classActive : ""
              }`}
            >
              {dir}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ContentDirectories;