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
    const { githubUrl } = await req.json();
    
    if (!githubUrl) {
      throw new Error('GitHub URL is required');
    }

    // Extract username from GitHub URL
    const username = extractGithubUsername(githubUrl);
    
    if (!username) {
      throw new Error('Invalid GitHub URL format');
    }

    console.log('Fetching GitHub data for user:', username);

    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SkillSense-App',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Fetch user repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SkillSense-App',
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub repos API error: ${reposResponse.status}`);
    }

    const repos = await reposResponse.json();

    // Analyze repositories
    const languageStats: Record<string, number> = {};
    const topicStats: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo: any) => {
      // Count languages
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }

      // Count topics
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach((topic: string) => {
          topicStats[topic] = (topicStats[topic] || 0) + 1;
        });
      }

      // Sum stars and forks
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    });

    // Sort languages by frequency
    const topLanguages = Object.entries(languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([lang, count]) => ({ language: lang, repoCount: count }));

    // Sort topics by frequency
    const topTopics = Object.entries(topicStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Get notable repositories (most starred)
    const notableRepos = repos
      .filter((repo: any) => !repo.fork)
      .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 5)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        topics: repo.topics || [],
      }));

    const githubData = {
      profile: {
        username: userData.login,
        name: userData.name,
        bio: userData.bio,
        company: userData.company,
        location: userData.location,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        createdAt: userData.created_at,
      },
      statistics: {
        totalRepositories: repos.length,
        totalStars,
        totalForks,
        topLanguages,
        topTopics,
      },
      notableRepos,
    };

    console.log('GitHub data fetched successfully');

    return new Response(JSON.stringify(githubData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-github function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch GitHub data' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractGithubUsername(url: string): string | null {
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/\?#]+)/i,
      /^([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}
