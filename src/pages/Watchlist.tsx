import React, { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Search, Plus, AlertCircle, Sun, Moon, Home, List, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const POLYGON_API_KEY = 'PGnfbKFs04oIvKpplxGPCvpfw2uIMzTc';
const EXCHANGE_API_KEY = 'ef81ac52971a73fb6cdaf171';

const SideMenu = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="fixed w-64 h-full bg-white dark:bg-gray-800 shadow-lg hidden md:block">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio</h2>
        </div>
        
        <nav className="flex-1">
          <div className="px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <List className="mr-2 h-4 w-4" />
              Watchlist
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MiniGraph = ({ data, isRising }) => {
  const processedData = data?.slice(-30) || [];
  
  return (
    <div className="w-24 h-24 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isRising ? "#22c55e" : "#ef4444"}
            strokeWidth={2}
            dot={false}
            animateNewValues={true}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Watchlist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usdToInr, setUsdToInr] = useState(83); // Default fallback rate
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    // Update document class for dark mode
    document.documentElement.classList.toggle('dark');
  };
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/USD/INR`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        const data = await response.json();
        setUsdToInr(data.conversion_rate);
      } catch (err) {
        console.error("Exchange rate error:", err);
        // Keep using the default rate if fetch fails
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (err) {
        console.error("Error loading watchlist:", err);
        setError("Failed to load saved watchlist");
      }
    }
  }, []);

  // Function to format stock symbol for Indian stocks
  const formatStockSymbol = (symbol) => {
    // Remove any existing suffixes first
    const baseSymbol = symbol.split('.')[0];
    // Add .NS suffix for Indian stocks (you might want to add more conditions)
    const indianStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'WIPRO'];
    if (indianStocks.includes(baseSymbol)) {
      return `${baseSymbol}.NS`;
    }
    return baseSymbol;
  };

  // Update prices for watchlist items
  useEffect(() => {
    const fetchCurrentPrices = async () => {
      if (watchlist.length === 0) return;
      setIsLoading(true);

      try {
        const updatedWatchlist = await Promise.all(
          watchlist.map(async (item) => {
            try {
              const response = await fetch(
                `https://api.polygon.io/v2/aggs/ticker/${item.symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
              );

              if (!response.ok) {
                throw new Error(`API request failed for ${item.symbol}`);
              }

              const data = await response.json();

              if (data.results && data.results[0]) {
                const result = data.results[0];
                const previousClose = result.c;
                const previousDay = result.pc || result.o;
                const changePercent = ((previousClose - previousDay) / previousDay * 100).toFixed(2);

                return {
                  ...item,
                  currentPrice: previousClose,
                  change: changePercent
                };
              }
              return item;
            } catch (err) {
              console.error(`Error updating ${item.symbol}:`, err);
              return item;
            }
          })
        );

        setWatchlist(updatedWatchlist);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      } catch (err) {
        console.error("Error updating prices:", err);
        setError("Failed to update prices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentPrices();
    const interval = setInterval(fetchCurrentPrices, 300000); // update every 5 minutes
    return () => clearInterval(interval);
  }, [watchlist.length]);

  const searchStocks = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setError(null);

    try {
      const formattedQuery = searchQuery.toUpperCase();
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers?search=${formattedQuery}&active=true&sort=ticker&order=asc&limit=10&apiKey=${POLYGON_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setError("No results found");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search stocks: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const addToWatchlist = async (symbol, name) => {
    setError(null);
    setIsLoading(true);
  
    try {
      const formattedSymbol = formatStockSymbol(symbol);
      
      if (watchlist.some(item => item.symbol === formattedSymbol)) {
        setError("Stock already in watchlist");
        return;
      }
  
      // Get today's date and 30 days ago for historical data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
      // Fetch price data first
      const priceResponse = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (!priceResponse.ok) throw new Error("Failed to fetch stock price data");
      const priceData = await priceResponse.json();
  
      // Initialize variables for price calculation
      let currentPrice, previousPrice, changePercent;
  
      // Check if primary price data is available
      if (priceData.results?.length > 0) {
        const result = priceData.results[0];
        currentPrice = result.c;
        previousPrice = result.pc || result.o;
        changePercent = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
      } else {
        // Fallback to historical data if primary price data missing
        const historicalResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=desc&limit=2&apiKey=${POLYGON_API_KEY}`
        );
        if (!historicalResponse.ok) throw new Error("Failed to fetch historical data");
        const historicalData = await historicalResponse.json();
        
        if (historicalData.results?.length >= 2) {
          const [latest, previous] = historicalData.results;
          currentPrice = latest.c;
          previousPrice = previous.c;
          changePercent = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
        } else {
          throw new Error("No recent price data available for this stock");
        }
      }
  
      // Fetch extended historical data for chart (handle separately)
      let historicalDataFormatted = [];
      try {
        const historicalResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=30&apiKey=${POLYGON_API_KEY}`
        );
        if (historicalResponse.ok) {
          const historicalData = await historicalResponse.json();
          historicalDataFormatted = historicalData.results?.map(result => ({
            date: new Date(result.t).toISOString().split('T')[0],
            price: result.c
          })) || [];
        }
      } catch (err) {
        console.error("Historical data fetch error:", err);
        setError("Added stock but historical data couldn't be loaded");
      }
  
      const newStock = {
        id: Date.now().toString(),
        symbol: formattedSymbol,
        name,
        currentPrice,
        change: changePercent,
        historicalData: historicalDataFormatted
      };
  
      const updatedWatchlist = [...watchlist, newStock];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Add to watchlist error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = (id) => {
    try {
      const updatedWatchlist = watchlist.filter(item => item.id !== id);
      setWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    } catch (err) {
      console.error("Error removing stock:", err);
      setError("Failed to remove stock from watchlist");
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <SideMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-1 p-6 md:ml-64 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Watchlist</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              1 USD = ₹{usdToInr.toFixed(2)} INR
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-2">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter stock symbol (e.g., RELIANCE, TCS, AAPL, AMZN)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
                  className="dark:bg-gray-700 dark:text-white"
                />
                <Button 
                  onClick={searchStocks} 
                  disabled={isSearching || isLoading}
                  className="dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                For Indian stocks, you can enter NSE symbols directly (e.g., RELIANCE, TCS). For US stocks, enter the regular symbol (e.g., AAPL, AMZN).
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <div key={result.ticker} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">{result.ticker}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.name}</p>
                    </div>
                    <Button 
                      onClick={() => addToWatchlist(result.ticker, result.name)}
                      disabled={isLoading}
                      className="dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isLoading ? "Adding..." : "Add to Watchlist"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Watchlist</h2>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((stock) => {
                  const isRising = parseFloat(stock.change) >= 0;
                  const priceInRupees = stock.currentPrice * usdToInr;
                  const isIndianStock = stock.symbol.endsWith('.NS');
                  
                  return (
                    <div key={stock.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeFromWatchlist(stock.id)}
                          className="dark:bg-red-600 dark:hover:bg-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="space-y-1">
                            {isIndianStock ? (
                              // For Indian stocks, show INR as primary and USD as secondary
                              <>
                                <p className="text-lg font-semibold dark:text-white">
                                  ₹{priceInRupees.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  ${stock.currentPrice?.toFixed(2) || "N/A"}
                                </p>
                              </>
                            ) : (
                              // For US stocks, show USD as primary and INR as secondary
                              <>
                                <p className="text-lg font-semibold dark:text-white">
                                  ${stock.currentPrice?.toFixed(2) || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  ₹{priceInRupees.toFixed(2)}
                                </p>
                              </>
                            )}
                            <p className={`flex items-center ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {stock.change >= 0 ? 
                                <TrendingUp className="inline h-4 w-4 mr-1" /> : 
                                <TrendingDown className="inline h-4 w-4 mr-1" />
                              }
                              {stock.change}%
                            </p>
                          </div>
                        </div>
                        <MiniGraph data={stock.historicalData} isRising={isRising} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">No stocks in your watchlist.</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Watchlist;