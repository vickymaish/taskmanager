import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DoneTasks from "../Routes/DoneTasks";
import Home from "../Routes/Home";
import ImportantTasks from "../Routes/ImportantTasks";
import SearchResults from "../Routes/SearchResults";
import TodaysTasks from "../Routes/TodaysTasks";
import Directory from "../Routes/Directory";
import HeaderTasks from "./HeaderTasks";
import { useAppSelector } from "../../store/hooks";
import { Task } from "../../interfaces";
import LayoutRoutes from "../Utilities/LayoutRoutes";

const TasksSection: React.FC = () => {
  const { tasks, currentFilter } = useAppSelector((state) => state.tasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((task: Task) => {
    const today = new Date().toISOString().split("T")[0];
    switch (currentFilter) {
      case "today": return task.date === today;
      case "important": return task.important;
      case "completed": return task.completed;
      case "uncompleted": return !task.completed;
      default: return true;
    }
  });

  const searchResults = searchQuery 
    ? tasks.filter((task: Task) => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSearchQuery("");
  };

  const handleBackToResults = () => {
    setSelectedTask(null);
  };

  return (
    <main className="pt-5 pb-8 sm:pb-16 px-3 md:px-8 md:w-full xl:w-8/12 m-auto min-h-screen">
      <HeaderTasks onSearchChange={setSearchQuery} />
      
      {selectedTask ? (
        <div>
          <button 
            onClick={handleBackToResults}
            className="mb-4 text-rose-600 hover:underline"
          >
            ← Back to results
          </button>
          <LayoutRoutes title={selectedTask.title} tasks={[selectedTask]} />
        </div>
      ) : searchQuery ? (
        <SearchResults 
          tasks={searchResults} 
          onTaskSelect={handleTaskSelect}
        />
      ) : (
        <Routes>
          <Route path="/" element={<Home tasks={filteredTasks} />} />
          <Route path="/today" element={<TodaysTasks tasks={filteredTasks} />} />
          <Route path="/important" element={<ImportantTasks tasks={filteredTasks} />} />
          <Route path="/completed" element={<DoneTasks done={true} title="Completed tasks" tasks={filteredTasks} />} />
          <Route path="/uncompleted" element={<DoneTasks done={false} title="Uncompleted tasks" tasks={filteredTasks} />} />
          <Route path="/dir/:dir" element={<Directory tasks={filteredTasks} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </main>
  );
};

export default TasksSection;