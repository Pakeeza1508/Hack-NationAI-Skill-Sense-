import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Sparkles, Linkedin, Github, FileText } from "lucide-react";
import { SkillProfileDisplay } from "@/components/SkillProfileDisplay";
import { supabase } from "@/integrations/supabase/client";

const demoProfile = {
  name: 'Demo User',
  email: 'demo@example.com',
  completeness: 85,
  topSkills: [
    { skill: 'React', level: 'Expert', years: 5 },
    { skill: 'TypeScript', level: 'Advanced', years: 4 },
    { skill: 'Node.js', level: 'Advanced', years: 4 },
    { skill: 'Python', level: 'Intermediate', years: 3 },
    { skill: 'GraphQL', level: 'Intermediate', years: 2 }
  ],
  dataSources: ['linkedin', 'github', 'cv'],
  skills: [
    { skill: 'React', level: 'Expert', years: 5, category: 'Frontend' },
    { skill: 'TypeScript', level: 'Advanced', years: 4, category: 'Languages' },
    { skill: 'Node.js', level: 'Advanced', years: 4, category: 'Backend' },
    { skill: 'Python', level: 'Intermediate', years: 3, category: 'Languages' },
    { skill: 'GraphQL', level: 'Intermediate', years: 2, category: 'API' },
    { skill: 'JavaScript', level: 'Expert', years: 6, category: 'Languages' },
    { skill: 'HTML5', level: 'Expert', years: 6, category: 'Frontend' },
    { skill: 'CSS3', level: 'Expert', years: 6, category: 'Frontend' },
    { skill: 'Next.js', level: 'Advanced', years: 3, category: 'Frameworks' },
    { skill: 'Express.js', level: 'Advanced', years: 4, category: 'Frameworks' },
    { skill: 'PostgreSQL', level: 'Intermediate', years: 3, category: 'Databases' },
    { skill: 'Docker', level: 'Intermediate', years: 2, category: 'DevOps' },
  ],
  experience: [
    {
      company: 'Tech Solutions Inc.',
      role: 'Senior Frontend Developer',
      duration: 'Jan 2020 - Present',
      description: 'Led the development of a new client-facing dashboard using React and TypeScript. Improved application performance by 30% by optimizing state management and rendering logic. Mentored junior developers.'
    },
    {
      company: 'Web Innovations LLC',
      role: 'Frontend Developer',
      duration: 'Jun 2017 - Dec 2019',
      description: 'Developed and maintained responsive web applications using JavaScript, HTML, and CSS. Collaborated with designers and backend developers to create seamless user experiences.'
    }
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science in Computer Science',
      duration: '2013 - 2017'
    }
  ],
  certifications: [
    {
      name: 'Certified React Developer',
      issuing_organization: 'React Guild',
      year: 2021
    }
  ]
};

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isDemo = searchParams.get('demo') === 'true';

    if (isDemo) {
      setProfile(demoProfile);
      // Optionally, save to localStorage for persistence across demo session
      localStorage.setItem('skillProfile', JSON.stringify(demoProfile));
    } else {
      loadProfile();
    }
  }, [location.search]);

  const loadProfile = async () => {
    // 1. Prioritize localStorage: Check for a demo or recently generated profile first.
    const savedProfile = localStorage.getItem('skillProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      return; // Found a profile, no need to check the database.
    }

    // 2. If nothing in localStorage, then check the database for a logged-in user.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null); // No local profile and no user, so no profile to show.
        return;
      }

      // 3. Fetch the most recent skill profile from Supabase for the logged-in user.
      const { data, error } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        const dbProfile = data.profile_data;
        setProfile(dbProfile);
        // 4. Save the fetched profile to localStorage for faster access next time.
        localStorage.setItem('skillProfile', JSON.stringify(dbProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null); // Ensure profile is null on error.
    }
  };

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

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'cv': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

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
            <div className="flex items-center gap-4 text-warning mb-2">
              <div className="text-4xl font-bold">{dataSources.length}</div>
              <div className="flex flex-col">
                {dataSources.map((source: string) => (
                  <div key={source} className="flex items-center gap-2">
                    {sourceIcon(source)}
                    <span className="font-semibold capitalize">{source}</span>
                  </div>
                ))}
              </div>
            </div>
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
            <Button onClick={() => navigate('/my-profile')} variant="outline" className="w-full">
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
