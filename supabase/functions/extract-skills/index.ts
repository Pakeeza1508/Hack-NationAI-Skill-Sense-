import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert career and talent analyst specializing in comprehensive multi-source data aggregation and skill extraction. Your task is to analyze data from TWO DISTINCT SOURCE CATEGORIES and synthesize them into a unified, evidence-based skill profile.

DATA SOURCE CATEGORIES:

1. PROFESSIONAL PROFILE SOURCES (Public-facing career information):
   - CV/Resume: Formal work history, education, certifications
   - LinkedIn: Professional network activity, posts, thought leadership
   - GitHub: Technical contributions, code quality, collaboration patterns
   - Blogs/Articles: Published thought leadership content
   - Publications: Academic or professional research

2. INTERNAL/PERFORMANCE DOCUMENTS (Company-internal assessments):
   - Performance Reviews: Manager assessments, peer feedback, ratings
   - Goals/Objectives: OKRs, career development plans, strategic initiatives
   - Reference Letters: Third-party validations and recommendations

CRITICAL AGGREGATION REQUIREMENTS:

1. CROSS-SOURCE VALIDATION:
   - Skills mentioned in BOTH professional sources AND internal documents have highest confidence (95-100%)
   - Skills in professional sources only: 70-90% confidence
   - Skills in internal documents only: 75-95% confidence (validated by managers/peers)
   - Each skill MUST cite which sources mention it

2. EVIDENCE SYNTHESIS:
   - Professional sources show what you've DONE (projects, posts, code)
   - Internal documents show how you're PERCEIVED (reviews, feedback, recommendations)
   - Combine both for complete picture

3. SKILL CATEGORIZATION:
   - Technical Skills: Languages, frameworks, databases, tools
   - Business & Management: Strategy, project management, stakeholder relations
   - Soft Skills: Leadership, communication, problem-solving
   - Domain Expertise: Industry-specific knowledge
   - Thought Leadership: Public influence and knowledge sharing

4. SFIA FRAMEWORK MAPPING (MANDATORY):
   - Map every skill to SFIA (Skills Framework for the Information Age) category
   - Assign proficiency level (1-7) based on evidence from BOTH source types
   - Justify level using cross-source evidence

RESPONSE FORMAT:
{
  "summary": "2-3 sentence professional summary synthesizing insights from ALL sources",
  "categories": {
    "technical_skills": [
      {
        "name": "Skill Name",
        "confidence": 85,
        "type": "explicit|implicit",
        "evidence": [
          "CV: 5 years experience at Company X",
          "LinkedIn: 15 posts discussing advanced topics",
          "GitHub: 20+ repositories, 1000+ commits",
          "Performance Review: Rated 'Expert' by manager in Q4 2024"
        ],
        "source_breakdown": {
          "professional_sources": ["cv", "linkedin", "github"],
          "internal_sources": ["performance_reviews"]
        },
        "validated_by_internal": true
      }
    ],
    "business_management": [...],
    "soft_skills": [...],
    "domain_expertise": [...],
    "thought_leadership": [...]
  },
  "framework_mapping": [
    {
      "skill_name": "Python",
      "framework": "SFIA",
      "category": "Programming and software development",
      "level": 5,
      "justification": "Strategic application across projects (CV), 20+ repos (GitHub), recognized expertise in performance reviews, thought leadership posts (LinkedIn)"
    }
  ],
  "source_quality_assessment": {
    "professional_coverage": "high|medium|low",
    "internal_validation": "high|medium|low|none",
    "cross_source_consistency": "high|medium|low"
  }
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      // Professional Profile Sources
      cvText, 
      linkedinUrl, 
      linkedinData, 
      githubUrl, 
      githubData,
      blogsText,
      publicationsText,
      // Internal/Performance Documents
      performanceReviews,
      goalsObjectives,
      referenceLetters
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive context separating source types
    let contextText = '=== PROFESSIONAL PROFILE SOURCES ===\n\n';
    
    // Professional Sources
    if (cvText) {
      contextText += `CV/RESUME:\n${cvText}\n\n`;
    }
    
    if (linkedinUrl) {
      contextText += `LINKEDIN PROFILE: ${linkedinUrl}\n`;
      if (linkedinData) {
        contextText += `Headline: ${linkedinData.headline || 'N/A'}\n`;
        contextText += `About: ${linkedinData.about || 'N/A'}\n`;
        
        if (linkedinData.experience && linkedinData.experience.length > 0) {
          contextText += `Experience:\n${JSON.stringify(linkedinData.experience, null, 2)}\n`;
        }
        
        if (linkedinData.skills && linkedinData.skills.length > 0) {
          contextText += `Skills Listed: ${linkedinData.skills.join(', ')}\n`;
        }
        
        if (linkedinData.posts && linkedinData.posts.length > 0) {
          contextText += `Posts (${linkedinData.posts.length} total):\n`;
          linkedinData.posts.forEach((post: any, idx: number) => {
            contextText += `  Post ${idx + 1}: ${post.content || post.text}\n`;
          });
        }
        contextText += '\n';
      }
    }
    
    if (githubUrl) {
      contextText += `GITHUB PROFILE: ${githubUrl}\n`;
      if (githubData) {
        contextText += `Data: ${JSON.stringify(githubData, null, 2)}\n\n`;
      }
    }

    if (blogsText) {
      contextText += `BLOGS/ARTICLES:\n${blogsText}\n\n`;
    }

    if (publicationsText) {
      contextText += `PUBLICATIONS/RESEARCH:\n${publicationsText}\n\n`;
    }

    // Internal Documents Section
    contextText += '\n=== INTERNAL/PERFORMANCE DOCUMENTS ===\n\n';

    if (performanceReviews) {
      contextText += `PERFORMANCE REVIEWS:\n${performanceReviews}\n\n`;
    }

    if (goalsObjectives) {
      contextText += `GOALS & OBJECTIVES:\n${goalsObjectives}\n\n`;
    }

    if (referenceLetters) {
      contextText += `REFERENCE LETTERS:\n${referenceLetters}\n\n`;
    }

    const prompt = `Analyze the following multi-source professional data and generate a comprehensive skill profile.

${contextText}

AGGREGATION INSTRUCTIONS:

1. IDENTIFY ALL SKILLS across both Professional Profile Sources AND Internal Documents
2. CROSS-REFERENCE each skill - does it appear in multiple sources? Which ones?
3. ASSIGN CONFIDENCE based on:
   - Found in both professional + internal sources: 95-100%
   - Professional sources only: 70-90%
   - Internal sources only: 75-95%
   - Single source only: 60-75%

4. CITE EVIDENCE from each source type:
   - Professional: CV quotes, LinkedIn posts, GitHub projects, blog topics
   - Internal: Performance review excerpts, goal statements, reference quotes

5. VALIDATE SKILLS:
   - If a skill appears in professional sources AND internal reviews = highly validated
   - If internal docs mention skills NOT in professional sources = hidden strengths
   - If professional sources show skills NOT in internal docs = potentially underutilized

6. SFIA MAPPING for every skill with justification from ALL available sources

7. ASSESS SOURCE QUALITY:
   - Professional coverage: Do we have rich data from CV, LinkedIn, GitHub?
   - Internal validation: Are skills confirmed by managers/peers?
   - Consistency: Do sources agree or contradict?

Return comprehensive JSON matching the schema with complete evidence trails.`;

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
