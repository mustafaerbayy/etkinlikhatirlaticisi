import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import WeeklyReports from "./pages/WeeklyReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
            <Route path="/sifre-sifirla" element={<ResetPassword />} />
            <Route path="/etkinlik/:id" element={<EventDetail />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/yonetim" element={<Admin />} />
            <Route path="/haftalik-raporlar" element={<WeeklyReports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
