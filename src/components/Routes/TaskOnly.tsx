import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Task } from "../../interfaces";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import useDescriptionTitle from "../hooks/useDescriptionTitle";

interface TaskOnlyProps {
  tasks: Task[];
}

interface LocationState {
  fromSearch?: boolean;
  searchTasks?: Task[];
}

interface LayoutRoutesProps {
  title: string;
  tasks: Task[];
  // Make highlightedTaskId optional if LayoutRoutes doesn't always expect it
  highlightedTaskId?: string;
}

const TaskOnly: React.FC<TaskOnlyProps> = ({ tasks }) => {
  const params = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [matchedTask, setMatchedTask] = useState<Task[]>([]);

  useEffect(() => {
    const taskId = params.taskId;
    const tasksToSearch = state?.searchTasks || tasks;
    const filteredTask = tasksToSearch.filter((task: Task) => task.id === taskId);
    
    if (!filteredTask.length) {
      navigate("/", { replace: true });
      return;
    }
    setMatchedTask(filteredTask);
  }, [navigate, params.taskId, tasks, state]);

  const title = matchedTask.length ? matchedTask[0].title : "";

  useDescriptionTitle(`Searching for ${title}`, "Task " + title);

  return (
    <div className="px-4">
      {state?.fromSearch && (
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 text-rose-600 hover:underline flex items-center"
        >
          <span className="mr-1">←</span> Back to search results
        </button>
      )}
      <LayoutRoutes 
        title={title} 
        tasks={matchedTask} 
        {...(params.taskId ? { highlightedTaskId: params.taskId } : {})}
      />
    </div>
  );
};

export default TaskOnly;