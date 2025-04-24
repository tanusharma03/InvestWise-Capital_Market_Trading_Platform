import React, { useState } from "react";
import LeftSideMenu from "./LeftSideMenu";
import { PortfolioSection } from "@/components/portfolio/PortfolioSection";

const Portfolio = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <LeftSideMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-4">My Portfolio</h1>
          <PortfolioSection />
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
