import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Sparkles } from "lucide-react";
import { SkillProfileDisplay } from "@/components/SkillProfileDisplay";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProfile = localStorage.getItem('skillProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in">
        <Card className="p-8 max-w-md text-center shadow-card">
          <h2 className="text-2xl font-bold mb-4">No Profile Found</h2>
          <p className="text-muted-foreground mb-6">
            Start by analyzing your skills to generate your profile.
          </p>
          <Button onClick={() => navigate('/analyze')} size="lg">
            Analyze Skills
          </Button>
        </Card>
      </div>
    );
  }

  const completeness = profile.completeness || 0;
  const topSkills = profile.topSkills || [];
  const dataSources = profile.dataSources || [];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile.name || 'Professional'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your professional skill profile
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Strength Card with Circular Progress */}
          <Card className="p-6 shadow-card animate-fade-in hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Profile Strength</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - completeness / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{completeness}%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {completeness >= 80 && "Excellent! Your profile is comprehensive."}
              {completeness >= 60 && completeness < 80 && "Good progress! Add more data sources."}
              {completeness < 60 && "Keep building! More data = better insights."}
            </p>
          </Card>

          {/* Top Skills Card */}
          <Card className="p-6 shadow-card animate-fade-in hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Top Skills</h3>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="text-4xl font-bold text-accent mb-2">{topSkills.length}</div>
            <p className="text-sm text-muted-foreground">
              Skills identified from your data
            </p>
          </Card>

          {/* Data Sources Card */}
          <Card className="p-6 shadow-card animate-fade-in hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Data Sources</h3>
              <Target className="w-5 h-5 text-warning" />
            </div>
            <div className="text-4xl font-bold text-warning mb-2">{dataSources.length}</div>
            <p className="text-sm text-muted-foreground">
              Sources analyzed for your profile
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 shadow-card mb-8 animate-fade-in">
          <h3 className="font-heading text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Button onClick={() => navigate('/analyze')} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze New Data
            </Button>
            <Button onClick={() => navigate('/skill-profile')} variant="outline" className="w-full">
              View Full Profile
            </Button>
            <Button onClick={() => navigate('/timeline')} variant="outline" className="w-full">
              Skill Timeline
            </Button>
            <Button onClick={() => navigate('/gap-analysis')} variant="outline" className="w-full">
              Gap Analysis
            </Button>
          </div>
        </Card>

        {/* Full Profile Display */}
        <Card className="p-8 shadow-card animate-fade-in">
          <SkillProfileDisplay profile={profile} onReset={() => {
            localStorage.removeItem('skillProfile');
            setProfile(null);
            navigate('/analyze');
          }} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
