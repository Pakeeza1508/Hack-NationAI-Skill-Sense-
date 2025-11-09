import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Add this type definition for validated skills
interface ValidatedSkill {
  skill_name: string;
  status: 'approved' | 'rejected';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert career analyst and skill assessment specialist with deep knowledge in technical competencies, professional development, and talent evaluation.

Your task is to perform a comprehensive skill analysis by examining various professional documents to create a detailed, descriptive skill profile. The user will provide a CV, GitHub data, performance reviews, goals, and reference letters.

ANALYSIS OBJECTIVES:

1.  **Extract ALL Skills (Explicit & Implicit):** Identify skills directly mentioned and infer skills from project descriptions, roles, and accomplishments.
2.  **Provide Rich, Evidence-Based Context:** For each skill, explain HOW and WHERE it's demonstrated, assess the proficiency, and justify your reasoning with quotes or data points.
3.  **Cross-Reference and Synthesize:** Aggregate findings from all provided sources (CV, GitHub, reviews, etc.) to form a holistic view.
4.  **Categorize Comprehensively:** Group skills into logical categories like Technical, Domain Knowledge, Soft Skills, and Professional Skills.
5.  **Map to SFIA Framework:** Where possible, assign a relevant SFIA category and proficiency level (1-7) to each skill.

USER FEEDBACK (VERY IMPORTANT):
- If the user provides feedback on previously approved or rejected skills, YOU MUST RESPECT IT.
- **Approved skills** should be included with high confidence.
- **Rejected skills** should be omitted or addressed as a potential misinterpretation.

RESPONSE FORMAT (Strict JSON Object):

You must return a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON.

{
  "summary": "A 3-4 sentence professional summary highlighting core expertise, experience level, and key strengths based on all data.",
  "categories": {
    "technical_skills": [
      {
        "name": "Python",
        "confidence": 95,
        "type": "explicit|implicit",
        "evidence": [
          "Quote or data point from a source (e.g., 'Led a Python-based data analysis project on the CV')",
          "Evidence from another source (e.g., 'Maintained two large Python repositories on GitHub')"
        ],
        "sfia_category": "Programming/Software Development",
        "sfia_level": 4
      }
    ],
    "soft_skills": [
      {
        "name": "Team Leadership",
        "confidence": 88,
        "type": "implicit",
        "evidence": [
          "Inferred from role as 'Team Lead' on CV",
          "Manager feedback in performance review: 'John effectively led his team to success.'"
        ],
        "sfia_category": "Relationship Management",
        "sfia_level": 5
      }
    ]
  }
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      cvText, 
      githubData, 
      performanceReviewText, 
      goalsObjectivesText, 
      referenceLettersText, 
      userId 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing critical environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let feedbackText = ''
    if (userId) {
      try {
        const { data: validatedSkills, error: validationError } = await supabase
          .from('validated_skills')
          .select('skill_name, status')
          .eq('user_id', userId);

        if (validationError) throw validationError;

        if (validatedSkills && validatedSkills.length > 0) {
          const skills = validatedSkills as ValidatedSkill[];
          const approved = skills.filter(s => s.status === 'approved').map(s => s.skill_name);
          const rejected = skills.filter(s => s.status === 'rejected').map(s => s.skill_name);

          feedbackText = `\
            --- USER FEEDBACK (HIGHEST PRIORITY) ---\
            The user has previously APPROVED these skills: ${approved.join(', ') || 'None'}.\
            The user has previously REJECTED these skills: ${rejected.join(', ') || 'None'}.\
            Your analysis MUST incorporate this feedback.\
            ----------------------------------------\
          `;
        }
      } catch (e) {
        console.error('Error fetching validated skills:', e.message);
        // Do not block analysis if feedback fails to load
      }
    }

    let contextText = ''
    if (cvText) contextText += `--- CV/RESUME ---\n${cvText}\n\n`;
    if (githubData) contextText += `--- GITHUB DATA ---\n${JSON.stringify(githubData, null, 2)}\n\n`;
    if (performanceReviewText) contextText += `--- PERFORMANCE REVIEW ---\n${performanceReviewText}\n\n`;
    if (goalsObjectivesText) contextText += `--- GOALS & OBJECTIVES ---\n${goalsObjectivesText}\n\n`;
    if (referenceLettersText) contextText += `--- REFERENCE LETTERS ---\n${referenceLettersText}\n\n`;

    const userPrompt = `
      Please perform a comprehensive skill analysis based on the following data. 
      Adhere strictly to the detailed instructions, objectives, and JSON format specified in the system prompt.
      
      ${feedbackText}

      === PROFESSIONAL DATA SOURCES ===
      ${contextText}
    `;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-1.5-flash', // Using a powerful model for complex JSON generation
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Lower temperature for more consistent JSON output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean potential markdown wrappers
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
    
    const skillProfile = JSON.parse(content);

    return new Response(JSON.stringify(skillProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-skills function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
