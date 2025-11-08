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
    <div className="min-h-screen bg-gradient-card">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-primary" />
            Skill Gap Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Compare your skills against a job description to identify matches and gaps
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

            <div className="grid md:grid-cols-2 gap-6">
              {/* Matching Skills */}
              <Card className="p-6 shadow-card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Matching Skills ({analysis.matches?.length || 0})
                </h3>
                <div className="space-y-2">
                  {analysis.matches?.map((skill: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="font-medium">{skill.name}</span>
                      <Badge className="bg-green-500">{skill.confidence}%</Badge>
                    </div>
                  ))}
                  {(!analysis.matches || analysis.matches.length === 0) && (
                    <p className="text-sm text-muted-foreground">No direct matches found</p>
                  )}
                </div>
              </Card>

              {/* Skill Gaps */}
              <Card className="p-6 shadow-card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Skills to Develop ({analysis.gaps?.length || 0})
                </h3>
                <div className="space-y-2">
                  {analysis.gaps?.map((skill: string, idx: number) => (
                    <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{skill}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(skill + ' online courses')}`, '_blank')}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Find Learning Resources
                      </Button>
                    </div>
                  ))}
                  {(!analysis.gaps || analysis.gaps.length === 0) && (
                    <p className="text-sm text-muted-foreground">No gaps identified - you're fully qualified!</p>
                  )}
                </div>
              </Card>

              {/* Untapped Strengths */}
              {analysis.untappedStrengths && analysis.untappedStrengths.length > 0 && (
                <Card className="p-6 shadow-card md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Your Untapped Strengths ({analysis.untappedStrengths.length})
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skills you have that aren't required for this role - potential differentiators!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.untappedStrengths.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations && (
              <Card className="p-6 shadow-card">
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{analysis.recommendations}</p>
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
