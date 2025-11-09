import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Filter, FileText, Linkedin, Github, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { SkillValidation } from "@/components/SkillValidation";
import { supabase } from "@/integrations/supabase/client";

const SkillProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [filteredSkills, setFilteredSkills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("confidence");
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        return;
      }

      // Fetch the most recent skill profile from Supabase
      const { data, error } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const parsed = data.profile_data as any;
        setProfile(parsed);
        
        // Flatten all skills from categories
        if (parsed && parsed.categories) {
          const allSkills = Object.entries(parsed.categories).flatMap(
            ([category, skills]: [string, any]) =>
              skills.map((skill: any) => ({ ...skill, category }))
          );
          setFilteredSkills(allSkills);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    if (!profile?.categories) return;

    let skills = Object.entries(profile.categories).flatMap(
      ([category, skillList]: [string, any]) =>
        skillList.map((skill: any) => ({ ...skill, category }))
    );

    // Apply search filter
    if (searchQuery) {
      skills = skills.filter((skill: any) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      skills = skills.filter((skill: any) => skill.category === categoryFilter);
    }

    // Apply sorting
    skills.sort((a: any, b: any) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredSkills(skills);
  }, [searchQuery, categoryFilter, sortBy, profile]);

  const handleExport = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skill-profile.json";
    link.click();
  };

  const handleValidateSkill = (skillName: string) => {
    // In a real app, this would update the backend
    console.log("Validated skill:", skillName);
  };

  const handleRemoveSkill = (skillName: string) => {
    // In a real app, this would update the backend
    console.log("Removed skill:", skillName);
  };

  const openEvidence = (skill: any) => {
    setSelectedSkill(skill);
    setShowEvidenceDialog(true);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <Card className="p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold mb-4">No Profile Found</h2>
          <p className="text-muted-foreground mb-6">
            Analyze your skills first to see your profile
          </p>
          <Link to="/">
            <Button>Analyze Skills</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Your Professional Skill Profile</h1>
        <div className="flex gap-2">
          <Link to="/timeline">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Timeline
            </Button>
          </Link>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Professional Summary */}
        <div className="mb-6">
          <p className="text-lg text-muted-foreground max-w-4xl">
            {profile.summary || "A comprehensive overview of your professional skills extracted from multiple data sources."}
          </p>
        </div>

          {/* Data Sources */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-muted-foreground">Data Sources:</span>
            <div className="flex gap-2">
              {profile.dataSources?.includes('linkedin') && (
                <Badge variant="outline" className="gap-1">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </Badge>
              )}
              {profile.dataSources?.includes('github') && (
                <Badge variant="outline" className="gap-1">
                  <Github className="w-3 h-3" /> GitHub
                </Badge>
              )}
              {profile.dataSources?.includes('cv') && (
                <Badge variant="outline" className="gap-1">
                  <FileText className="w-3 h-3" /> CV
                </Badge>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="p-4 shadow-card mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(profile.categories || {}).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">Confidence Score</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => (
            <Card key={idx} className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg mb-1">{skill.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {skill.category?.replace('_', ' ')}
                  </Badge>
                </div>
                <SkillValidation 
                  skill={skill} 
                  onValidated={() => {
                    // Optionally reload or update UI after validation
                  }}
                />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-bold text-primary">{skill.confidence}%</span>
                </div>
                <Progress value={skill.confidence} className="h-2" />
              </div>

              {skill.type && (
                <Badge variant={skill.type === "explicit" ? "default" : "secondary"} className="mb-3">
                  {skill.type}
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => openEvidence(skill)}
                className="w-full"
              >
                View Evidence
              </Button>
            </Card>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <Card className="p-12 text-center shadow-card">
            <p className="text-muted-foreground">No skills found matching your filters</p>
          </Card>
        )}
      </div>

      {/* Evidence Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              Evidence supporting this skill from your data sources
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedSkill?.evidence?.map((evidence: string, idx: number) => (
              <Card key={idx} className="p-4 bg-secondary/30">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm">{evidence}</p>
                </div>
              </Card>
            ))}
            
            {(!selectedSkill?.evidence || selectedSkill.evidence.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No evidence available for this skill
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillProfile;
