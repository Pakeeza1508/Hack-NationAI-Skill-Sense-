import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, FileText, TrendingUp, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();

  const handleViewDemo = () => {
    const demoProfile = {
      name: "Alex Doe",
      title: "Senior Product Manager",
      summary: "A seasoned product manager with over 8 years of experience leading cross-functional teams to deliver innovative software solutions. Expert in Agile methodologies, user-centric design, and data-driven decision-making with a background in software engineering.",
      completeness: 85,
      categories: {
        technical_skills: [
          { name: "SQL", confidence: 90, type: "explicit", evidence: ["Developed complex queries for data analysis."] },
          { name: "API Integration", confidence: 85, type: "implicit", evidence: ["Oversaw integration of multiple third-party APIs."] }
        ],
        business_management: [
          { name: "Product Roadmapping", confidence: 95, type: "explicit", evidence: ["Created and managed product roadmaps for 5 major releases."] },
          { name: "Agile Methodologies", confidence: 98, type: "explicit", evidence: ["Led sprint planning and retrospectives as a Scrum Master."] }
        ],
        soft_skills: [
          { name: "Stakeholder Communication", confidence: 92, type: "implicit", evidence: ["Presented quarterly updates to executive leadership."] },
          { name: "Team Leadership", confidence: 90, type: "explicit", evidence: ["Managed and mentored a team of 8 product owners and engineers."] }
        ]
      },
      topSkills: [
        { name: "Agile Methodologies", confidence: 98 },
        { name: "Product Roadmapping", confidence: 95 },
        { name: "Stakeholder Communication", confidence: 92 },
        { name: "SQL", confidence: 90 },
        { name: "Team Leadership", confidence: 90 }
      ],
      dataSources: ['cv', 'linkedin'],
      recentActivity: [{ title: "Demo profile loaded", date: new Date().toLocaleDateString() }]
    };
    
    localStorage.setItem('skillProfile', JSON.stringify(demoProfile));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <Header />

      {/* Main Content */}
      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Unlock Your <span className="bg-gradient-hero bg-clip-text text-transparent">True Professional Self</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              SkillSense uses AI to analyze your career data from multiple sources, revealing the full spectrum of your skills—from the explicit to the implicitly demonstrated.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/analyze')} className="text-lg">
                <Sparkles className="mr-2 h-5 w-5" /> Analyze Your Profile
              </Button>
              <Button size="lg" variant="outline" onClick={handleViewDemo} className="text-lg">
                <FileText className="mr-2 h-5 w-5" /> View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">A New Dimension of Career Insight</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Go beyond simple keywords. Understand your skills in context.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard icon={<Brain />} title="Multi-Source Analysis" description="Aggregate data from your CV, LinkedIn, and GitHub to build a holistic view of your professional capabilities." />
              <FeatureCard icon={<Sparkles />} title="AI-Powered Skill Extraction" description="Our AI identifies not just the skills you list, but also the skills you demonstrate in your project descriptions and experience." />
              <FeatureCard icon={<TrendingUp />} title="Evidence-Based Profiles" description="Every skill is backed by a confidence score and traced back to the source, giving you full transparency and credibility." />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Get Your Analysis in 3 Simple Steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <StepCard number="1" title="Input Your Data" description="Upload your CV or connect your LinkedIn and GitHub profiles securely." />
              <StepCard number="2" title="AI Analyzes Your Profile" description="Our engine processes your data, identifying skills and finding evidence." />
              <StepCard number="3" title="Receive Your Skill Profile" description="Explore your interactive dashboard with a complete breakdown of your skills." />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) => (
  <Card className="p-8 text-center hover:shadow-card-hover transition-shadow">
    <div className="inline-block p-4 bg-primary/10 rounded-lg mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string; }) => (
  <div className="p-6">
    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border-2 border-primary rounded-full text-2xl font-bold text-primary">{number}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
