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
    // Extract all skills and sort by confidence
    const allSkills = Object.values(profile.categories || {})
      .flat()
      .sort((a: any, b: any) => b.confidence - a.confidence);

    // Prepare profile data matching demo format
    const enrichedProfile = {
      name: profile.professional_summary?.name || "User",
      title: profile.professional_summary?.current_role || "Professional",
      summary: profile.professional_summary?.summary || "Skilled professional with diverse experience.",
      completeness: 85,
      categories: profile.categories,
      topSkills: allSkills.slice(0, 8).map((skill: any) => ({
        name: skill.name,
        confidence: skill.confidence
      })),
      dataSources: profile.dataSources || [],
      recentActivity: [
        { title: "Skills analyzed successfully", date: new Date().toLocaleDateString() }
      ]
    };

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
