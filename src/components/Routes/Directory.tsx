import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Task } from "../../interfaces";
import { useAppSelector } from "../../store/hooks";
import useDescriptionTitle from "../hooks/useDescriptionTitle";
import LayoutRoutes from "../Utilities/LayoutRoutes";

interface DirectoryProps {
  tasks: Task[];
}

const Directory: React.FC<DirectoryProps> = ({ tasks }) => {
  const directories = useAppSelector((state) => state.tasks.directories);
  const params = useParams();
  const navigate = useNavigate();

  const [tasksInCurrentDirectory, setTasksInCurrentDirectory] = useState<Task[]>([]);

  useEffect(() => {
    if (!params.dir) {
      navigate("/");
      return;
    }

    const dirExists = directories.includes(params.dir);
    if (!dirExists) {
      navigate("/");
    }

    const tasksFiltered = tasks.filter((task: Task) => task.dir === params.dir);
    setTasksInCurrentDirectory(tasksFiltered);
  }, [directories, navigate, params.dir, tasks]);

  useDescriptionTitle(
    `Tasks in "${params.dir}"`,
    params.dir ? params.dir + " directory" : ""
  );

  return (
    <LayoutRoutes
      title={`${params.dir}'s tasks`}
      tasks={tasksInCurrentDirectory}
    />
  );
};

export default Directory;