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
    const { linkedinUrl } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    if (!linkedinUrl) {
      throw new Error('LinkedIn URL is required');
    }

    console.log('Scraping LinkedIn profile:', linkedinUrl);

    // Use Firecrawl to scrape LinkedIn profile
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: linkedinUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl error:', scrapeResponse.status, errorText);
      throw new Error(`Firecrawl API error: ${scrapeResponse.status}`);
    }

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeData.success) {
      throw new Error('Failed to scrape LinkedIn profile');
    }

    // Extract structured data from markdown
    const markdown = scrapeData.data?.markdown || '';
    const html = scrapeData.data?.html || '';

    // Parse LinkedIn profile data
    const linkedinData = parseLinkedInProfile(markdown, html);

    console.log('LinkedIn profile scraped successfully');

    return new Response(JSON.stringify(linkedinData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-linkedin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to scrape LinkedIn profile' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseLinkedInProfile(markdown: string, html: string): any {
  // Extract key information from the markdown/html content
  const lines = markdown.split('\n');
  
  // Basic extraction - can be enhanced with more sophisticated parsing
  const profile: any = {
    rawContent: markdown,
    summary: '',
    experience: [],
    skills: [],
    education: [],
  };

  // Try to extract headline/summary
  const headlineMatch = markdown.match(/#{1,2}\s*(.+)/);
  if (headlineMatch) {
    profile.headline = headlineMatch[1].trim();
  }

  // Extract experience section
  const experienceSection = extractSection(markdown, ['Experience', 'Work Experience']);
  if (experienceSection) {
    profile.experience = experienceSection.split(/\n\n+/).filter(e => e.trim()).slice(0, 10);
  }

  // Extract skills section
  const skillsSection = extractSection(markdown, ['Skills', 'Skills & Endorsements']);
  if (skillsSection) {
    profile.skills = skillsSection.split(/[•\n]/).filter(s => s.trim()).slice(0, 20);
  }

  // Extract education section
  const educationSection = extractSection(markdown, ['Education']);
  if (educationSection) {
    profile.education = educationSection.split(/\n\n+/).filter(e => e.trim()).slice(0, 5);
  }

  return profile;
}

function extractSection(content: string, sectionTitles: string[]): string | null {
  for (const title of sectionTitles) {
    const regex = new RegExp(`#{1,3}\\s*${title}\\s*([\\s\\S]*?)(?=#{1,3}|$)`, 'i');
    const match = content.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}
