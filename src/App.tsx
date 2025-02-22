import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AccountData from "./components/AccountSection/AccountData";
import Footer from "./components/Footer";
import Menu from "./components/Menu/Menu";
import TasksSection from "./components/TasksSection/TasksSection";
import ModalCreateTask from "./components/Utilities/ModalTask";
import Login from "./pages/login";
import { Task } from "./interfaces";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { modalActions } from "./store/Modal.store";
import { tasksActions } from "./store/Tasks.store";
import Statistics from "./pages/statistics"; // ✅ Import Statistics page

const App: React.FC = () => {
  const modal = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const closeModalCreateTask = () => {
    dispatch(modalActions.closeModalCreateTask());
  };

  const createNewTaskHandler = (task: Task) => {
    dispatch(tasksActions.addNewTask(task));
  };

  return (
    <Routes>
      {/* Redirect from `/` to `/login` only if not authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/tasks" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/tasks" replace /> : <Login />
        }
      />

      {/* Protected Tasks Route */}
      <Route
        path="/tasks"
        element={
          isAuthenticated ? (
            <div className="bg-slate-200 min-h-screen text-slate-600 dark:bg-slate-900 dark:text-slate-400 xl:text-base sm:text-sm text-xs">
              {modal.modalCreateTaskOpen && (
                <ModalCreateTask
                  onClose={closeModalCreateTask}
                  nameForm="Add a task"
                  onConfirm={createNewTaskHandler}
                />
              )}
              <Menu />
              <TasksSection />
              <Footer />
              <AccountData />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ New Statistics Route (Protected) */}
      <Route
        path="/statistics"
        element={isAuthenticated ? <Statistics /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
