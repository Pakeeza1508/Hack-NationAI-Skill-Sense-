import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitHubPreview } from "./GitHubPreview";

interface DataInputSectionProps {
  onProfileGenerated: (profile: any) => void;
}

export const DataInputSection = ({ onProfileGenerated }: DataInputSectionProps) => {
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubData, setGithubData] = useState<any>(null);
  const [showGithubPreview, setShowGithubPreview] = useState(false);
  const [showLinkedinPreview, setShowLinkedinPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [isFetchingLinkedin, setIsFetchingLinkedin] = useState(false);
  const { toast } = useToast();

  const handleFetchGithubData = async () => {
    if (!githubUrl) {
      toast({
        title: "GitHub URL Required",
        description: "Please enter a GitHub profile URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingGithub(true);
    try {
      const { data: fetchedGithubData, error: githubError } = await supabase.functions.invoke('fetch-github', {
        body: { githubUrl },
      });

      if (githubError) throw githubError;
      
      setGithubData(fetchedGithubData);
      setShowGithubPreview(true);
      
      toast({
        title: "GitHub Data Fetched",
        description: "Successfully retrieved GitHub profile and repository data.",
      });
    } catch (error: any) {
      console.error("GitHub fetch error:", error);
      toast({
        title: "Failed to Fetch GitHub Data",
        description: error.message || "Could not retrieve GitHub data. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleFetchLinkedinData = async () => {
    if (!linkedinUrl) {
      toast({
        title: "LinkedIn URL Required",
        description: "Please enter a LinkedIn profile URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingLinkedin(true);
    try {
      const { data: fetchedLinkedinData, error: linkedinError } = await supabase.functions.invoke('scrape-linkedin', {
        body: { linkedinUrl },
      });

      if (linkedinError) throw linkedinError;
      
      setLinkedinData(fetchedLinkedinData);
      setShowLinkedinPreview(true);
      
      toast({
        title: "LinkedIn Data Fetched",
        description: "Successfully retrieved LinkedIn profile and posts.",
      });
    } catch (error: any) {
      console.error("LinkedIn fetch error:", error);
      toast({
        title: "Failed to Fetch LinkedIn Data",
        description: error.message || "Could not retrieve LinkedIn data. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingLinkedin(false);
    }
  };


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
      // Check for authenticated user FIRST
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to analyze and save your skill profile.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      let githubInfo = githubData;
      let linkedinInfo = linkedinData;

      // Fetch GitHub data if URL is provided and not already fetched
      if (githubUrl && !githubData) {
        try {
          const { data: fetchedGithubData, error: githubError } = await supabase.functions.invoke('fetch-github', {
            body: { githubUrl },
          });

          if (!githubError) {
            githubInfo = fetchedGithubData;
            setGithubData(fetchedGithubData);
          }
        } catch (error) {
          console.warn("GitHub fetch warning:", error);
        }
      }

      // Fetch LinkedIn data if URL is provided and not already fetched
      if (linkedinUrl && !linkedinData) {
        try {
          const { data: fetchedLinkedinData, error: linkedinError } = await supabase.functions.invoke('scrape-linkedin', {
            body: { linkedinUrl },
          });

          if (!linkedinError) {
            linkedinInfo = fetchedLinkedinData;
            setLinkedinData(fetchedLinkedinData);
          }
        } catch (error) {
          console.warn("LinkedIn fetch warning:", error);
        }
      }

      // Extract skills using AI with detailed sentiment analysis
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: {
          cvText,
          linkedinUrl,
          linkedinData: linkedinInfo,
          githubUrl,
          githubData: githubInfo,
        },
      });

      if (error) throw error;

      // Add data sources metadata
      const dataSources = [];
      if (cvText || cvFile) dataSources.push('cv');
      if (linkedinUrl) dataSources.push('linkedin');
      if (githubUrl) dataSources.push('github');

      const enrichedData = {
        ...data,
        dataSources,
      };

      // STEP 1: Save profile to Supabase instead of localStorage
      const { data: savedProfile, error: saveError } = await supabase
        .from('skill_profiles')
        .insert({
          user_id: user.id,
          profile_data: enrichedData,
          data_sources: dataSources,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      console.log('Profile saved to Supabase:', savedProfile.id);

      // STEP 2: Generate timeline from the profile
      toast({
        title: "Generating Timeline",
        description: "Creating your skill development timeline...",
      });

      const { data: timelineData, error: timelineError } = await supabase.functions.invoke('generate-timeline', {
        body: {
          profileData: enrichedData,
          userId: user.id,
        },
      });

      if (timelineError) {
        console.error('Timeline generation error:', timelineError);
      } else if (timelineData?.timeline) {
        // Insert timeline entries into the database
        const { error: insertError } = await supabase
          .from('skill_timeline')
          .insert(timelineData.timeline);

        if (insertError) {
          console.error('Timeline insert error:', insertError);
        } else {
          console.log(`Inserted ${timelineData.timeline.length} timeline entries`);
        }
      }

      // Pass the saved profile data to parent component
      onProfileGenerated({
        ...enrichedData,
        id: savedProfile.id,
      });
      
      toast({
        title: "Analysis Complete!",
        description: "Your skill profile has been generated and saved successfully.",
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
                    Upload your resume as PDF or text file (max 10MB)
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
                <div className="flex gap-2 mt-2">
                  <Input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchLinkedinData}
                    disabled={isFetchingLinkedin || !linkedinUrl}
                  >
                    {isFetchingLinkedin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your LinkedIn profile URL to analyze your posts, experience, and skills
                </p>
              </div>

              {/* LinkedIn Preview */}
              {showLinkedinPreview && linkedinData && (
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">LinkedIn Data Preview</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Profile:</strong> {linkedinData.headline || 'N/A'}</p>
                    <p><strong>Posts Found:</strong> {linkedinData.posts?.length || 0}</p>
                    <p><strong>Experience Entries:</strong> {linkedinData.experience?.length || 0}</p>
                  </div>
                </Card>
              )}

              <div>
                <Label htmlFor="github-url" className="text-base font-semibold">
                  GitHub Profile URL (Optional)
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="github-url"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchGithubData}
                    disabled={isFetchingGithub || !githubUrl}
                  >
                    {isFetchingGithub ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Click preview to fetch GitHub repository data
                </p>
              </div>

              {/* GitHub Preview */}
              {showGithubPreview && githubData && (
                <GitHubPreview data={githubData} />
              )}
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
