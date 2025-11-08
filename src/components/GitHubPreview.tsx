import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Star, GitFork, Code } from "lucide-react";

interface GitHubPreviewProps {
  data: {
    profile: {
      username: string;
      name: string;
      bio: string;
      company: string;
      location: string;
      publicRepos: number;
      followers: number;
      following: number;
    };
    statistics: {
      totalStars: number;
      totalForks: number;
      topLanguages: { language: string; repoCount: number }[];
      topTopics: { topic: string; count: number }[];
    };
    notableRepos: {
      name: string;
      description: string;
      language: string;
      stars: number;
      forks: number;
      url: string;
      topics: string[];
    }[];
  };
}

export const GitHubPreview = ({ data }: GitHubPreviewProps) => {
  const maxRepoCount = Math.max(...data.statistics.topLanguages.map(l => l.repoCount));

  return (
    <Card className="p-6 space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-3">
        <Github className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">GitHub Profile Preview</h3>
      </div>

      {/* Profile Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-lg">{data.profile.name || data.profile.username}</h4>
          <Badge variant="outline">@{data.profile.username}</Badge>
        </div>
        {data.profile.bio && (
          <p className="text-muted-foreground">{data.profile.bio}</p>
        )}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {data.profile.company && <span>🏢 {data.profile.company}</span>}
          {data.profile.location && <span>📍 {data.profile.location}</span>}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="font-medium">{data.profile.publicRepos} repositories</span>
          <span>{data.profile.followers} followers</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm">Total Stars</span>
          </div>
          <p className="text-2xl font-bold">{data.statistics.totalStars}</p>
        </Card>
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GitFork className="w-4 h-4" />
            <span className="text-sm">Total Forks</span>
          </div>
          <p className="text-2xl font-bold">{data.statistics.totalForks}</p>
        </Card>
      </div>

      {/* Language Chart */}
      {data.statistics.topLanguages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Top Languages</h4>
          </div>
          <div className="space-y-2">
            {data.statistics.topLanguages.slice(0, 5).map((lang, index) => {
              const percentage = (lang.repoCount / maxRepoCount) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-muted-foreground">{lang.repoCount} repos</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notable Repositories */}
      {data.notableRepos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Notable Repositories</h4>
          <div className="space-y-3">
            {data.notableRepos.slice(0, 3).map((repo, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks}
                    </span>
                  </div>
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {repo.topics.slice(0, 5).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
