import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DataInputSection } from "@/components/DataInputSection";
import { SkillProfileDisplay } from "@/components/SkillProfileDisplay";
import { useNavigate } from "react-router-dom";

const Analyze = () => {
  const [skillProfile, setSkillProfile] = useState<any>(null);
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  const handleProfileGenerated = (profile: any) => {
    // Prepare profile data with additional metadata
    const enrichedProfile = {
      ...profile,
      name: "User",
      completeness: 85,
      topSkills: Object.values(profile.categories || {})
        .flat()
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 5),
      dataSources: [],
      recentActivity: [
        { title: "Skills analyzed successfully", date: new Date().toLocaleDateString() }
      ]
    };

    // Add data sources based on what was used
    if (profile.categories) {
      enrichedProfile.dataSources.push('cv');
    }

    // Save immediately to localStorage
    localStorage.setItem('skillProfile', JSON.stringify(enrichedProfile));
    
    // Update component state
    setSkillProfile(enrichedProfile);
    
    // Scroll to top to show results
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setSkillProfile(null);
    localStorage.removeItem('skillProfile');
  };

  return (
    <div ref={topRef} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="font-heading font-bold text-xl">Skill Analysis</h1>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </header>

      {/* Content */}
      {!skillProfile ? (
        <DataInputSection onProfileGenerated={handleProfileGenerated} />
      ) : (
        <SkillProfileDisplay profile={skillProfile} onReset={handleReset} />
      )}
    </div>
  );
};

export default Analyze;
