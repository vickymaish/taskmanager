const useDate = (date?: string): string => {
  if (!date) return "N/A"; // Return "N/A" if date is missing

  try {
    // Ensure proper ISO format handling
    const fullDate = new Date(date);

    if (isNaN(fullDate.getTime())) return "Invalid Date"; // Handle invalid dates

    const year = fullDate.getFullYear();
    const month = fullDate.getMonth() + 1;
    const day = fullDate.getDate();

    return `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export default useDate;
