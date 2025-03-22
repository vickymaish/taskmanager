import React from "react";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import useDescriptionTitle from "../hooks/useDescriptionTitle";
import { Task } from "../../interfaces";

interface HomeProps {
  tasks: Task[];
}

const Home: React.FC<HomeProps> = ({ tasks }) => {
  useDescriptionTitle("Organize your tasks", "All tasks");
  return <LayoutRoutes title="All tasks" tasks={tasks} />;
};

export default Home;