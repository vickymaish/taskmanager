import React, { useState, useEffect } from "react";
import { Task } from "../../interfaces";
import useDescriptionTitle from "../hooks/useDescriptionTitle";
import LayoutRoutes from "../Utilities/LayoutRoutes";

interface ImportantTasksProps {
  tasks: Task[];
}

const ImportantTasks: React.FC<ImportantTasksProps> = ({ tasks }) => {
  const [importantTasks, setImportantTasks] = useState<Task[]>([]);

  useEffect(() => {
    const filteredTasks: Task[] = tasks.filter((task: Task) => task.important);
    setImportantTasks(filteredTasks);
  }, [tasks]);

  useDescriptionTitle("Tasks marked as important", "Important tasks");

  return <LayoutRoutes title="Important tasks" tasks={importantTasks} />;
};

export default ImportantTasks;