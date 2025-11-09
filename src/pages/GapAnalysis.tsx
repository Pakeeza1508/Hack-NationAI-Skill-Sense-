import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, CheckCircle, XCircle, Sparkles, TrendingUp, BookOpen, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GapAnalysis = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste a job description to analyze.",
        variant: "destructive",
      });
      return;
    }

    const savedProfile = localStorage.getItem('skillProfile');
    if (!savedProfile) {
      toast({
        title: "No Profile Found",
        description: "Please analyze your skills first before comparing to jobs.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-gap', {
        body: {
          userProfile: JSON.parse(savedProfile),
          jobDescription,
        },
      });

      if (error) throw error;

      setAnalysis(data);
      
      toast({
        title: "Analysis Complete!",
        description: "Your skill gap analysis is ready.",
      });
    } catch (error: any) {
      console.error("Error analyzing gap:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze skill gaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center">
        <h1 className="font-heading text-xl font-bold">Skill Gap Analysis</h1>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Purpose and Process Explanation */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="font-heading text-3xl font-bold mb-3">
              Find Your Perfect Career Match
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover how well your skills align with your dream job and get personalized recommendations
            </p>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-lg font-semibold">What is Skill Gap Analysis?</AlertTitle>
            <AlertDescription className="text-base mt-2 space-y-2">
              <p>
                Our AI-powered skill gap analysis compares your professional profile (from your CV, LinkedIn, and GitHub) 
                against any job description to provide you with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong>Match Percentage:</strong> See how qualified you are for the role</li>
                <li><strong>Matching Skills:</strong> Your existing skills that align with the job</li>
                <li><strong>Skill Gaps:</strong> Areas where you need development to be competitive</li>
                <li><strong>Hidden Strengths:</strong> Your unique skills that go beyond the job requirements</li>
                <li><strong>Tailored Content:</strong> Custom resume summary and bullet points optimized for this specific role</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Process Steps */}
          <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
            <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  1
                </div>
                <h4 className="font-semibold">Paste Job Description</h4>
                <p className="text-sm text-muted-foreground">
                  Copy the full job posting from any job board and paste it below
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  2
                </div>
                <h4 className="font-semibold">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI compares the job requirements against your comprehensive skill profile from all sources
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  3
                </div>
                <h4 className="font-semibold">Get Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Receive detailed match analysis, skill gaps, and tailored resume content for your application
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Job Description Input */}
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-primary mt-1" />
              <div className="flex-1">
                <label className="text-lg font-semibold mb-1 block">
                  Paste the Job Description
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Include the entire job posting: role title, responsibilities, requirements, qualifications, and any other details
                </p>
                <Textarea
                  placeholder="Example:&#10;&#10;Job Title: Senior Software Engineer&#10;&#10;We are seeking a talented Senior Software Engineer to join our team...&#10;&#10;Responsibilities:&#10;- Design and develop scalable web applications&#10;- Collaborate with cross-functional teams&#10;&#10;Requirements:&#10;- 5+ years of experience with React and Node.js&#10;- Strong understanding of cloud platforms (AWS/Azure)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[250px] font-mono text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Your Match...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  Analyze My Skill Match
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Results Header */}
            <div className="text-center">
              <h2 className="font-heading text-2xl font-bold mb-2">Your Analysis Results</h2>
              <p className="text-muted-foreground">Here's how you match up against this opportunity</p>
            </div>

            {/* Match Score */}
            <Card className="p-8 text-center shadow-card border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Overall Match Score</h3>
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                {analysis.matchPercentage}%
              </div>
              <Progress value={analysis.matchPercentage} className="h-4 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {analysis.matchPercentage >= 80 && "🎉 Excellent Match! You're highly qualified for this role"}
                  {analysis.matchPercentage >= 60 && analysis.matchPercentage < 80 && "👍 Good Match! You have strong potential with some areas to develop"}
                  {analysis.matchPercentage < 60 && "💡 Moderate Match - Great learning opportunity with clear development path"}
                </p>
                <p className="text-sm text-muted-foreground">
                  This score is based on comparing your verified skills from CV, LinkedIn, and GitHub against the job requirements
                </p>
              </div>
            </Card>

            {/* Detailed Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Matching Skills */}
              <Card className="p-6 shadow-card border-2 border-accent/30 hover:border-accent/50 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold mb-1">
                      Your Matching Skills
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Skills you already have that the job requires
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="mb-3 bg-accent/10 text-accent border-accent/30">
                  {analysis.matches?.length || 0} skills match
                </Badge>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {analysis.matches?.map((skill: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors">
                      <span className="font-medium text-sm">✓ {skill.name || skill}</span>
                    </div>
                  ))}
                  {(!analysis.matches || analysis.matches.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">No direct matches found - consider developing the required skills</p>
                  )}
                </div>
              </Card>

              {/* Skill Gaps */}
              <Card className="p-6 shadow-card border-2 border-warning/30 hover:border-warning/50 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold mb-1">
                      Skills to Develop
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Areas where upskilling will improve your candidacy
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="mb-3 bg-warning/10 text-warning border-warning/30">
                  {analysis.gaps?.length || 0} gaps identified
                </Badge>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {analysis.gaps?.map((skill: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-warning/10 border border-warning/20 hover:bg-warning/20 transition-colors">
                      <span className="font-medium text-sm">→ {skill}</span>
                      <p className="text-xs text-muted-foreground mt-1">Consider online courses or projects to build this skill</p>
                    </div>
                  ))}
                  {(!analysis.gaps || analysis.gaps.length === 0) && (
                    <Alert className="bg-accent/10 border-accent/30">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <AlertDescription className="text-sm">
                        No gaps detected - you meet all the core requirements!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>

              {/* Untapped Strengths */}
              <Card className="p-6 shadow-card border-2 border-primary/30 hover:border-primary/50 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold mb-1">
                      Your Unique Strengths
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Extra skills that make you stand out from other candidates
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="mb-3 bg-primary/10 text-primary border-primary/30">
                  {analysis.untappedStrengths?.length || 0} bonus skills
                </Badge>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {analysis.untappedStrengths?.map((skill: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                      <span className="font-medium text-sm">★ {skill}</span>
                      <p className="text-xs text-muted-foreground mt-1">Highlight this in your application to differentiate yourself</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tailored Resume Content */}
            {analysis.tailoredContent && (
              <Card className="p-8 shadow-card bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-semibold">
                      Resume Content Tailored For This Job
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Copy these customized sections to optimize your application
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-primary/10">Professional Summary</Badge>
                      <span className="text-xs text-muted-foreground">Use this at the top of your resume</span>
                    </div>
                    <p className="text-base leading-relaxed">{analysis.tailoredContent.summary}</p>
                  </div>

                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-primary/10">Key Achievement Bullets</Badge>
                      <span className="text-xs text-muted-foreground">Highlight these in your experience section</span>
                    </div>
                    <ul className="space-y-3">
                      {analysis.tailoredContent.bulletPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-primary font-bold flex-shrink-0">•</span>
                          <span className="text-base leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysis;
