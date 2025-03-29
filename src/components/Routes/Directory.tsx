import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import LayoutRoutes from "../Utilities/LayoutRoutes";
import { Task } from "../../interfaces";

const Directory: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const { dir } = useParams<{ dir: string }>();
  const directories = useAppSelector((state) => state.tasks.directories);
  const allTasks = useAppSelector((state) => state.tasks.tasks);

  // Always treat undefined/null dir as "Main"
  const effectiveDir = dir || 'Main';
  
  // Enhanced debug logs with proper typing
  console.log("Effective directory:", effectiveDir);
  console.log("All tasks:", allTasks.map((t: Task) => ({ 
    id: t.id, 
    dir: t.dir,
    title: t.title 
  })));

  // Filter tasks - handle both undefined and "Main" cases
  const dirTasks = allTasks.filter((task: Task) => {
    const taskDir = (task.dir || 'main').trim().toLowerCase();
    const targetDir = effectiveDir.trim().toLowerCase();
    
    console.log(`Comparing: ${taskDir} === ${targetDir} (task ID: ${task.id})`);
    return taskDir === targetDir;
  });

  console.log("Filtered tasks count:", dirTasks.length);
  console.log("Filtered tasks details:", dirTasks.map((t: Task) => t.id));
  
  return <LayoutRoutes title={`${effectiveDir} tasks`} tasks={dirTasks} />;
};
export default Directory;