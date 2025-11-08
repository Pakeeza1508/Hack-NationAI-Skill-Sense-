import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, FileText, Target, Activity, Linkedin, Github, FileCode, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Load saved profile from localStorage
    const savedProfile = localStorage.getItem('skillProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const topSkills = profile?.topSkills || [];
  const dataSources = profile?.dataSources || [];
  const recentActivity = profile?.recentActivity || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search skills, insights..."
            className="w-full max-w-md px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold">
            {profile?.name?.[0] || "U"}
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Welcome back, {profile?.name || "User"}!</h1>
          <p className="text-muted-foreground text-lg">
            Here's an overview of your skill profile and career insights
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Profile Strength Card */}
          <Card className="p-6 shadow-card">
            <h3 className="font-heading text-lg font-semibold mb-4">Profile Strength</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile?.completeness || 75) / 100)}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{profile?.completeness || 75}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Add GitHub to improve →</p>
                <Link to="/">
                  <Button variant="outline" size="sm">Add Source</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Key Strengths */}
          <Card className="p-6 shadow-card">
            <h3 className="font-heading text-lg font-semibold mb-4">Key Strengths</h3>
            <div className="space-y-3">
              {(profile?.topSkills || []).slice(0, 3).map((skill: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-primary font-bold">{skill.confidence}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Skills Widget */}
          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              My Top Skills
            </h3>
            <div className="space-y-2">
              {topSkills.length > 0 ? (
                topSkills.slice(0, 5).map((skill: any, idx: number) => (
                  <Link key={idx} to="/profile" className="block">
                    <div className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors">
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline">{skill.confidence}%</Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills analyzed yet</p>
              )}
            </div>
            <Link to="/profile">
              <Button variant="link" className="w-full mt-4">View All Skills →</Button>
            </Link>
          </Card>

          {/* Data Sources Connected */}
          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Connected Sources
            </h3>
            <div className="space-y-3">
              {dataSources.length > 0 ? (
                dataSources.map((source: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded bg-secondary/30">
                    {source === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-600" />}
                    {source === 'github' && <Github className="w-5 h-5" />}
                    {source === 'cv' && <FileText className="w-5 h-5 text-primary" />}
                    <span className="capitalize">{source}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sources connected</p>
              )}
            </div>
            <Link to="/">
              <Button variant="outline" className="w-full mt-4">
                Add Data Source
              </Button>
            </Link>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-muted-foreground text-xs">{activity.date}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/" className="block">
              <Card className="p-6 text-center hover:shadow-card-hover transition-all cursor-pointer">
                <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Analyze Data</h4>
                <p className="text-sm text-muted-foreground">Add new sources</p>
              </Card>
            </Link>
            
            <Link to="/gap-analysis" className="block">
              <Card className="p-6 text-center hover:shadow-card-hover transition-all cursor-pointer">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Skill Gap Analysis</h4>
                <p className="text-sm text-muted-foreground">Compare with jobs</p>
              </Card>
            </Link>
            
            <Link to="/profile" className="block">
              <Card className="p-6 text-center hover:shadow-card-hover transition-all cursor-pointer">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">View Profile</h4>
                <p className="text-sm text-muted-foreground">See all skills</p>
              </Card>
            </Link>
            
            <Card className="p-6 text-center hover:shadow-card-hover transition-all cursor-pointer">
              <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Export CV</h4>
              <p className="text-sm text-muted-foreground">Download profile</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
