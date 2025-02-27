import { configureStore } from "@reduxjs/toolkit";
import tasksReducer, { tasksMiddleware } from "./Tasks.store"; // Import tasksMiddleware
import modalReducer from "./Modal.store";
import menuReducer from "./Menu.store";

const store = configureStore({
  reducer: { tasks: tasksReducer, modal: modalReducer, menu: menuReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tasksMiddleware), // Use tasksMiddleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
