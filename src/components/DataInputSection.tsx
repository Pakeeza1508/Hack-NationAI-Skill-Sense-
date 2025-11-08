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
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
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
      // Create FormData to send file
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
    if (!cvText && !linkedinUrl && !githubUrl) {
      toast({
        title: "Input Required",
        description: "Please provide at least one data source to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: {
          cvText,
          linkedinUrl,
          githubUrl,
        },
      });

      if (error) throw error;

      onProfileGenerated(data);
      
      toast({
        title: "Analysis Complete!",
        description: "Your skill profile has been generated successfully.",
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
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-8 shadow-card">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Input Your Data</h2>
              <p className="text-muted-foreground">
                Provide information from multiple sources for the most comprehensive analysis
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cv-file" className="text-base font-semibold">
                  Upload CV / Resume
                </Label>
                <div className="mt-2">
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a PDF or text file (max 10MB)
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <div>
                <Label htmlFor="cv-text" className="text-base font-semibold">
                  CV / Resume Text
                </Label>
                <Textarea
                  id="cv-text"
                  placeholder="Paste your CV or resume content here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="mt-2 min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="linkedin-url" className="text-base font-semibold">
                  LinkedIn Profile URL (Optional)
                </Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Provide your LinkedIn URL for additional context
                </p>
              </div>

              <div>
                <Label htmlFor="github-url" className="text-base font-semibold">
                  GitHub Profile URL (Optional)
                </Label>
                <Input
                  id="github-url"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Provide your GitHub URL for technical skill analysis
                </p>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Your Skills...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Analyze Skills
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
