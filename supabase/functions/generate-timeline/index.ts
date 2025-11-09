import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileData, userId } = await req.json();
    
    if (!profileData || !userId) {
      throw new Error('Profile data and user ID are required');
    }

    console.log('Generating timeline for user:', userId);

    const timelineEntries: any[] = [];

    // Process each skill category
    Object.entries(profileData.categories || {}).forEach(([category, skills]: [string, any]) => {
      if (!Array.isArray(skills)) return;

      skills.forEach((skill: any) => {
        // Extract dates from evidence
        const dates: Date[] = [];
        
        if (skill.evidence && Array.isArray(skill.evidence)) {
          skill.evidence.forEach((evidenceItem: string) => {
            // Look for various date patterns in evidence
            const datePatterns = [
              /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/gi,
              /\b\d{4}-\d{2}-\d{2}\b/g,
              /\b\d{4}\b/g, // Just year
            ];

            datePatterns.forEach(pattern => {
              const matches = evidenceItem.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  try {
                    const date = new Date(match);
                    if (!isNaN(date.getTime())) {
                      dates.push(date);
                    }
                  } catch (e) {
                    // Invalid date, skip
                  }
                });
              }
            });
          });
        }

        // If no dates found in evidence, estimate based on current date
        let firstObserved: string;
        let lastObserved: string;

        if (dates.length > 0) {
          dates.sort((a, b) => a.getTime() - b.getTime());
          firstObserved = dates[0].toISOString().split('T')[0];
          lastObserved = dates[dates.length - 1].toISOString().split('T')[0];
        } else {
          // Default: skill discovered 2 years ago, still relevant today
          const now = new Date();
          const twoYearsAgo = new Date(now);
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
          
          firstObserved = twoYearsAgo.toISOString().split('T')[0];
          lastObserved = now.toISOString().split('T')[0];
        }

        // Create milestones from evidence
        const milestones: any[] = [];
        if (skill.evidence && skill.evidence.length > 0) {
          skill.evidence.slice(0, 3).forEach((evidence: string, idx: number) => {
            // Determine source from evidence text
            let source = 'CV';
            if (evidence.toLowerCase().includes('github')) source = 'GitHub';
            else if (evidence.toLowerCase().includes('linkedin')) source = 'LinkedIn';
            else if (evidence.toLowerCase().includes('from cv')) source = 'CV';
            else if (evidence.toLowerCase().includes('from github')) source = 'GitHub';
            else if (evidence.toLowerCase().includes('from linkedin')) source = 'LinkedIn';

            // Use evidence text, but truncate if too long
            let description = evidence.replace(/^From (CV|GitHub|LinkedIn):\s*/i, '');
            if (description.length > 150) {
              description = description.substring(0, 150) + '...';
            }

            const milestoneDate = dates[idx] || new Date(firstObserved);
            
            milestones.push({
              date: milestoneDate.toISOString().split('T')[0],
              source,
              description
            });
          });
        }

        // Add timeline entry
        timelineEntries.push({
          user_id: userId,
          skill_name: skill.name,
          category,
          first_observed_date: firstObserved,
          last_observed_date: lastObserved,
          milestones: milestones.length > 0 ? milestones : null,
        });
      });
    });

    console.log(`Generated ${timelineEntries.length} timeline entries`);

    // Return the timeline entries (caller will insert them)
    return new Response(
      JSON.stringify({ timeline: timelineEntries }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-timeline function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate timeline' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
