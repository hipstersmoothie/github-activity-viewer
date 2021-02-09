import { RestEndpointMethodTypes } from "@octokit/rest";

export interface Actor {
  id: number;
  login: string;
  display_login: string;
  gravatar_id: string;
  url: string;
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
  gravatar_id: string;
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
