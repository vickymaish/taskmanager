import React from "react";
import { Task } from "../../interfaces";
import useCompletedTasks from "../hooks/useCompletedTasks";
import useDescriptionTitle from "../hooks/useDescriptionTitle";
import LayoutRoutes from "../Utilities/LayoutRoutes";

interface DoneTasksProps {
  done: boolean;
  title: string;
  tasks: Task[];
}

const DoneTasks: React.FC<DoneTasksProps> = ({ done, title, tasks }) => {
  const { tasks: tasksFiltered } = useCompletedTasks({ tasks, done });

  useDescriptionTitle("All tasks done", title);

  return <LayoutRoutes title={title} tasks={tasksFiltered} />;
};

export default DoneTasks;