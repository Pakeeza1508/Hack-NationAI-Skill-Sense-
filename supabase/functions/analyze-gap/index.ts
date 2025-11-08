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

    const prompt = `You are a career advisor analyzing skill gaps. Compare the candidate's skills against this job description.

CANDIDATE SKILLS:
${JSON.stringify(userSkills, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed gap analysis in JSON format:
{
  "matchPercentage": <number 0-100>,
  "matches": [
    {"name": "skill name", "confidence": <number>}
  ],
  "gaps": ["skill 1", "skill 2"],
  "untappedStrengths": ["skill 1", "skill 2"],
  "recommendations": "Brief paragraph with actionable advice"
}

Guidelines:
- matchPercentage: Overall fit (0-100)
- matches: Skills candidate has that job requires
- gaps: Required skills candidate lacks
- untappedStrengths: Candidate skills not required but valuable
- recommendations: 2-3 sentences with next steps`;

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
