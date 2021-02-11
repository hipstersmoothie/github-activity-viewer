import { RestEndpointMethodTypes } from "@octokit/rest";

export interface Actor {
  id: number;
  login: string;
  display_login: string;
  avatar_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  url: string;
}

export interface Payload {
  ref: string;
  ref_type: string;
  master_branch: string;
  description: string;
  pusher_type: string;
}

export interface Org {
  id: number;
  login: string;
  url: string;
  avatar_url: string;
}

export type EventType =
  | "ReleaseEvent"
  | "WatchEvent"
  | "PushEvent"
  | "PullRequestEvent"
  | "PullRequestReviewCommentEvent"
  | "CreateEvent"
  | "IssueCommentEvent"
  | "IssuesEvent"
  | "CommitCommentEvent"
  | "ForkEvent"
  | "DeleteEvent"
  | "PublicEvent"
  | "MemberEvent";

interface BaseFeedEvent {
  id: string;
  type: EventType;
  actor: Actor;
  repo: Repo;
  payload: Payload;
  public: boolean;
  created_at: Date;
  org: Org;
}

export type ForkEventType = BaseFeedEvent & {
  type: "ForkEvent";
  payload: {
    forkee: Repo;
  };
};

export type WatchEventType = BaseFeedEvent & {
  type: "WatchEvent";
  payload: {
    action: "started";
  };
};

export type ReleaseEventType = BaseFeedEvent & {
  type: "ReleaseEvent";
  payload: {
    action: "published";
    release: {
      name: string;
      tag_name: string;
      published_at: string;
      html_url: string;
      body: string;
    };
  };
};

export type GitHubFeedEvent =
  | BaseFeedEvent
  | ForkEventType
  | WatchEventType
  | ReleaseEventType;

export interface LanguageType {
  node: { name: string; color: string };
}

export interface ExtendedRepoData {
  description?: string;
  url?: string;
  updatedAt?: string;
  languages?: {
    edges: LanguageType[];
  };
  stargazers?: {
    totalCount: number;
  };
}

export type ExtendedRepo = Repo & ExtendedRepoData;

export type RepoInfoMap = Record<string, ExtendedRepoData>;

export interface GetFeedResponse {
  events: GitHubFeedEvent[];
  repoInfo: RepoInfoMap;
  user: RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]["data"];
  recentFollowers: Actor[];
}

export interface TrendingActorData {
  login: string;
  id: number;
  avatarUrl: string;
  name?: string;
  bioHTML?: string;
  company?: string;
  websiteUrl?: string;
  location?: string;
  twitterUsername?: string;
  followers: {
    totalCount: number;
  };
  status?: {
    emojiHTML: string;
    message: string;
  };
}

export interface TrendingActor extends Actor, TrendingActorData {
  isAuthenticatedUserFollowing: boolean;
  newFollowers: (Actor & { weight: number })[];
  weight: number;
}

export type EventMap = Record<EventType, GitHubFeedEvent[]>;

export interface PinnedItemBase {
  name: string;
  url: string;
  description?: string;
  stargazerCount: number;
}

export interface PinnedItemRepo extends PinnedItemBase {
  forkCount: number;
  languages: {
    edges: LanguageType[];
  };
}

export interface RecentPullRequest {
  title: string;
  url: string;
  bodyHTML: string;
  number: number;
  labels: {
    nodes: {
      name: string;
      color: string;
      description?: string;
    }[];
  };
  repository: {
    description?: string;
    nameWithOwner: string;
    url: string;
    stargazerCount: number;
    forkCount: number;
  };
}

export interface PinnedAndContributionsItemsResponse {
  pinnedItems: { edges: { node: PinnedItemBase | PinnedItemRepo }[] };
  repositories: { edges: { node: PinnedItemRepo }[] };
  contributionsCollection: {
    pullRequestContributions: {
      edges: {
        node: {
          pullRequest: RecentPullRequest;
        };
      }[];
    };
  };
}

export type FeaturedTrendingUser = TrendingActor & {
  pinnedItems: (PinnedItemBase | PinnedItemRepo)[];
  recentContributions: RecentPullRequest[];
};

export interface GetTrendingFollowersResponse {
  trendingInNetwork: TrendingActor[];
  featuredUser: FeaturedTrendingUser;
}
