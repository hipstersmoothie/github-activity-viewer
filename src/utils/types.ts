import { RestEndpointMethodTypes } from "@octokit/rest";
import {
  FeaturedUserQuery,
  RecentFollowersQuery,
  RepoDescriptionQuery,
  SuggestedUsersQuery,
} from "../queries/gen-types";

type Org = RestEndpointMethodTypes["orgs"]["get"]["response"]["data"];
export type Repo = RestEndpointMethodTypes["repos"]["get"]["response"]["data"];
export type User = RestEndpointMethodTypes["users"]["listFollowersForUser"]["response"]["data"][number];

export interface Payload {
  ref: string;
  ref_type: string;
  master_branch: string;
  description: string;
  pusher_type: string;
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
  actor: User;
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
    release: RestEndpointMethodTypes["repos"]["getRelease"]["response"]["data"];
  };
};

export type GitHubFeedEvent =
  | BaseFeedEvent
  | ForkEventType
  | WatchEventType
  | ReleaseEventType;

export type EventMap = Record<EventType, GitHubFeedEvent[]>;
export type ExtendedRepo = RepoDescriptionQuery["repository"];
export type LanguageType = ExtendedRepo["languages"]["edges"][number];
export type RepoInfoMap = Record<string, ExtendedRepo>;
export type RecentFollower = RecentFollowersQuery["user"]["followers"]["nodes"][number];

export interface GetFeedResponse {
  events: GitHubFeedEvent[];
  repoInfo: RepoInfoMap;
  user: User;
  recentFollowers: RecentFollower[];
}

interface Weighted {
  weight: number;
}

export type TrendingActor = RecentFollower &
  Weighted & {
    isAuthenticatedUserFollowing: boolean;
    newFollowers: (User & Weighted)[];
  };

export type FeaturedTrendingUser = TrendingActor & {
  pinnedItems: (
    | FeaturedUserQuery["user"]["pinnedItems"]["edges"][number]["node"]
    | FeaturedUserQuery["user"]["repositories"]["edges"][number]["node"]
  )[];
  recentContributions: FeaturedUserQuery["user"]["contributionsCollection"]["pullRequestContributions"]["edges"][number]["node"]["pullRequest"][];
};

export interface GetTrendingFollowersResponse {
  suggested: SuggestedUsersQuery[keyof SuggestedUsersQuery][];
  trendingInNetwork: TrendingActor[];
  featuredUser?: FeaturedTrendingUser;
}
