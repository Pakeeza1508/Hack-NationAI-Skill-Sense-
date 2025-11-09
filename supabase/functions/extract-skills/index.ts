import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert career analyst and skill assessment specialist with deep knowledge in technical competencies, professional development, and talent evaluation.

Your task is to perform a comprehensive skill analysis by examining CV/Resume content and GitHub profile data to create a detailed, descriptive skill profile.

ANALYSIS OBJECTIVES:

1. **Extract ALL Skills** - Both explicit and implicit:
   - Explicit: Directly mentioned skills (e.g., "Python", "Project Management")
   - Implicit: Inferred from context (e.g., leading a team → Leadership, debugging complex systems → Problem-solving)

2. **Provide Rich Context** - For each skill, explain:
   - HOW the skill is demonstrated
   - WHERE it appears in the data
   - WHAT level of proficiency is indicated
   - WHY this assessment is justified

3. **Cross-Reference Sources**:
   - CV provides: Work history, explicit mentions, certifications
   - GitHub provides: Technical evidence, coding patterns, collaboration

4. **Categorize Comprehensively**:
   - **Technical Skills**: Programming languages, frameworks, tools, databases, DevOps
   - **Domain Knowledge**: Industry-specific expertise, business domains
   - **Soft Skills**: Communication, leadership, teamwork, problem-solving
   - **Professional Skills**: Project management, agile, documentation, mentoring

RESPONSE FORMAT (Detailed & Descriptive):

{
  "professional_summary": "3-4 sentence comprehensive summary highlighting the individual's core expertise, experience level, key strengths, and professional trajectory based on all analyzed data",
  
  "skill_categories": {
    "technical_skills": [
      {
        "skill_name": "Python",
        "proficiency_level": "Advanced|Intermediate|Beginner|Expert",
        "confidence_score": 92,
        "description": "Detailed paragraph explaining how this skill is demonstrated, including specific projects, years of experience, and technical depth shown in the evidence",
        "evidence": [
          {
            "source": "CV",
            "quote": "Specific quote or mention from CV",
            "context": "Additional context about where and how it was used"
          },
          {
            "source": "GitHub",
            "detail": "20+ repositories using Python, 1500+ commits, projects include ML pipelines and web APIs",
            "notable_projects": ["Project A", "Project B"]
          }
        ],
        "related_skills": ["Django", "Flask", "NumPy", "Pandas"],
        "years_of_experience": "5+",
        "last_used": "Current/Recent/2023"
      }
    ],
    "domain_knowledge": [
      {
        "domain": "Machine Learning",
        "expertise_level": "Intermediate",
        "confidence_score": 85,
        "description": "Comprehensive explanation of domain expertise with examples",
        "evidence": [...],
        "sub_areas": ["Natural Language Processing", "Computer Vision"]
      }
    ],
    "soft_skills": [
      {
        "skill_name": "Leadership",
        "manifestation": "How this skill is shown",
        "confidence_score": 78,
        "description": "Detailed analysis of leadership demonstrations",
        "evidence": [...]
      }
    ],
    "professional_skills": [...]
  },
  
  "key_strengths": [
    {
      "strength": "Full-Stack Web Development",
      "description": "Detailed paragraph explaining this core strength",
      "supporting_skills": ["React", "Node.js", "PostgreSQL", "REST APIs"],
      "evidence_summary": "Built 10+ production applications, maintains open-source libraries"
    }
  ],
  
  "skill_development_timeline": [
    {
      "period": "2020-2023",
      "focus_areas": ["Machine Learning", "Python", "Data Science"],
      "progression": "Moved from intermediate to advanced based on project complexity"
    }
  ],
  
  "github_insights": {
    "most_used_languages": ["JavaScript", "Python", "TypeScript"],
    "contribution_patterns": "Regular contributor, high commit frequency, collaborative projects",
    "code_quality_indicators": "Well-documented repositories, follows best practices",
    "notable_achievements": ["50+ stars on Project X", "Contributor to open-source Library Y"]
  },
  
  "recommendations": {
    "skill_gaps": ["Areas for potential growth based on current trajectory"],
    "complementary_skills": ["Skills that would enhance existing capabilities"],
    "career_paths": ["Suggested career directions based on skill profile"]
  }
}

IMPORTANT GUIDELINES:
- Be specific and evidence-based in descriptions
- Provide rich context, not just lists
- Cross-reference CV and GitHub data for validation
- Explain your confidence scores
- Highlight unique or standout capabilities
- Be realistic about proficiency levels
- Include both breadth and depth of skills`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, githubData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive context
    let contextText = '=== PROFESSIONAL DATA SOURCES ===\n\n';
    
    
    if (cvText) {
      contextText += `CV/RESUME CONTENT:\n${cvText}\n\n`;
    }
    
    if (githubData) {
      contextText += `GITHUB PROFILE DATA:\n${JSON.stringify(githubData, null, 2)}\n\n`;
    }

    const prompt = `Perform a comprehensive skill analysis on the following professional data and generate a detailed, descriptive skill profile.

${contextText}

ANALYSIS REQUIREMENTS:

1. **Extract ALL Skills** (both explicit and implicit):
   - From CV: Extract mentioned technologies, roles, responsibilities, achievements
   - From GitHub: Analyze programming languages, frameworks, project complexity, contribution patterns

2. **Provide Rich, Descriptive Analysis**:
   - For each skill, write a detailed paragraph explaining HOW it's demonstrated
   - Include specific evidence from both CV and GitHub
   - Assess proficiency level based on breadth and depth of usage
   - Cross-reference sources for validation

3. **Comprehensive Categorization**:
   - Technical Skills (with sub-categories: languages, frameworks, tools, databases)
   - Domain Knowledge (industry expertise, specialized areas)
   - Soft Skills (inferred from projects, roles, collaboration)
   - Professional Skills (methodologies, practices)

4. **GitHub Deep Analysis**:
   - Languages used and their frequency
   - Project types and complexity
   - Code quality indicators (documentation, structure)
   - Collaboration evidence (forks, contributions, stars)
   - Notable achievements or standout projects

5. **Skill Development Timeline**:
   - Track when skills were acquired/used
   - Identify progression from beginner to advanced
   - Note recent vs. older skills

6. **Professional Summary**:
   - Write 3-4 sentences capturing the overall profile
   - Highlight key strengths and unique capabilities
   - Mention experience level and professional trajectory

7. **Actionable Recommendations**:
   - Identify skill gaps based on current trajectory
   - Suggest complementary skills
   - Recommend potential career paths

Return a comprehensive JSON following the detailed schema with rich descriptions and evidence for every finding.`;

    console.log('Extracting skills from multi-source data...');

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
    
    console.log('Multi-source skill extraction completed successfully');
    
    const skillProfile = JSON.parse(content);

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
