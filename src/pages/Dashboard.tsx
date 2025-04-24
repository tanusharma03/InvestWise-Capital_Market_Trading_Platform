import { LineChart, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PortfolioSection } from "@/components/portfolio/PortfolioSection";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AddFundsCard } from "@/components/dashboard/AddFundsCard";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LeftSideMenu from "@/components/dashboard/LeftSideMenu";
import { BalanceDisplay } from "@/components/dashboard/BalanceDisplay"; // Import BalanceDisplay

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'market' | 'portfolio'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return null;
      }
      return user;
    }
  });

  const { data: userBalance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      // Replace with actual API call or logic to get the user's balance
      return 10000; // Dummy balance
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const getUserName = (email) => {
    return email ? email.split("@")[0] : "User";
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>      
      <header className="w-full bg-white dark:bg-gray-800 shadow-md py-3 px-4 flex items-center gap-2 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span className="text-2xl font-bold text-gray-800 dark:text-white">InvestWise</span>
      </header>

      <div className="flex flex-1">
        <LeftSideMenu 
          profile={{ name: getUserName(userData?.email) }} 
          onLogout={handleLogout} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />

        <main className="flex-1 p-6 md:ml-64">
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Search stocks, mutual funds, or bonds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setShowSearchResults(true)}
              className="flex-1"
            />
            <Button onClick={() => setShowSearchResults(true)} className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>

          {/* Account balance displayed here below the search bar */}
          <BalanceDisplay balance={userBalance || 0} /> 

          {showSearchResults ? (
            <Card className="p-6">
              <div className="text-center">Search results for "{searchQuery}"</div>
            </Card>
          ) : (
            view === 'market' ? (
              <MarketOverview />
            ) : (
              <PortfolioSection />
            )
          )}

          <AddFundsCard onAddFunds={() => navigate("/add-funds")} />
        </main>
      </div>
    </div>
  );
}
