import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Directory from "../Routes/Directory";
import DoneTasks from "../Routes/DoneTasks";
import Home from "../Routes/Home";
import ImportantTasks from "../Routes/ImportantTasks";
import SearchResults from "../Routes/SearchResults";
import TaskOnly from "../Routes/TaskOnly";
import TodaysTasks from "../Routes/TodaysTasks";
import HeaderTasks from "./HeaderTasks";
import { Task } from "../../interfaces";

interface TasksSectionProps {
  tasks: Task[];
}

const TasksSection: React.FC<TasksSectionProps> = ({ tasks }) => {
  return (
    <main className="pt-5 pb-8 sm:pb-16 px-3 md:px-8 md:w-full xl:w-8/12 m-auto min-h-screen">
      <HeaderTasks />
      <Routes>
        <Route path="/" element={<Home tasks={tasks} />} />
        <Route path="/today" element={<TodaysTasks tasks={tasks} />} />
        <Route path="/important" element={<ImportantTasks tasks={tasks} />} />
        <Route
          path="/completed"
          element={<DoneTasks done={true} title="Completed tasks" tasks={tasks} />}
        />
        <Route
          path="/uncompleted"
          element={<DoneTasks done={false} title="Uncompleted tasks" tasks={tasks} />}
        />
        <Route path="/results" element={<SearchResults tasks={tasks} />} />
        <Route path="/dir/:dir" element={<Directory tasks={tasks} />} />
        <Route path="/task/:taskId" element={<TaskOnly tasks={tasks} />} />
        <Route path="*" element={<Navigate to="" />} />
      </Routes>
    </main>
  );
};

export default TasksSection;