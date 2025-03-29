import { RootState } from "../store"; // Points to your root reducer
import { Task } from "../interfaces";

export const selectCurrentFilter = (state: RootState) => state.tasks.currentFilter;

export const selectFilteredTasks = (state: RootState) => {
  const { tasks, currentFilter } = state.tasks;
  const today = new Date().toISOString().split('T')[0];
  
  switch(currentFilter) {
    case 'today': 
      return tasks.filter((task: Task) => task.date === today);
    case 'important':
      return tasks.filter((task: Task) => task.important);
    case 'completed':
      return tasks.filter((task: Task) => task.completed);
    case 'uncompleted':
      return tasks.filter((task: Task) => !task.completed);
    default:
      return tasks;
  }
};