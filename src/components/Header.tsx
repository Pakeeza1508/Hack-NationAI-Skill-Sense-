import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo and Name */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <Brain className="w-8 h-8 text-primary" />
          <span className="font-heading font-bold text-xl">SkillSense</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/dashboard" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary font-semibold"
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/skill-profile" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary font-semibold"
          >
            My Profile
          </NavLink>
          <NavLink 
            to="/timeline" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary font-semibold"
          >
            Timeline
          </NavLink>
          <NavLink 
            to="/gap-analysis" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary font-semibold"
          >
            Skill Gap
          </NavLink>
        </nav>

        {/* Right: Dashboard Button */}
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </header>
  );
};
