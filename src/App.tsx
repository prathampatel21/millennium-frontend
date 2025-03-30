
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import CreateOrder from "./pages/CreateOrder";
import OrderStatus from "./pages/OrderStatus";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/create-order" 
                element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} 
              />
              <Route 
                path="/orders" 
                element={<ProtectedRoute><OrderStatus /></ProtectedRoute>} 
              />
              <Route 
                path="/history" 
                element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} 
              />
              <Route 
                path="/profile" 
                element={<ProtectedRoute><Profile /></ProtectedRoute>} 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
