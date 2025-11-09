import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, CheckCircle, XCircle, Sparkles, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
        <h1 className="font-heading text-xl font-bold">Analyze Your Skill Gaps</h1>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold mb-2">Paste a job description below to get started:</h2>
          <p className="text-muted-foreground">
            Compare your skills against any job posting to identify matches and gaps
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-card">
          <div className="space-y-4">
            <div>
              <label className="text-base font-semibold mb-2 block">
                Job Description
              </label>
              <Textarea
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px]"
              />
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  Analyze Skill Gaps
                </>
              )}
            </Button>
          </div>
        </Card>

        {analysis && (
          <div className="space-y-6">
            {/* Match Score */}
            <Card className="p-8 text-center shadow-card">
              <h2 className="text-xl font-semibold mb-4">Overall Match</h2>
              <div className="text-6xl font-bold text-primary mb-4">
                {analysis.matchPercentage}%
              </div>
              <Progress value={analysis.matchPercentage} className="h-3 mb-4" />
              <p className="text-muted-foreground">
                {analysis.matchPercentage >= 80 && "Excellent match! You're well-qualified for this role."}
                {analysis.matchPercentage >= 60 && analysis.matchPercentage < 80 && "Good match! A few areas to develop."}
                {analysis.matchPercentage < 60 && "Some gaps to address, but great learning opportunities!"}
              </p>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Matching Skills */}
              <Card className="p-6 shadow-card border-2 border-accent/20">
                <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  ✅ Your Matching Skills
                </h3>
                <p className="text-xs text-muted-foreground mb-4">{analysis.matches?.length || 0} skills match</p>
                <div className="space-y-2">
                  {analysis.matches?.map((skill: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-accent/10">
                      <span className="font-medium text-sm">{skill.name}</span>
                    </div>
                  ))}
                  {(!analysis.matches || analysis.matches.length === 0) && (
                    <p className="text-sm text-muted-foreground">No direct matches found</p>
                  )}
                </div>
              </Card>

              {/* Skill Gaps */}
              <Card className="p-6 shadow-card border-2 border-warning/20">
                <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-warning" />
                  🔶 Skills to Develop
                </h3>
                <p className="text-xs text-muted-foreground mb-4">{analysis.gaps?.length || 0} gaps identified</p>
                <div className="space-y-2">
                  {analysis.gaps?.map((skill: string, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-warning/10">
                      <span className="font-medium text-sm">{skill}</span>
                    </div>
                  ))}
                  {(!analysis.gaps || analysis.gaps.length === 0) && (
                    <p className="text-sm text-muted-foreground">No gaps - you're fully qualified!</p>
                  )}
                </div>
              </Card>

              {/* Untapped Strengths */}
              <Card className="p-6 shadow-card border-2 border-primary/20">
                <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  ✨ Your Extras
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {analysis.untappedStrengths?.length || 0} bonus skills
                </p>
                <div className="space-y-2">
                  {analysis.untappedStrengths?.map((skill: string, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-primary/10">
                      <span className="font-medium text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tailored Resume Content */}
            {analysis.tailoredContent && (
              <Card className="p-6 shadow-card">
                <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tailored For You
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Custom Summary</h4>
                    <p className="text-muted-foreground prose">{analysis.tailoredContent.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Achievement Bullet Points</h4>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground prose">
                      {analysis.tailoredContent.bulletPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
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
