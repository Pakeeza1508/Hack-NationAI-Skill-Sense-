import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import skillSenseLogo from "@/assets/skillsense-logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo and Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img src={skillSenseLogo} alt="SkillSense" className="h-10 w-10" />
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
