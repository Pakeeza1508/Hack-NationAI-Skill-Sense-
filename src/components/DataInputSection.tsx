import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Eye, FileText, Briefcase, Globe, Code, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitHubPreview } from "./GitHubPreview";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataInputSectionProps {
  onProfileGenerated: (profile: any) => void;
}

export const DataInputSection = ({ onProfileGenerated }: DataInputSectionProps) => {
  // Professional Profile Sources
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubData, setGithubData] = useState<any>(null);
  const [blogsText, setBlogsText] = useState("");
  const [publicationsText, setPublicationsText] = useState("");
  
  // Internal/Performance Documents
  const [performanceReviews, setPerformanceReviews] = useState("");
  const [performanceFiles, setPerformanceFiles] = useState<File[]>([]);
  const [goalsObjectives, setGoalsObjectives] = useState("");
  const [referenceLetters, setReferenceLetters] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  
  // UI State
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

  const handleMultipleFileUpload = async (
    files: FileList | null,
    setFiles: (files: File[]) => void,
    setText: (text: string) => void,
    currentText: string
  ) => {
    if (!files || files.length === 0) return;

    const uploadedFiles: File[] = [];
    let combinedText = currentText;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive",
        });
        continue;
      }

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
        combinedText += `\n\n--- ${file.name} ---\n${text}`;
        uploadedFiles.push(file);
        
      } catch (error: any) {
        console.error('File upload error:', error);
        toast({
          title: "Upload Failed",
          description: `${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    setFiles(uploadedFiles);
    setText(combinedText);
    setIsProcessing(false);
    
    if (uploadedFiles.length > 0) {
      toast({
        title: "Files Uploaded Successfully",
        description: `${uploadedFiles.length} file(s) processed.`,
      });
    }
  };

  const handleAnalyze = async () => {
    // Validate required fields
    if (!cvText) {
      toast({
        title: "CV Required",
        description: "Please provide your CV or resume text.",
        variant: "destructive",
      });
      return;
    }

    if (!linkedinUrl) {
      toast({
        title: "LinkedIn Required",
        description: "Please provide your LinkedIn profile URL.",
        variant: "destructive",
      });
      return;
    }

    if (!githubUrl) {
      toast({
        title: "GitHub Required",
        description: "Please provide your GitHub profile URL.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let githubInfo = githubData;
      let linkedinInfo = linkedinData;

      // Fetch GitHub data if not already fetched
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

      // Fetch LinkedIn data if not already fetched
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

      // Extract skills using AI with ALL data sources
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: {
          // Professional Profile Sources
          cvText,
          linkedinUrl,
          linkedinData: linkedinInfo,
          githubUrl,
          githubData: githubInfo,
          blogsText,
          publicationsText,
          // Internal/Performance Documents
          performanceReviews,
          goalsObjectives,
          referenceLetters,
        },
      });

      if (error) throw error;

      // Track all data sources used
      const dataSources = [];
      if (cvText || cvFile) dataSources.push('cv');
      if (linkedinUrl) dataSources.push('linkedin');
      if (githubUrl) dataSources.push('github');
      if (blogsText) dataSources.push('blogs');
      if (publicationsText) dataSources.push('publications');
      if (performanceReviews) dataSources.push('performance_reviews');
      if (goalsObjectives) dataSources.push('goals');
      if (referenceLetters) dataSources.push('references');

      const enrichedData = {
        ...data,
        dataSources,
        sourceMetadata: {
          professionalProfile: {
            cv: !!cvText,
            linkedin: !!linkedinUrl,
            github: !!githubUrl,
            blogs: !!blogsText,
            publications: !!publicationsText,
          },
          internalDocuments: {
            performanceReviews: !!performanceReviews,
            goals: !!goalsObjectives,
            references: !!referenceLetters,
          }
        }
      };

      // Save to localStorage for now (no authentication required)
      localStorage.setItem('skillProfile', JSON.stringify(enrichedData));

      onProfileGenerated(enrichedData);
      
      toast({
        title: "Analysis Complete!",
        description: "Your comprehensive skill profile has been generated from all data sources.",
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
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3">Multi-Source Skill Aggregation</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Provide comprehensive data from professional profiles AND internal company documents for the most accurate skill assessment
          </p>
        </div>

        <Alert className="mb-8 border-primary/30 bg-primary/5">
          <FileCheck className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            <strong>Our AI aggregates data from multiple distinct sources:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Professional Profile:</strong> CV, LinkedIn, GitHub, Blogs, Publications</li>
              <li><strong>Internal Documents:</strong> Performance Reviews, Goals/Objectives, Reference Letters</li>
            </ul>
            All sources are cross-referenced and analyzed together for comprehensive skill extraction.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="professional" className="text-base">
              <Globe className="w-4 h-4 mr-2" />
              Professional Profile Sources
            </TabsTrigger>
            <TabsTrigger value="internal" className="text-base">
              <Briefcase className="w-4 h-4 mr-2" />
              Internal Company Documents
            </TabsTrigger>
          </TabsList>

          {/* PROFESSIONAL PROFILE SOURCES */}
          <TabsContent value="professional" className="space-y-6">
            <Card className="p-8 shadow-card">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Professional Experience Data
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Public-facing professional information and work history
                  </p>
                </div>

                {/* CV/Resume */}
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

                {/* LinkedIn */}
                <div>
                  <Label htmlFor="linkedin-url" className="text-base font-semibold">
                    LinkedIn Profile URL <span className="text-destructive">*</span>
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
                    <span className="text-destructive font-semibold">Required:</span> Posts, experience, and network activity will be analyzed
                  </p>
                </div>

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

                {/* GitHub */}
                <div>
                  <Label htmlFor="github-url" className="text-base font-semibold">
                    GitHub Profile URL <span className="text-destructive">*</span>
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
                    <span className="text-destructive font-semibold">Required:</span> Repositories, languages, and contributions analyzed
                  </p>
                </div>

                {showGithubPreview && githubData && (
                  <GitHubPreview data={githubData} />
                )}

                {/* Blogs */}
                <div>
                  <Label htmlFor="blogs-text" className="text-base font-semibold">
                    Blog Posts / Articles (Optional)
                  </Label>
                  <Textarea
                    id="blogs-text"
                    placeholder="Paste links or content from your blog posts, Medium articles, or other published content..."
                    value={blogsText}
                    onChange={(e) => setBlogsText(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Include thought leadership content and technical articles you've written
                  </p>
                </div>

                {/* Publications */}
                <div>
                  <Label htmlFor="publications-text" className="text-base font-semibold">
                    Publications / Research (Optional)
                  </Label>
                  <Textarea
                    id="publications-text"
                    placeholder="Paste academic publications, research papers, whitepapers, or conference presentations..."
                    value={publicationsText}
                    onChange={(e) => setPublicationsText(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Academic or professional research work demonstrating expertise
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* INTERNAL COMPANY DOCUMENTS */}
          <TabsContent value="internal" className="space-y-6">
            <Card className="p-8 shadow-card">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Internal Performance & Reference Documents
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Company-internal assessments, goals, and recommendations
                  </p>
                </div>

                {/* Performance Reviews */}
                <div>
                  <Label htmlFor="performance-reviews" className="text-base font-semibold">
                    Performance Reviews (Optional)
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="performance-files"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      multiple
                      onChange={(e) => handleMultipleFileUpload(
                        e.target.files,
                        setPerformanceFiles,
                        setPerformanceReviews,
                        performanceReviews
                      )}
                      disabled={isProcessing}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload performance review documents (multiple files allowed)
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
                    id="performance-reviews"
                    placeholder="Paste your performance reviews, annual assessments, or manager feedback..."
                    value={performanceReviews}
                    onChange={(e) => setPerformanceReviews(e.target.value)}
                    className="mt-2 min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Internal assessments provide validated evidence of your skills and achievements
                  </p>
                </div>

                {/* Goals & Objectives */}
                <div>
                  <Label htmlFor="goals-objectives" className="text-base font-semibold">
                    Goals & Objectives (Optional)
                  </Label>
                  <Textarea
                    id="goals-objectives"
                    placeholder="Paste your OKRs, goal documents, project objectives, or career development plans..."
                    value={goalsObjectives}
                    onChange={(e) => setGoalsObjectives(e.target.value)}
                    className="mt-2 min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Goal statements reveal strategic thinking, initiative, and areas of focus
                  </p>
                </div>

                {/* Reference Letters */}
                <div>
                  <Label htmlFor="reference-letters" className="text-base font-semibold">
                    Reference Letters / Recommendations (Optional)
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="reference-files"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      multiple
                      onChange={(e) => handleMultipleFileUpload(
                        e.target.files,
                        setReferenceFiles,
                        setReferenceLetters,
                        referenceLetters
                      )}
                      disabled={isProcessing}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload reference letters or recommendation documents
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
                    id="reference-letters"
                    placeholder="Paste reference letters, LinkedIn recommendations, or endorsements..."
                    value={referenceLetters}
                    onChange={(e) => setReferenceLetters(e.target.value)}
                    className="mt-2 min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Third-party validation of your skills from colleagues and managers
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Analyze Button */}
        <Card className="p-6 mt-8 shadow-card bg-gradient-to-br from-card to-primary/5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {cvText && <Badge variant="outline" className="bg-accent/10">✓ CV</Badge>}
                  {linkedinUrl && <Badge variant="outline" className="bg-accent/10">✓ LinkedIn</Badge>}
                  {githubUrl && <Badge variant="outline" className="bg-accent/10">✓ GitHub</Badge>}
                  {blogsText && <Badge variant="outline" className="bg-primary/10">+ Blogs</Badge>}
                  {publicationsText && <Badge variant="outline" className="bg-primary/10">+ Publications</Badge>}
                  {performanceReviews && <Badge variant="outline" className="bg-primary/10">+ Performance Reviews</Badge>}
                  {goalsObjectives && <Badge variant="outline" className="bg-primary/10">+ Goals</Badge>}
                  {referenceLetters && <Badge variant="outline" className="bg-primary/10">+ References</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI will aggregate and cross-reference all provided data sources for comprehensive skill extraction
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
                  Analyzing Multi-Source Data...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Analyze All Sources & Generate Skill Profile
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
