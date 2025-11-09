import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, FileText, TrendingUp, Sparkles, Database, Shield, Target } from "lucide-react";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import skillSenseLogo from "@/assets/skillsense-logo.png";

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

      {/* Hero Section */}
      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <img src={skillSenseLogo} alt="SkillSense" className="h-24 w-24" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Unlock Your <span className="bg-gradient-hero bg-clip-text text-transparent">True Professional Self</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Advanced NLP-Powered Skill Extraction & Analysis Platform
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
              Aggregate data from multiple sources, extract explicit and implicit skills using semantic analysis, 
              and generate structured skill profiles with confidence scores and evidence trails.
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

        {/* Core Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powered by Advanced NLP & Semantic Analysis
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our AI-driven platform uses cutting-edge natural language processing to extract, validate, and structure your professional skills
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Feature 1: Explicit & Implicit Skills */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Explicit & Implicit Skill Extraction</h3>
                <p className="text-muted-foreground mb-4">
                  Our NLP engine identifies both directly stated skills (e.g., "Python expert") and implicit skills 
                  demonstrated through projects, posts, and code patterns.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Explicit</Badge>
                    <span className="text-muted-foreground">Directly mentioned in CV, LinkedIn, performance reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Implicit</Badge>
                    <span className="text-muted-foreground">Inferred from GitHub repos, blog topics, project descriptions</span>
                  </div>
                </div>
              </Card>

              {/* Feature 2: Structured Profiles */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Database className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Structured Dynamic Profiles</h3>
                <p className="text-muted-foreground mb-4">
                  Generate comprehensive, machine-readable skill profiles per person with multi-dimensional analysis 
                  and SFIA framework mapping.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    Confidence scores (0-100%) per skill
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    Evidence trails from each source
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    Cross-source validation status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    SFIA proficiency levels (1-7)
                  </li>
                </ul>
              </Card>

              {/* Feature 3: Validation & Editing */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Hallucination Removal & Validation</h3>
                <p className="text-muted-foreground mb-4">
                  Review, edit, and validate AI-identified skills to remove hallucinations and ensure accuracy 
                  before finalizing your profile.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Manual skill validation workflow
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Confidence score adjustments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Evidence editing and refinement
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Feedback loop for AI improvement
                  </li>
                </ul>
              </Card>
            </div>

            {/* Data Aggregation Feature */}
            <Card className="p-8 bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">Multi-Source Data Aggregation</h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    Our platform aggregates and cross-references data from multiple professional and internal sources for comprehensive analysis:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="outline">Professional Sources</Badge>
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• CV/Resume (work history, education)</li>
                        <li>• LinkedIn (posts, network, experience)</li>
                        <li>• GitHub (repositories, contributions, code)</li>
                        <li>• Blogs & Publications (thought leadership)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="outline">Internal Documents</Badge>
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Performance Reviews (manager feedback)</li>
                        <li>• Goals & Objectives (OKRs, initiatives)</li>
                        <li>• Reference Letters (peer validation)</li>
                        <li>• Company assessments (ratings, certifications)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Get Your Analysis in 3 Simple Steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Input Your Data</h3>
                <p className="text-muted-foreground">
                  Upload your CV and connect LinkedIn & GitHub. Optionally add performance reviews and internal documents.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Analyzes Your Profile</h3>
                <p className="text-muted-foreground">
                  Our NLP engine processes all sources, extracts explicit & implicit skills, and generates evidence trails.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Review & Validate</h3>
                <p className="text-muted-foreground">
                  Explore your structured skill profile, edit confidence scores, and remove any AI hallucinations.
                </p>
              </Card>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Index;
