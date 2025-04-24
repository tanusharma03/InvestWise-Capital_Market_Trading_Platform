import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MarketItemDetails } from "@/components/market/MarketItemDetails";
import { useNavigate } from "react-router-dom";
import { AddInvestmentForm } from "@/components/market/AddInvestmentForm";
import LeftSideMenu from "@/components/dashboard/LeftSideMenu";
import { motion } from "framer-motion"; // Import framer-motion for animations

export default function BondsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("market_data")
          .select("*")
          .eq("type", "bond")
          .order("name");

        if (error) throw error;
        setItems(data);
      } catch (error) {
        toast.error("Failed to load bonds list");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const capitalizeRiskLevel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Left Side Menu Section */}
      <div className="w-64">
        <LeftSideMenu />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Bonds
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-600 mt-2"
            >
              Explore stable, fixed-income investment options
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-4 w-[250px] bg-gray-200 rounded"></div>
                <div className="h-4 w-[200px] bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <TableHead className="font-semibold text-blue-900">NAME</TableHead>
                  <TableHead className="font-semibold text-blue-900">PRICE</TableHead>
                  <TableHead className="font-semibold text-blue-900">CHANGE</TableHead>
                  <TableHead className="font-semibold text-blue-900">RISK LEVEL</TableHead>
                  <TableHead className="font-semibold text-blue-900">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>₹{item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {item.change}%  
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : item.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {capitalizeRiskLevel(item.risk_level)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedSymbol(item.symbol)}
                            className="hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSymbol(item.symbol);
                              setShowAddForm(true);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            Buy
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>

      <MarketItemDetails
        isOpen={!!selectedSymbol && !showAddForm}
        onClose={() => setSelectedSymbol(null)}
        symbol={selectedSymbol!}
      />

      <AddInvestmentForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setSelectedSymbol(null);
        }}
        type="bond"
        title="Buy Bond"
        symbol={selectedSymbol}
      />
    </div>
  );
}