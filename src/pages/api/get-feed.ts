import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "@octokit/graphql";

import {
  GitHubFeedEvent,
  Repo,
  GetFeedResponse,
  RepoInfoMap,
  EventType,
  Actor,
} from "../../utils/types";
import { queryId } from "../../utils/queryId";
import { authenticateOctokit } from "../../utils/octokit";
import { gql } from "../../utils/gql";

async function getRepoInfo(
  graphqlWithAuth: typeof graphql,
  data: GitHubFeedEvent[]
) {
  const repos: Repo[] = [];
  const eventsToAddRepoInfoFor: EventType[] = [
    "WatchEvent",
    "ForkEvent",
    "ReleaseEvent",
    "CreateEvent",
  ];

  data.forEach((event) => {
    if (repos.find((r) => r.name === event.repo.name)) {
      return;
    }

    if (eventsToAddRepoInfoFor.includes(event.type)) {
      repos.push(event.repo);
    }
  });

  const query = repos
    .map((repo) => {
      const [owner, name] = repo.name.split("/");
      return gql`
        ${queryId(repo)}: repository(owner: "${owner}", name: "${name}") {
          description
          url
          updatedAt
          languages(first: 1, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              node {
                color
                name
              }
            }
          }
          stargazers {
            totalCount
          }
        }
      `;
    })
    .join("\n");

  const fullQuery = `\n{${query}}\n`;
  try {
    const result = await graphqlWithAuth<RepoInfoMap>(fullQuery);
    return result;
  } catch (error) {
    return error.data;
  }
}

async function getRecentFollowers(
  graphqlWithAuth: typeof graphql,
  login: string
) {
  const query = gql`
    {
      user(login: "${login}") {
        followers(first: 10) {
          nodes {
            login
            id
            avatarUrl
            login
            id
            avatarUrl
            bioHTML
            company
            location
            name
            websiteUrl
            twitterUsername
            followers {
              totalCount
            }
            status {
							emojiHTML
              message
            }
          }
        }
      }
    }
  `;

  try {
    const result = await graphqlWithAuth<{
      user: { followers: { nodes: Actor[] } };
    }>(query);
    return result.user.followers.nodes.map((node) => ({
      ...node,
      display_login: node.login,
      avatar_url: (node as any).avatarUrl,
    }));
  } catch (error) {
    return error.data;
  }
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<GetFeedResponse>
) => {
  const { octokit, graphqlWithAuth } = await authenticateOctokit(req);

  const user = await octokit.users.getAuthenticated();
  const result: GitHubFeedEvent[] = await octokit.paginate(
    req.query.active === "following"
      ? octokit.activity.listReceivedEventsForUser
      : octokit.activity.listEventsForAuthenticatedUser,
    {
      username: user.data.login,
    }
  );
  const repoInfo = await getRepoInfo(graphqlWithAuth, result);
  const recentFollowers = await getRecentFollowers(
    graphqlWithAuth,
    user.data.login
  );

  res.json({
    events: result,
    repoInfo,
    user: user.data,
    recentFollowers,
  });
};
