import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
// @ts-ignore
import type { RootState, AppDispatch } from "./index.tsx";
import { tasksActions } from "./Tasks.store";
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export { tasksActions };