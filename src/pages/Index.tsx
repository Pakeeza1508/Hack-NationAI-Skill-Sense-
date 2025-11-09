import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, FileText, TrendingUp, Sparkles, Database, Shield, Target, ScanLine, Info } from "lucide-react";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import skillSenseLogo from "@/assets/skillsense-logo-new.png";

const Index = () => {
  const navigate = useNavigate();

  const handleViewDemo = () => {
    const demoProfile = {
      name: "Alex Doe",
      title: "Senior Product Manager",
      summary: "A seasoned product manager with over 8 years of experience leading cross-functional teams to deliver innovative software solutions. Expert in Agile methodologies, user-centric design, and data-driven decision-making with a background in software engineering.",
      completeness: 85,
      categories: {
        software_engineering: [
            { name: 'JavaScript', confidence: 95, type: 'explicit', evidence: ['Developed front-end components for a web application using React and TypeScript.'] },
            { name: 'React', confidence: 92, type: 'explicit', evidence: ['Built a single-page application with React and Redux.'] },
            { name: 'Node.js', confidence: 88, type: 'explicit', evidence: ['Created a RESTful API with Node.js and Express.'] },
            { name: 'Python', confidence: 85, type: 'implicit', evidence: ['Wrote Python scripts for data analysis and automation.'] },
            { name: 'SQL', confidence: 90, type: 'explicit', evidence: ['Developed complex queries for data analysis.'] },
            { name: 'REST APIs', confidence: 92, type: 'explicit', evidence: ['Designed and implemented RESTful APIs for a microservices architecture.'] },
            { name: 'GraphQL', confidence: 80, type: 'implicit', evidence: ['Explored GraphQL for a new project to improve data fetching efficiency.'] },
            { name: 'Docker', confidence: 85, type: 'explicit', evidence: ['Used Docker to containerize applications for development and deployment.'] },
            { name: 'Kubernetes', confidence: 75, type: 'implicit', evidence: ['Familiar with Kubernetes concepts and have used it for orchestrating containerized applications.'] },
            { name: 'AWS', confidence: 80, type: 'explicit', evidence: ['Deployed and managed applications on AWS using services like EC2, S3, and RDS.'] },
            { name: 'CI/CD', confidence: 88, type: 'explicit', evidence: ['Set up CI/CD pipelines using Jenkins and GitHub Actions to automate the build and deployment process.'] }
        ],
        business_management: [
            { name: 'Product Roadmapping', confidence: 95, type: 'explicit', evidence: ['Created and managed product roadmaps for 5 major releases.'] },
            { name: 'Agile Methodologies', confidence: 98, type: 'explicit', evidence: ['Led sprint planning and retrospectives as a Scrum Master.'] },
            { name: 'Market Research', confidence: 85, type: 'implicit', evidence: ['Conducted market research to identify new product opportunities.'] },
            { name: 'Competitive Analysis', confidence: 88, type: 'implicit', evidence: ['Performed competitive analysis to inform product strategy.'] },
            { name: 'Financial Modeling', confidence: 75, type: 'implicit', evidence: ['Built financial models to forecast revenue and costs.'] },
            { name: 'Go-to-Market Strategy', confidence: 82, type: 'explicit', evidence: ['Developed go-to-market strategies for new product launches.'] }
        ],
        soft_skills: [
            { name: 'Stakeholder Communication', confidence: 92, type: 'implicit', evidence: ['Presented quarterly updates to executive leadership.'] },
            { name: 'Team Leadership', confidence: 90, type: 'explicit', evidence: ['Managed and mentored a team of 8 product owners and engineers.'] },
            { name: 'Problem Solving', confidence: 95, type: 'implicit', evidence: ['Identified and resolved critical issues in the product development lifecycle.'] },
            { name: 'Creativity', confidence: 85, type: 'implicit', evidence: ['Brainstormed and designed innovative solutions to user problems.'] },
            { name: 'Adaptability', confidence: 88, type: 'implicit', evidence: ['Adapted to changing project requirements and priorities in a fast-paced environment.'] },
            { name: 'Negotiation', confidence: 80, type: 'explicit', evidence: ['Negotiated contracts with vendors and partners.'] }
        ]
      },
      topSkills: [
        { name: "Agile Methodologies", confidence: 98 },
        { name: "Product Roadmapping", confidence: 95 },
        { name: "Problem Solving", confidence: 95 },
        { name: "JavaScript", confidence: 95 },
        { name: "Stakeholder Communication", confidence: 92 },
        { name: "React", confidence: 92 },
        { name: "SQL", confidence: 90 },
        { name: "Team Leadership", confidence: 90 },
      ],
      dataSources: ['cv', 'linkedin', 'github'],
      recentActivity: [{ title: "Demo profile loaded", date: new Date().toLocaleDateString() }]
    };
    
    localStorage.setItem('skillProfile', JSON.stringify(demoProfile));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in font-sans">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-4 md:py-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 text-center">
            
            {/* New, Mission-Driven Headline */}
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Your Experience Into
              <br />
              <span className="md:text-6xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"> Opportunity.</span>
            </h1>
            
            {/* New, Descriptive Subheading */}
            <p className="text-xl md:text-md text-foreground/80 mb-10 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '400ms' }}>
              Our mission is to empower you to see and articulate your true professional value. SkillSense uses AI to decode your entire career history into a clear, evidence-based skill profile, helping you navigate your path with confidence.
            </p>

            {/* Buttons with updated text */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '600ms' }}>
              <Button size="lg" onClick={() => navigate('/analyze')} className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="mr-2 h-5 w-5" /> Start Your Analysis
              </Button>
              <Button size="lg" variant="outline" onClick={handleViewDemo} className="text-lg px-8 py-6 border-2 hover:bg-accent/10">
                <FileText className="mr-2 h-5 w-5" /> View a Demo Profile
              </Button>
            </div>
          </div>
        </section>

        {/* "Why SkillSense?" Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">
                Go Beyond the Resume
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Your resume only tells part of the story. SkillSense builds a complete picture of your capabilities by analyzing the projects you've built, the content you've created, and the experience you've described.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">Discover Your Hidden Talents</h3>
                <p className="text-muted-foreground">
                  Our AI uncovers skills you may not even know you have, giving you a new language to talk about your expertise.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">Gain a Competitive Edge</h3>
                <p className="text-muted-foreground">
                  Walk into interviews with a clear, evidence-based understanding of your strengths and how they align with the roles you want.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">Create a Personalized Career Roadmap</h3>
                <p className="text-muted-foreground">
                  By understanding your complete skill set, you can make smarter decisions about your career path and identify the most effective areas for growth.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-poppins">Your Analysis in Three Simple Steps</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow flex-1">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">Upload Your Data</h3>
                <p className="text-muted-foreground">
                  Connect your professional accounts like LinkedIn and GitHub, and upload your CV. The more data you provide, the more accurate your analysis will be.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow flex-1">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced NLP models scan your documents, repositories, and profiles to identify, categorize, and validate your skills.
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow flex-1">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins">Unlock Your Insights</h3>
                <p className="text-muted-foreground">
                  Receive a comprehensive, dynamic skill profile complete with confidence scores, evidence trails, and a timeline of your professional growth.
                </p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">
                A Suite of Tools for Career Growth
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-poppins">Multi-Source Skill Aggregation</h3>
                </div>
                <p className="text-muted-foreground">
                  Connect your CV, LinkedIn, and GitHub to create a single, unified view of your professional identity.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-poppins">Explicit & Implicit Skill Extraction</h3>
                </div>
                <p className="text-muted-foreground">
                  We identify the skills you list and the skills you demonstrate, giving you credit for every aspect of your experience.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-poppins">Dynamic Skill Profile</h3>
                </div>
                <p className="text-muted-foreground">
                  Explore your skills through an interactive dashboard, complete with confidence scores and direct links to the evidence in your source documents.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-poppins">Skill Gap Analysis</h3>
                </div>
                <p className="text-muted-foreground">
                  Compare your profile to a job description to instantly see where you align, where you have gaps, and what makes you a unique candidate.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-poppins">AI-Powered Resume Enhancement</h3>
                </div>
                <p className="text-muted-foreground">
                  Generate a professional summary and bullet points tailored to specific job applications, all based on your validated skill profile.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-poppins">Trusted by Professionals</h2>
            </div>
            <Card className="p-8 bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
              <AlertDescription className="text-lg text-center text-muted-foreground">
                "SkillSense gave me a completely new perspective on my career. I discovered strengths I never would have put on my resume, and it gave me the confidence to apply for a senior role I wouldn't have considered before. The gap analysis was a game-changer."
              </AlertDescription>
              <div className="text-center mt-6">
                <p className="font-semibold">- Alex Doe, Senior Product Manager</p>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
