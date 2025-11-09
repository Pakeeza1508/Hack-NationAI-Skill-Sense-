import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface DataInputSectionProps {
  onProfileGenerated: (profile: any) => void;
}

export const DataInputSection = ({ onProfileGenerated }: DataInputSectionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [performanceReviewText, setPerformanceReviewText] = useState("");
  const [goalsObjectivesText, setGoalsObjectivesText] = useState("");
  const [referenceLettersText, setReferenceLettersText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setCvFile(file);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-cv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse file');
      }

      const { text } = await response.json();
      setCvText(text);
      
      toast({
        title: "File Uploaded Successfully",
        description: `${file.name} has been parsed and loaded.`,
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to parse file. Please try again.",
        variant: "destructive",
      });
      setCvFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!cvText && !githubUrl && !performanceReviewText && !goalsObjectivesText && !referenceLettersText) {
      toast({
        title: "Input Required",
        description: "Please provide at least one data source.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let githubData = null;
      const dataSources: string[] = [];

      if (githubUrl) {
        try {
          const { data: ghData, error: ghError } = await supabase.functions.invoke('fetch-github', {
            body: { githubUrl },
          });
          
          if (ghError) throw ghError;

          githubData = ghData;
          dataSources.push('github');
          console.log('GitHub data fetched successfully:', githubData);
        } catch (err: any) {
          console.error('GitHub fetch error:', err);
          // Check if it's a rate limit error
          const isRateLimit = err.message?.includes('rate limit') || err.message?.includes('403');
          toast({
            title: isRateLimit ? "GitHub Rate Limit" : "GitHub Data Error",
            description: isRateLimit 
              ? "GitHub API rate limit reached. Continuing with CV data only." 
              : "Could not fetch GitHub data. Continuing with CV data only.",
            variant: "default",
          });
          // Continue without GitHub data
        }
      }

      if (cvText) dataSources.push('cv');
      if (performanceReviewText) dataSources.push('performanceReview');
      if (goalsObjectivesText) dataSources.push('goalsObjectives');
      if (referenceLettersText) dataSources.push('referenceLetters');

      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: { 
          cvText,
          githubData,
          performanceReviewText,
          goalsObjectivesText,
          referenceLettersText,
          userId: user?.id,
        },
      });

      if (error) throw error;

      const enrichedData = {
        ...data,
        dataSources,
        sources: {
          cv: !!cvText,
          github: githubData ? githubUrl : null,
        }
      };

      onProfileGenerated(enrichedData);
      
      toast({
        title: "Analysis Complete!",
        description: `Your skill profile has been generated from ${dataSources.length} source(s).`,
      });

    } catch (error: any) {
      console.error("Error analyzing skills:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3">Comprehensive Skill Analysis</h2>
          <p className="text-lg text-muted-foreground">
            Discover your complete skill profile from CV, GitHub, and other professional documents.
          </p>
        </div>

        <Card className="p-8 shadow-card">
          <div className="space-y-6">
            {/* CV Input */}
            <div>
              <Label htmlFor="cv-file" className="text-base font-semibold">
                CV / Resume
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  id="cv-file"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Upload your resume (PDF, DOC, DOCX, or TXT - max 10MB)
                </p>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>
              <Textarea
                id="cv-text"
                placeholder="Paste your CV or resume content here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="mt-2 min-h-[200px]"
                disabled={isProcessing}
              />
            </div>

            {/* GitHub Input */}
            <div>
              <Label htmlFor="github-url" className="text-base font-semibold">
                GitHub Profile URL
              </Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/yourusername"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isProcessing}
                className="mt-2"
              />
            </div>

            {/* Internal Documents */}
            <div>
              <Label htmlFor="performance-review" className="text-base font-semibold">
                Performance Review
              </Label>
              <Textarea
                id="performance-review"
                placeholder="Paste text from your latest performance review..."
                value={performanceReviewText}
                onChange={(e) => setPerformanceReviewText(e.target.value)}
                className="mt-2 min-h-[150px]"
                disabled={isProcessing}
              />
            </div>

            <div>
              <Label htmlFor="goals-objectives" className="text-base font-semibold">
                Goals & Objectives
              </Label>
              <Textarea
                id="goals-objectives"
                placeholder="List your current or upcoming goals and objectives..."
                value={goalsObjectivesText}
                onChange={(e) => setGoalsObjectivesText(e.target.value)}
                className="mt-2 min-h-[150px]"
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <Label htmlFor="reference-letters" className="text-base font-semibold">
                Reference Letters
              </Label>
              <Textarea
                id="reference-letters"
                placeholder="Paste content from any reference letters..."
                value={referenceLettersText}
                onChange={(e) => setReferenceLettersText(e.target.value)}
                className="mt-2 min-h-[150px]"
                disabled={isProcessing}
              />
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isProcessing || (!cvText && !githubUrl && !performanceReviewText && !goalsObjectivesText && !referenceLettersText)}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Upload className="mr-2 h-5 w-5" /> Analyze Skills</>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
