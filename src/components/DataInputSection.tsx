import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataInputSectionProps {
  onProfileGenerated: (profile: any) => void;
}

export const DataInputSection = ({ onProfileGenerated }: DataInputSectionProps) => {
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-cv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
    if (!cvText && !githubUrl) {
      toast({
        title: "Input Required",
        description: "Please provide at least one data source (CV or GitHub).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let githubData = null;
      const dataSources: string[] = [];

      // Fetch GitHub data if URL provided
      if (githubUrl) {
        try {
          const { data: ghData, error: ghError } = await supabase.functions.invoke('fetch-github', {
            body: { githubUrl },
          });
          
          if (ghError) {
            console.error('GitHub fetch error:', ghError);
            toast({
              title: "GitHub Data Unavailable",
              description: "Could not fetch GitHub data. Continuing with other sources.",
              variant: "default",
            });
          } else {
            githubData = ghData;
            dataSources.push('github');
          }
        } catch (err) {
          console.error('GitHub error:', err);
        }
      }

      if (cvText) {
        dataSources.push('cv');
      }

      // Extract skills from all available sources
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: { 
          cvText,
          githubData
        },
      });

      if (error) throw error;

      const enrichedData = {
        ...data,
        dataSources,
        sources: {
          cv: cvText ? true : false,
          github: githubData ? githubUrl : null,
        }
      };

      localStorage.setItem('skillProfile', JSON.stringify(enrichedData));
      onProfileGenerated(enrichedData);
      
      toast({
        title: "Analysis Complete!",
        description: `Your skill profile has been generated from ${dataSources.length} source(s).`,
      });

    } catch (error: any) {
      console.error("Error analyzing skills:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze your skills. Please try again.",
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
            Discover your complete skill profile from CV and GitHub repositories
          </p>
        </div>

        <Card className="p-8 shadow-card">
          <div className="space-y-6">
            <div>
              <Label htmlFor="cv-file" className="text-base font-semibold">
                CV / Resume <span className="text-destructive">*</span>
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
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
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
              />
            </div>

            <div>
              <Label htmlFor="github-url" className="text-base font-semibold">
                GitHub Profile URL
              </Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/yourusername or just username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isProcessing}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Analyze your repositories and contributions
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isProcessing || (!cvText && !githubUrl)}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Multi-Source Data...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Analyze Skills from All Sources
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
