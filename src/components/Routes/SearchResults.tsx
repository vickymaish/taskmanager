import React from "react";
import { Task } from "../../interfaces";

interface SearchResultsProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ tasks, onTaskSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task: Task) => (
        <div 
          key={task.id} 
          className="p-4 border rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onTaskSelect(task)}
        >
          <div className="text-lg font-medium text-rose-600">{task.title}</div>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
          )}
          <p className="text-sm text-slate-500 mt-2">
            In: <span className="text-slate-600 dark:text-slate-300">{task.dir}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;