import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import DarkMode from "../components/AccountSection/DarkMode"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

<DarkMode/>

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the structure of the data received from the backend
interface LanguageStats {
  name: string;
  total_seconds: number;
}

// Define the structure for Chart.js data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

const Statistics: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from your backend API
        const response = await axios.get("https://tasks-app-backend-v1.onrender.com/api/stats");
        
        const { data } = response.data;  
        const languages: LanguageStats[] = data.languages;
        const languageNames = languages.map((lang) => lang.name);
        const durations = languages.map((lang) => lang.total_seconds / 3600); // Convert to hours

        setChartData({
          labels: languageNames,
          datasets: [
            {
              label: "Hours Spent",
              data: durations,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching WakaTime data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl mb-4">Coding Statistics (Last 7 Days)</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default Statistics;
