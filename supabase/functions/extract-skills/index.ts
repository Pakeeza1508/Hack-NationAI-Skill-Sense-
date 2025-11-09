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
    const { cvText, linkedinText, githubUrl, githubData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for skill extraction
    const prompt = buildExtractionPrompt(cvText, linkedinText, githubUrl, githubData);

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

function buildExtractionPrompt(cvText: string, linkedinText: string, githubUrl: string, githubData?: any): string {
  let prompt = 'EXTRACT ALL SKILLS FROM ALL DOMAINS - not just programming. Analyze career data comprehensively:\n\n';
  
  if (cvText) {
    prompt += `CV/RESUME CONTENT (extract ALL skills - technical, business, HR, management, finance, etc.):\n${cvText}\n\n`;
  }
  
  if (linkedinText) {
    prompt += `LINKEDIN PROFILE DATA (look for ALL types of skills - management, HR, business, technical, etc.):\n${linkedinText}\n\n`;
  }
  
  if (githubUrl && githubData) {
    prompt += `GITHUB PROFILE (source for technical skills evidence):\n`;
    prompt += `Username: ${githubData.profile.username}\n`;
    if (githubData.profile.bio) prompt += `Bio: ${githubData.profile.bio}\n`;
    prompt += `Public Repositories: ${githubData.profile.publicRepos}\n`;
    prompt += `Total Stars: ${githubData.statistics.totalStars}\n`;
    prompt += `Total Forks: ${githubData.statistics.totalForks}\n\n`;
    
    if (githubData.statistics.topLanguages.length > 0) {
      prompt += `Programming Languages:\n`;
      githubData.statistics.topLanguages.forEach((lang: any) => {
        prompt += `- ${lang.language}: ${lang.repoCount} repos\n`;
      });
      prompt += '\n';
    }
    
    if (githubData.statistics.topTopics.length > 0) {
      prompt += `Repository Topics (indicators of domain expertise):\n`;
      githubData.statistics.topTopics.forEach((topic: any) => {
        prompt += `- ${topic.topic} (${topic.count} repos)\n`;
      });
      prompt += '\n';
    }
    
    if (githubData.notableRepos.length > 0) {
      prompt += `Notable Projects (use as evidence with repo names):\n`;
      githubData.notableRepos.forEach((repo: any) => {
        prompt += `- ${repo.name}`;
        if (repo.description) prompt += `: ${repo.description}`;
        prompt += ` (${repo.language || 'Multiple languages'}, ${repo.stars} stars)\n`;
      });
      prompt += '\n';
    }
  } else if (githubUrl) {
    prompt += `GitHub Profile: ${githubUrl}\n(Note: Extract technical skills and use repository names as evidence)\n\n`;
  }
  
  prompt += `IMPORTANT: Extract EVERY skill type - programming, software engineering, data, business, HR, finance, marketing, design, communication, leadership, soft skills, domain expertise. Include specific evidence with source references (CV quotes, GitHub repo names, LinkedIn post/experience titles).`;
  
  return prompt;
}
