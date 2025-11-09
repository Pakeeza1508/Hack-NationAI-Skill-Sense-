import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import skillSenseLogo from "@/assets/skillsense-logo-new.png";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoClick = () => {
    // Navigate to dashboard with a query param to indicate demo mode
    navigate('/dashboard?demo=true');
  };

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
            to="/my-profile" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary font-semibold"
          >
            My Profile
          </NavLink>
        </nav>

        {/* Right: CTA Buttons (conditionally rendered) */}
        {location.pathname === '/' ? (
          <Button onClick={handleDemoClick} variant="default">
            View Demo
          </Button>
        ) : (
          <Button onClick={() => navigate('/analyze')} variant="default">
            Analyze Skills
          </Button>
        )}
      </div>
    </header>
  );
};
