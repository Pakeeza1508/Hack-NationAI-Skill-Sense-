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
    const { cvText, linkedinUrl, githubUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for skill extraction
    const prompt = buildExtractionPrompt(cvText, linkedinUrl, githubUrl);

    console.log('Extracting skills using Lovable AI...');

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
            content: `You are an expert skill extraction AI. Your task is to analyze career data and identify both explicit and implicit skills. 
            
Return a JSON object with this structure:
{
  "summary": "A brief 2-3 sentence summary of the person's key strengths and career focus",
  "categories": {
    "technical_skills": [{"name": "skill name", "confidence": 95, "type": "explicit/implicit", "evidence": ["source quote 1", "source quote 2"]}],
    "soft_skills": [...],
    "leadership_skills": [...],
    "domain_expertise": [...]
  }
}

Guidelines:
- Confidence score (0-100) based on evidence strength
- Type: "explicit" if directly mentioned, "implicit" if inferred
- Evidence: actual quotes or paraphrases from source material
- Categories should be comprehensive but focused
- Look for hidden skills in project descriptions, problem-solving narratives, etc.`
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
    const skillProfile = JSON.parse(data.choices[0].message.content);

    console.log('Skill extraction completed successfully');

    return new Response(JSON.stringify(skillProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-skills function:', error);
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

function buildExtractionPrompt(cvText: string, linkedinUrl: string, githubUrl: string): string {
  let prompt = 'Analyze the following career data and extract comprehensive skill profile:\n\n';
  
  if (cvText) {
    prompt += `CV/Resume Content:\n${cvText}\n\n`;
  }
  
  if (linkedinUrl) {
    prompt += `LinkedIn Profile: ${linkedinUrl}\n(Note: Analyze based on typical LinkedIn profile structure - experience, skills, endorsements, recommendations)\n\n`;
  }
  
  if (githubUrl) {
    prompt += `GitHub Profile: ${githubUrl}\n(Note: Consider repository languages, project descriptions, contribution patterns)\n\n`;
  }
  
  prompt += 'Please provide a detailed skill analysis with confidence scores and evidence.';
  
  return prompt;
}
