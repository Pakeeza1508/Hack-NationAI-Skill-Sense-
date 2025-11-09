import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert career and talent analyst. Your task is to analyze comprehensive career data from a CV, LinkedIn, and GitHub to build a detailed, evidence-based skill profile. You must extract ALL types of skills, not just technical ones.

SKILL CATEGORIES TO IDENTIFY:
- Technical Skills: Languages, frameworks, databases, tools (e.g., Python, React, PostgreSQL, Docker).
- Business & Management: Project Management, Agile Methodologies, Product Roadmapping, Stakeholder Communication, Budgeting.
- Soft Skills: Leadership, Teamwork, Problem-Solving, Communication, Adaptability.
- Domain Expertise: Industry-specific knowledge demonstrated through projects or experience (e.g., FinTech, Healthcare AI, E-commerce Logistics).

CRITICAL REQUIREMENT - FORMAL SKILL FRAMEWORK MAPPING:
You MUST map every extracted skill to a category from the SFIA (Skills Framework for the Information Age) framework and assign a proficiency level (1-7). If SFIA is not applicable for a particular skill, use a detailed, structured taxonomy with clear categorization.

SFIA Level Guidelines:
- Level 1-2: Basic awareness and application
- Level 3-4: Practical application and guidance
- Level 5-6: Strategic influence and leadership
- Level 7: Executive leadership

RESPONSE FORMAT:
Return a JSON object with the following structure:
{
  "summary": "A 2-3 sentence professional summary highlighting the candidate's key strengths and expertise across different domains.",
  "categories": {
    "technical_skills": [{"name": "Skill Name", "confidence": <0-100>, "type": "explicit|implicit", "evidence": ["Source: description or quote."]}],
    "business_management": [...],
    "soft_skills": [...],
    "domain_expertise": [...]
  },
  "framework_mapping": [
    {"skill_name": "Python", "framework": "SFIA", "category": "Programming and software development", "level": 4, "justification": "Demonstrated practical application across multiple projects"},
    {"skill_name": "Team Leadership", "framework": "SFIA", "category": "People Management", "level": 5, "justification": "Strategic leadership of cross-functional teams"}
  ]
}

CRITICAL INSTRUCTIONS:
- Evidence: Every skill MUST be supported by evidence. Cite the source:
  - "From CV: '[Quote from the resume that demonstrates the skill]'"
  - "From GitHub: 'Repository topic/description in [repository-name]'"
  - "From LinkedIn: 'Role description for [Job Title]'"
- Type: Classify skills as 'explicit' (clearly stated, e.g., "proficient in Python") or 'implicit' (demonstrated through action, e.g., a project description shows problem-solving).
- Confidence Score: Assign a score from 0-100 based on the strength and frequency of evidence. A skill mentioned once is less confident than one demonstrated across multiple projects and job roles.
- Framework Mapping: ALWAYS include framework_mapping array with SFIA categorization for each identified skill. Include justification for the assigned level.
- Comprehensive Analysis: Do not just list skills. Synthesize the information to identify higher-level abilities. For example, managing a team on a project demonstrates 'Leadership'. Using topics like 'payment-gateway' on GitHub is evidence for 'FinTech' domain expertise.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, linkedinUrl, linkedinData, githubUrl, githubData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive context from all available sources
    let contextText = '';
    
    if (cvText) {
      contextText += `CV/Resume Content:\n${cvText}\n\n`;
    }
    
    if (linkedinUrl) {
      contextText += `LinkedIn Profile URL: ${linkedinUrl}\n`;
      if (linkedinData) {
        contextText += `LinkedIn Profile Data:\n`;
        contextText += `- Headline: ${linkedinData.headline || 'N/A'}\n`;
        contextText += `- About: ${linkedinData.about || 'N/A'}\n`;
        
        if (linkedinData.experience && linkedinData.experience.length > 0) {
          contextText += `- Experience:\n${JSON.stringify(linkedinData.experience, null, 2)}\n`;
        }
        
        if (linkedinData.skills && linkedinData.skills.length > 0) {
          contextText += `- Skills Listed: ${linkedinData.skills.join(', ')}\n`;
        }
        
        if (linkedinData.posts && linkedinData.posts.length > 0) {
          contextText += `- LinkedIn Posts (${linkedinData.posts.length} posts):\n`;
          linkedinData.posts.forEach((post: any, idx: number) => {
            contextText += `  Post ${idx + 1}: ${post.content || post.text}\n`;
          });
        }
        
        contextText += '\n';
      }
    }
    
    if (githubUrl) {
      contextText += `GitHub Profile: ${githubUrl}\n`;
      if (githubData) {
        contextText += `GitHub Data: ${JSON.stringify(githubData, null, 2)}\n`;
      }
    }

    const prompt = `You are an expert career analyst, skill extraction specialist, and sentiment analysis expert. Analyze the following professional data with deep sentiment analysis to extract a comprehensive skill profile.

${contextText}

CRITICAL INSTRUCTIONS FOR COMPREHENSIVE ANALYSIS:

1. MULTI-SOURCE ANALYSIS:
   - Extract ALL skills from CV, LinkedIn profile data, LinkedIn posts, and GitHub repositories
   - Cross-reference skills across sources to increase confidence scores
   - Weight evidence from multiple sources more heavily

2. SENTIMENT ANALYSIS ON LINKEDIN POSTS:
   - Analyze the tone, passion, and expertise demonstrated in LinkedIn posts
   - Extract implicit skills from the topics they write about and how they discuss them
   - Identify thought leadership areas and domain expertise from post content
   - Detect enthusiasm and expertise levels from writing style

3. FOR EACH SKILL:
   - confidence (0-100): Higher if mentioned in multiple sources or demonstrated through posts/projects
   - type: "explicit" (directly mentioned) or "implicit" (inferred from posts, projects, context)
   - evidence: Specific quotes or references from CV, LinkedIn posts, or GitHub projects
   - sentiment: If derived from posts, note the passion/expertise level detected

4. SKILL CATEGORIZATION:
   - Technical, Soft Skills, Domain Knowledge, Tools & Technologies, Languages, Thought Leadership

5. PROFESSIONAL SUMMARY:
   - Generate 2-3 sentences highlighting key strengths
   - Incorporate insights from LinkedIn posts about their expertise areas and interests

6. SFIA FRAMEWORK MAPPING:
   - Map every extracted skill to SFIA (Skills Framework for the Information Age) category
   - Assign proficiency level (1-7) with justification based on evidence depth

Return a JSON object matching the expected schema.`;

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
            content: SYSTEM_PROMPT
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
    
    const skillProfile = JSON.parse(content);

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

