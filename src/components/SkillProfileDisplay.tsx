import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, Edit } from "lucide-react";

interface SkillProfileDisplayProps {
  profile: any;
  onReset: () => void;
}

export const SkillProfileDisplay = ({ profile, onReset }: SkillProfileDisplayProps) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skill-profile.json";
    link.click();
  };

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Skill Profile</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="p-6 mb-6 shadow-card">
          <h3 className="text-xl font-semibold mb-3">Summary</h3>
          <p className="text-muted-foreground">{profile.summary}</p>
        </Card>

        {/* Skill Categories */}
        {Object.entries(profile.categories || {}).map(([category, skills]: [string, any]) => (
          <Card key={category} className="p-6 mb-6 shadow-card">
            <h3 className="text-2xl font-semibold mb-4 capitalize">{category}</h3>
            <div className="space-y-4">
              {skills.map((skill: any, index: number) => (
                <SkillItem key={index} skill={skill} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

const SkillItem = ({ skill }: { skill: any }) => (
  <div className="p-4 bg-secondary/50 rounded-lg border border-border">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-lg mb-1">{skill.name}</h4>
        {skill.type && (
          <Badge variant="outline" className="mb-2">
            {skill.type}
          </Badge>
        )}
      </div>
      <div className="text-right">
        <div className="text-sm text-muted-foreground mb-1">Confidence</div>
        <div className="text-2xl font-bold text-primary">{skill.confidence}%</div>
      </div>
    </div>
    
    <Progress value={skill.confidence} className="mb-3 h-2" />
    
    {skill.evidence && skill.evidence.length > 0 && (
      <div className="mt-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">Evidence:</div>
        <ul className="space-y-1">
          {skill.evidence.map((evidence: string, idx: number) => (
            <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
              {evidence}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
