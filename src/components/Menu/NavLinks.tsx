import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Add useAppSelector
import { tasksActions } from "../../store/Tasks.store";
import { TaskFilter } from "../../store/Tasks.store";

const links = [
  { name: "Today's tasks", filter: 'today' as TaskFilter },
  { name: "All tasks", filter: 'all' as TaskFilter },
  { name: "Important tasks", filter: 'important' as TaskFilter },
  { name: "Completed tasks", filter: 'completed' as TaskFilter },
  { name: "Uncompleted tasks", filter: 'uncompleted' as TaskFilter },
  { name: "📊 Statistics", path: "/statistics" },
];

interface NavLinksProps {
  classActive: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ classActive }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentFilter = useAppSelector((state) => state.tasks.currentFilter); // Get filter from Redux

  const handleClick = (item: typeof links[0]) => {
    if (item.filter) {
      dispatch(tasksActions.setFilter(item.filter)); // Dispatch to Redux only
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav>
      <ul className="grid gap-2">
        {links.map((link) => (
          <li key={link.name}>
            <button
              onClick={() => handleClick(link)}
              className={`px-4 py-2 w-full block transition hover:text-rose-600 dark:hover:text-slate-200 text-left ${
                link.filter === currentFilter ? classActive : ""
              }`}
            >
              {link.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;