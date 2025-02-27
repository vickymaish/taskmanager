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

// ✅ Corrected ProjectStats structure
interface ProjectStats {
  name: string;
  timeSpent: string;
  link: string;
}

// 🔹 Reusable Project Card Component
const ProjectCard: React.FC<ProjectStats> = ({ name, timeSpent, link }) => (
  <a
    href={link}
    className="block bg-gradient-to-r from-gray-800 via-gray-900 to-black p-5 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 dark:bg-gray-900"
  >
    <div className="flex flex-col">
      <h3 className="text-lg font-bold text-white">{name}</h3>
      <h4 className="text-sm text-gray-400">{timeSpent}</h4>
    </div>
  </a>
);

const Statistics: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  
  const [projects, setProjects] = useState<ProjectStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:10000/api/stats");
        console.log("Raw API Response:", response.data);
  
        const apiData = response.data?.stats?.data;
        console.log("Extracted Data:", apiData);
  
        if (!apiData || !apiData.languages || !apiData.projects) {
          console.warn("⚠️ No valid data found in API response.");
          return;
        }
  
        console.log("Languages:", apiData.languages);
        console.log("Projects:", apiData.projects);
  
        // Process Language Data
        const languageData: LanguageStats[] = apiData.languages;
        setChartData({
          labels: languageData.map((lang) => lang.name),
          datasets: [
            {
              label: "Hours Spent",
              data: languageData.map((lang) => lang.total_seconds / 3600), // Convert to hours
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        });
  
        // Process Project Data
        const projectData: any[] = apiData.projects;
        const formattedProjects = projectData.map((project) => ({
          name: project.name,
          timeSpent: `${Math.floor(project.total_seconds / 3600)} hrs ${Math.floor((project.total_seconds % 3600) / 60)} mins`,
          link: `/projects/${encodeURIComponent(project.name)}?start=2025-02-19&end=2025-02-25`,
        }));
  
        setProjects(formattedProjects);
      } catch (error) {
        console.error("❌ Error fetching WakaTime data:", error);
      }
    };
  
    fetchData();
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 dark:bg-black dark:text-white min-h-screen">
      <DarkMode />
      <h2 className="text-3xl font-bold">Coding Stats (Last 7 Days)</h2>

      {/* 🔹 Bar Chart */}
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { labels: { color: "white", font: { size: 14 } } },
            },
            scales: {
              x: { ticks: { color: "white", font: { size: 12 } } },
              y: { ticks: { color: "white", font: { size: 12 } } },
            },
          }}
        />
      </div>

      {/* 🔹 Projects List */}
      <div id="projects" className="mt-6 grid gap-6">
        <h3 className="text-2xl font-semibold">Projects</h3>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <ProjectCard
              key={index}
              name={project.name}
              timeSpent={project.timeSpent}
              link={project.link}
            />
          ))
        ) : (
          <p className="text-gray-400">No project data available.</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;
