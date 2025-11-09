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
    const { userProfile, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing skill gaps using Lovable AI...');

    // Extract user's skills
    const userSkills = Object.values(userProfile.categories || {})
      .flat()
      .map((skill: any) => ({ name: skill.name, confidence: skill.confidence }));

    const prompt = `You are an HONEST career advisor performing a skill gap analysis. You must be brutally honest and accurate.

CANDIDATE'S ACTUAL SKILL PROFILE:
${JSON.stringify(userSkills, null, 2)}

CANDIDATE'S FULL PROFILE DATA:
${JSON.stringify(userProfile, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

CRITICAL INSTRUCTIONS - DO NOT HALLUCINATE:

1. MATCH PERCENTAGE CALCULATION:
   - Only count skills as "matching" if they appear in BOTH the candidate's profile AND the job description
   - If the candidate is a beginner with no relevant experience for this role, the match percentage should be LOW (0-30%)
   - Be HONEST - don't inflate scores

2. MATCHING SKILLS:
   - ONLY list skills that the candidate ACTUALLY HAS (from their profile) that the job REQUIRES
   - Each match must have evidence from the candidate's actual profile
   - Format: [{"name": "Skill Name", "evidence": "actual quote or reference from their profile"}]

3. SKILL GAPS:
   - List ALL skills required by the job that the candidate does NOT have
   - Be specific about what's missing

4. UNTAPPED STRENGTHS:
   - ONLY list skills the candidate HAS that are NOT required by the job
   - These are bonus skills, not gaps

5. TAILORED CONTENT:
   - Summary: Write ONLY based on what the candidate has actually done (from their profile)
   - DO NOT make up achievements or experiences
   - If they're a beginner, acknowledge it honestly
   - Bullet Points: Create ONLY from their ACTUAL experiences in the profile
   - NEVER fabricate projects, roles, or achievements they haven't done
   - If they lack relevant experience, suggest ways to FRAME their existing experience, not invent new ones

Return JSON with this structure:
{
  "matchPercentage": <honest number 0-100>,
  "matches": [{"name": "Skill", "evidence": "from their actual profile"}],
  "gaps": ["Missing Skill 1", "Missing Skill 2"],
  "untappedStrengths": ["Extra Skill they have"],
  "tailoredContent": {
    "summary": "Based on ACTUAL profile data only",
    "bulletPoints": [
      "Based on REAL experience from profile",
      "Another REAL achievement from profile",
      "Third REAL point from profile"
    ]
  },
  "honestAssessment": "Brief honest statement about candidacy level (e.g., 'Strong fit', 'Partial fit - needs development in X', 'Entry-level candidate for senior role - significant gaps')"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor specializing in skill gap analysis and career development.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Raw AI response:', content);
    
    const gapAnalysis = JSON.parse(content);

    console.log('Gap analysis completed successfully');

    return new Response(JSON.stringify(gapAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-gap function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
