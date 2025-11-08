import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SkillProfile from "./pages/SkillProfile";
import GapAnalysis from "./pages/GapAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (isHomePage) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<SkillProfile />} />
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
