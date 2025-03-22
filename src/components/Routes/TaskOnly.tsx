import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "../../interfaces";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import useDescriptionTitle from "../hooks/useDescriptionTitle"; // Add this import

interface TaskOnlyProps {
  tasks: Task[];
}

const TaskOnly: React.FC<TaskOnlyProps> = ({ tasks }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [matchedTask, setMatchedTask] = useState<Task[]>([]);

  useEffect(() => {
    const taskId = params.taskId;
    const filteredTask = tasks.filter((task: Task) => taskId === task.id);
    if (!filteredTask.length) {
      navigate("/");
    }
    setMatchedTask(filteredTask);
  }, [navigate, params.taskId, tasks]);

  const title = matchedTask.length ? matchedTask[0].title : "";

  useDescriptionTitle(`Searching for ${title}`, "Task " + title); // Use the hook

  return <LayoutRoutes title={title} tasks={matchedTask} />;
};

export default TaskOnly;