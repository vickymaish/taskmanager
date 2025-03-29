import React, { useState } from "react";

interface SearchFieldProps {
  onSearchChange: (query: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ onSearchChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchChange(value);
  };

  return (
    <div className="flex w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search task..."
        className="bg-transparent border-b-2 border-slate-400 focus:outline-none focus:border-rose-400 w-full"
      />
    </div>
  );
};

export default SearchField;