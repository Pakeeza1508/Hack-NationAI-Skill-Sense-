import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Target, Settings, Brain } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "My Profile", path: "/profile", icon: User },
  { name: "Skill Gap", path: "/gap-analysis", icon: Target },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-heading font-bold text-xl">SkillSense</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};