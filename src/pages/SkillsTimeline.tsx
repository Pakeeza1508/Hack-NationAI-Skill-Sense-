import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Milestone, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimelineSkill {
  skill_name: string;
  category: string;
  first_observed_date: string;
  last_observed_date: string;
  milestones: Array<{
    date: string;
    source: string;
    description: string;
  }>;
}

const SkillsTimeline = () => {
  const [timelineData, setTimelineData] = useState<TimelineSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch timeline data directly from the database (populated by generate-timeline)
      const { data, error } = await supabase
        .from('skill_timeline')
        .select('*')
        .eq('user_id', user.id)
        .order('first_observed_date', { ascending: false });

      if (error) throw error;
      
      // Cast milestones from Json to proper type
      const typedData = (data || []).map(item => ({
        ...item,
        milestones: (item.milestones as any) || []
      }));
      
      setTimelineData(typedData);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical_skills: 'bg-blue-500',
      software_engineering: 'bg-purple-500',
      data_analytics: 'bg-green-500',
      business_management: 'bg-orange-500',
      hr_people_management: 'bg-pink-500',
      leadership_skills: 'bg-red-500',
      soft_skills: 'bg-teal-500',
      domain_expertise: 'bg-indigo-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
    return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl font-bold">Skills Development Timeline</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track your skill acquisition and development over time
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {timelineData.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Timeline Data</h2>
            <p className="text-muted-foreground">
              Analyze your skills first to see your development timeline
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {timelineData.map((skill, idx) => (
              <Card key={idx} className="p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{skill.skill_name}</h3>
                      <Badge variant="outline">
                        {skill.category.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(skill.first_observed_date)} - {formatDate(skill.last_observed_date)}
                      </span>
                      <span>•</span>
                      <span>{calculateDuration(skill.first_observed_date, skill.last_observed_date)}</span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(skill.category)}`} />
                </div>

                {/* Timeline Milestones */}
                <div className="relative pl-6 mt-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {skill.milestones.map((milestone, mIdx) => (
                      <div key={mIdx} className="relative">
                        <div className="absolute -left-[1.4rem] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Milestone className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              {formatDate(milestone.date)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {milestone.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsTimeline;
