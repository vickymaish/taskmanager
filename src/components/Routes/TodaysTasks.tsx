import React from "react";
import { Task } from "../../interfaces";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import useDescriptionTitle from "../hooks/useDescriptionTitle";

interface TodaysTasksProps {
  tasks: Task[];
}

const TodaysTasks: React.FC<TodaysTasksProps> = ({ tasks }) => {
  const today = new Date().toISOString().split("T")[0];
  const todaysTasks = tasks.filter((task) => task.date === today);

  useDescriptionTitle("Today's tasks", "Today's tasks");

  return <LayoutRoutes title="Today's tasks" tasks={todaysTasks} />;
};

export default TodaysTasks;