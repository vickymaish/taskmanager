import { useEffect, useState } from "react";
import { Task } from "../../interfaces";
import { useAppSelector } from "../../store/hooks";

const useSearchQuery = (searchQuery: string) => {
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const [matchedTasks, setMatchedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!searchQuery.trim().length) {
      setMatchedTasks([]);
      return;
    }

    const filteredTasks = tasks.filter((task: Task) => {
      if (!task.title) {
        console.warn("Task with missing title:", task);
        return false;
      }
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setMatchedTasks(filteredTasks);
  }, [searchQuery, tasks]);

  return matchedTasks;
};

export default useSearchQuery;
