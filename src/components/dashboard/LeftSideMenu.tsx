import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Moon, Sun, Menu, LineChart, Grid, List, LogOut, TrendingUp, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftSideMenuProps {
  profile?: { email: string };
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LeftSideMenu({ profile, onLogout, darkMode, toggleDarkMode }: LeftSideMenuProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMenuToggle = () => setIsExpanded(!isExpanded);
  const activeLinkClass = "bg-blue-100 text-blue-600 font-semibold dark:bg-gray-700 dark:text-white";

  return (
    <div className={`fixed top-0 left-0 h-full shadow-md transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'} flex flex-col justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>      
      <div>
        <button className="p-4 focus:outline-none" onClick={handleMenuToggle}>
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>

        {isExpanded && (
          <div className="px-4 py-2 text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            Hello, {profile?.email || "User"}
          </div>
        )}

        <nav className="mt-4 space-y-2">
          {[
            { label: "Dashboard", path: "/dashboard", icon: <LineChart className="h-5 w-5" /> },
            { label: "My Portfolio", path: "/portfolio", icon: <Grid className="h-5 w-5" /> },
            { label: "Watchlist", path: "/watchlist", icon: <List className="h-5 w-5" /> },
            { label: "Stocks", path: "/stocks", icon: <TrendingUp className="h-5 w-5" /> },
            { label: "Mutual Funds", path: "/mutual-funds", icon: <DollarSign className="h-5 w-5" /> },
            { label: "Bonds", path: "/bonds", icon: <Shield className="h-5 w-5" /> }
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center gap-3 p-2 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-300 ${isActive ? activeLinkClass : ''}`}
            >
              {item.icon}
              {isExpanded && item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mb-4 px-4">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-300 mb-2"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {isExpanded && (darkMode ? "Light Mode" : "Dark Mode")}
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start text-red-500 hover:bg-red-100 dark:hover:bg-red-700 transition duration-300"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          {isExpanded && "Logout"}
        </Button>
      </div>
    </div>
  );
}
