import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";
import SkillProfile from "./pages/SkillProfile";
import SkillsTimeline from "./pages/SkillsTimeline";
import GapAnalysis from "./pages/GapAnalysis";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home page without sidebar */}
          <Route path="/" element={<Index />} />
          
          {/* Analyze page without sidebar */}
          <Route path="/analyze" element={<Analyze />} />
          
          {/* All other pages with sidebar layout */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><SkillProfile /></AppLayout>} />
          <Route path="/timeline" element={<AppLayout><SkillsTimeline /></AppLayout>} />
          <Route path="/gap-analysis" element={<AppLayout><GapAnalysis /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
