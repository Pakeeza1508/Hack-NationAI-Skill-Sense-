import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, FileText } from "lucide-react";
import { DataInputSection } from "@/components/DataInputSection";
import { SkillProfileDisplay } from "@/components/SkillProfileDisplay";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showInput, setShowInput] = useState(false);
  const [skillProfile, setSkillProfile] = useState<any>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    console.log('Analyze button clicked');
    setShowInput(true);
    setTimeout(() => {
      inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleViewDemo = () => {
    console.log('View Demo button clicked');
    // Create sample demo profile
    const demoProfile = {
      name: "Demo User",
      title: "Software Engineer",
      summary: "An experienced professional with expertise in full-stack development, cloud technologies, and team leadership.",
      completeness: 85,
      categories: {
        technical: [
          { name: "Python", confidence: 95, type: "explicit", evidence: ["Led development of data processing pipeline"] },
          { name: "JavaScript", confidence: 90, type: "explicit", evidence: ["Built React applications"] },
          { name: "SQL", confidence: 85, type: "explicit", evidence: ["Database optimization projects"] }
        ],
        soft_skills: [
          { name: "Leadership", confidence: 80, type: "implicit", evidence: ["Managed team of 5 developers"] },
          { name: "Communication", confidence: 85, type: "implicit", evidence: ["Regular stakeholder presentations"] }
        ]
      },
      topSkills: [
        { name: "Python", confidence: 95 },
        { name: "JavaScript", confidence: 90 },
        { name: "SQL", confidence: 85 },
        { name: "Leadership", confidence: 80 },
        { name: "Communication", confidence: 85 }
      ],
      dataSources: ['cv', 'linkedin'],
      recentActivity: [
        { title: "Demo profile loaded", date: new Date().toLocaleDateString() }
      ]
    };
    
    localStorage.setItem('skillProfile', JSON.stringify(demoProfile));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-heading font-bold text-xl">SkillSense</span>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Go to Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Skill Discovery
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Discover Your
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Hidden Potential
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              SkillSense transforms scattered career data into comprehensive skill profiles. 
              Uncover explicit and implicit capabilities you never knew you had.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                type="button"
                size="lg" 
                className="text-lg px-8"
                onClick={handleAnalyzeClick}
              >
                <Brain className="mr-2 h-5 w-5" />
                Analyze Your Skills
              </Button>
              <Button 
                type="button"
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={handleViewDemo}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-primary" />}
              title="Multi-Source Analysis"
              description="Aggregate data from CVs, LinkedIn, GitHub, and more to build a complete picture of your capabilities."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="AI Skill Extraction"
              description="Advanced NLP identifies both explicit skills and implicit capabilities hidden in your career story."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
              title="Evidence-Based Profiles"
              description="Every skill comes with confidence scores and direct evidence trails for complete transparency."
            />
          </div>
        </div>
      </section>

      {/* Data Input Section */}
      {showInput && !skillProfile && (
        <div ref={inputSectionRef}>
          <DataInputSection onProfileGenerated={setSkillProfile} />
        </div>
      )}

      {/* Skill Profile Display */}
      {skillProfile && (
        <SkillProfileDisplay 
          profile={skillProfile} 
          onReset={() => {
            setSkillProfile(null);
            setShowInput(true);
          }}
        />
      )}
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
