import { createSlice, PayloadAction, createAsyncThunk, Middleware } from "@reduxjs/toolkit";
import { Task } from "../interfaces";

// Type for API error responses
interface ApiError {
  error?: string;
  message?: string;
  statusCode?: number;
}
// Add this type at the top of your file (with other type definitions)
// Add this type to your Tasks.store.ts
export type TaskFilter = 'all' | 'today' | 'important' | 'completed' | 'uncompleted';

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    return (error as { message?: string }).message || 'Unknown error';
  }
  return 'Unknown error';
};

// Fetch Tasks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await fetch("http://localhost:10000/api/tasks", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const data = await response.json();
  // Normalize MongoDB _id to id for frontend consistency
  return data.map((task: any) => ({
    ...task,
    id: task._id || task.id,
    // Normalize date to ISO format
    date: task.date ? new Date(task.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  }));
});

// Add Task
export const addNewTask = createAsyncThunk("tasks/addNewTask", async (task: Task) => {
  const response = await fetch("http://localhost:10000/api/tasks", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add task");
  }

  const data = await response.json();
  return { ...data, id: data._id || data.id };
});

// Remove Task
export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:10000/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error as ApiError);
      }

      return taskId;
    } catch (err) {
      return rejectWithValue({ error: getErrorMessage(err) } as ApiError);
    }
  }
);

// Toggle Task Completion
export const toggleTaskCompleted = createAsyncThunk(
  "tasks/toggleCompleted",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:10000/api/tasks/${taskId}/toggle`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error as ApiError);
      }

      const data = await response.json();
      return { ...data, id: data._id || data.id };
    } catch (err) {
      return rejectWithValue({ error: getErrorMessage(err) } as ApiError);
    }
  }
);

// Edit Task
export const editTask = createAsyncThunk(
  "tasks/editTask", 
  async (task: Task, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:10000/api/tasks/${task.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error as ApiError);
      }

      const data = await response.json();
      return { ...data, id: data._id || data.id };
    } catch (err) {
      return rejectWithValue({ error: getErrorMessage(err) } as ApiError);
    }
  }
);

// Delete All Tasks
export const deleteAllData = createAsyncThunk(
  "tasks/deleteAllData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:10000/api/tasks", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error as ApiError);
      }

      return true;
    } catch (err) {
      return rejectWithValue({ error: getErrorMessage(err) } as ApiError);
    }
  }
);

// Update your initialState interface
// Update initialState
const initialState: {
  tasks: Task[];
  directories: string[];
  currentFilter: TaskFilter;
} = {
  tasks: [],
  directories: ["Main"],
  currentFilter: 'all',
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    markAsImportant: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.important = !task.important;
      }
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.currentFilter = action.payload;
    },

// In your tasksSlice reducers, modify the createDirectory action:
    createDirectory: (state, action: PayloadAction<string>) => {
      const newDir = action.payload.trim();
      if (newDir && !state.directories.includes(newDir)) {
        state.directories = [newDir, ...state.directories];
      }
    },
    
    deleteDirectory: (state, action: PayloadAction<string>) => {
      state.directories = state.directories.filter((dir) => dir !== action.payload);
      state.tasks = state.tasks.filter((task) => task.dir !== action.payload);
    },
    editDirectoryName: (
      state,
      action: PayloadAction<{ newDirName: string; previousDirName: string }>
    ) => {
      if (!state.directories.includes(action.payload.newDirName)) {
        const index = state.directories.indexOf(action.payload.previousDirName);
        if (index !== -1) {
          state.directories[index] = action.payload.newDirName;
        }
        state.tasks.forEach((task) => {
          if (task.dir === action.payload.previousDirName) {
            task.dir = action.payload.newDirName;
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })

      .addCase(addNewTask.fulfilled, (state, action) => {
        const newTask = {
          ...action.payload,
          dir: action.payload.dir?.trim() || 'Main' // This is the key change
        };
        state.tasks = [newTask, ...state.tasks];
      })

      .addCase(fetchTasks.rejected, (state, action) => {
        console.error('Fetch tasks failed:', action.error.message);
      })
      
      .addCase(addNewTask.rejected, (state, action) => {
        console.error('Add task failed:', action.error.message);
      })
      
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        const error = action.payload as ApiError || action.error;
        console.error('Delete failed:', error.error || error.message);
      })
      
      .addCase(toggleTaskCompleted.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(toggleTaskCompleted.rejected, (state, action) => {
        const error = action.payload as ApiError || action.error;
        console.error('Toggle failed:', error.error || error.message);
      })
      
      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        const error = action.payload as ApiError || action.error;
        console.error('Edit failed:', error.error || error.message);
      })
      
      .addCase(deleteAllData.fulfilled, (state) => {
        state.tasks = [];
        state.directories = ["Main"];
      })
      .addCase(deleteAllData.rejected, (state, action) => {
        const error = action.payload as ApiError || action.error;
        console.error('Delete all failed:', error.error || error.message);
      });
  },
});

// Middleware
export const tasksMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === addNewTask.fulfilled.type) {
    console.log('New task payload:', action.payload);
  }
  const result = next(action);
  if (action.type === addNewTask.fulfilled.type) {
    console.log('State after:', store.getState().tasks);
  }
  return result;
};
// Actions and Reducer Export
export const tasksActions = { 
  ...tasksSlice.actions, 
  fetchTasks, 
  addNewTask, 
  removeTask, 
  editTask, 
  toggleTaskCompleted,
  deleteAllData 
};

export default tasksSlice.reducer;