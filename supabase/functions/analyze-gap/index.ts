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

    const prompt = `You are an expert career coach and resume writer. A candidate has provided their skill profile, and they want to apply for a specific job. Your task is to perform a detailed gap analysis and then generate tailored content for their resume.

CANDIDATE'S SKILL PROFILE:
${JSON.stringify(userSkills, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

Please provide your analysis and resume content in a single JSON object with the following structure:
{
  "matchPercentage": <number from 0-100 representing the overall skill overlap>,
  "matches": ["Skill 1", "Skill 2"],
  "gaps": ["Skill A", "Skill B"],
  "untappedStrengths": ["Extra Skill 1", "Extra Skill 2"],
  "tailoredContent": {
    "summary": "A 2-3 sentence professional summary, rewritten to highlight the candidate's most relevant skills for THIS job.",
    "bulletPoints": [
      "An achievement-oriented bullet point that combines a candidate's skill with a potential outcome relevant to the job.",
      "Another powerful bullet point showcasing their value for this specific role.",
      "A third bullet point that directly addresses a key requirement in the job description."
    ]
  }
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
    const gapAnalysis = JSON.parse(data.choices[0].message.content);

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
