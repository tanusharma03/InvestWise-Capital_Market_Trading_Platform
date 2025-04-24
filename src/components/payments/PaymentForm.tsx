// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";

// interface PaymentFormProps {
//   onSubmit: (amount: string) => Promise<void>;
//   onCancel?: () => void;
//   isLoading?: boolean;
// }

// export function PaymentForm({ onSubmit, onCancel, isLoading = false }: PaymentFormProps) {
//   const [amount, setAmount] = useState("");
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const navigate = useNavigate();

//   const handleAmountSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }
//     setShowConfirmation(true);
//   };

//   const handlePayment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsProcessing(true);

//     try {
//       await onSubmit(amount);
//       toast.success("Payment completed successfully!");
      
//       // Short delay to show the success message before redirecting
//       setTimeout(() => {
//         navigate("/dashboard");
//       }, 1500);
//     } catch (error: any) {
//       toast.error(error.message || "Payment failed");
//       setShowConfirmation(false);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (!showConfirmation) {
//     return (
//       <form onSubmit={handleAmountSubmit} className="space-y-6">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
//             Amount (₹)
//           </label>
//           <input
//             id="amount"
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             placeholder="Enter amount"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//         >
//           Continue
//         </button>
//         {onCancel && (
//           <button
//             type="button"
//             onClick={onCancel}
//             className="w-full text-indigo-600 hover:underline mt-2"
//           >
//             Cancel
//           </button>
//         )}
//       </form>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto">
//       <form onSubmit={handlePayment} className="space-y-6">
//         <div>
//           <label htmlFor="amount" className="block text-lg font-medium text-gray-700 mb-2">
//             Amount to Pay: ₹{amount}
//           </label>
//         </div>

//         <div className="space-y-4 bg-white p-6 rounded-lg shadow">
//           <button
//             type="submit"
//             className="w-full bg-[#0070ba] text-white py-4 rounded-full text-lg font-semibold hover:bg-[#003087] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             disabled={isProcessing || isLoading}
//           >
//             {isProcessing ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               "Confirm Payment"
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={() => setShowConfirmation(false)}
//             className="w-full text-[#0070ba] hover:underline"
//             disabled={isProcessing}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import paypalLogo from "@/paypal-logo.png"; // Ensure you have the PayPal logo image in your assets

interface PaymentFormProps {
  onSubmit: (amount: string, email: string, password: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PaymentForm({ onSubmit, onCancel, isLoading = false }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // State for popup message
  const navigate = useNavigate();

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000); // Hide the message after 3 seconds
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setStep(2); // Move to the next step
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await onSubmit(amount, email, password);
      showMessage("Payment completed successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {message && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-6 rounded-lg shadow-2xl z-50 text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">{message}</h2>
        </div>
      )}
      <form
        onSubmit={step === 1 ? handleAmountSubmit : handlePayment}
        className="space-y-8 max-w-md mx-auto p-10 bg-white rounded-lg shadow-lg border border-gray-300 h-[75vh] w-[90%]"
      >
        {step === 1 ? (
          <div className="mt-[50%]">
            <label htmlFor="amount" className="block text-lg font-semibold text-gray-800 mb-2">
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-center"
              placeholder="Enter amount"
              required
            />
          </div>
        ) : (
          <div className="text-center">
            <img src={paypalLogo} alt="PayPal Logo" className="mx-auto mb-6 h-16" />
            <label htmlFor="email" className="block text-lg font-semibold text-gray-800 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Enter your email"
              required
            />
            <label htmlFor="password" className="block text-lg font-semibold text-gray-800 mb-2 mt-4">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Enter your password"
              required
            />
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : step === 1 ? "Next" : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
}
