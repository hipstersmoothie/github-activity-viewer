import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "@octokit/graphql";

import {
  GitHubFeedEvent,
  Repo,
  GetFeedResponse,
  EventType,
} from "../../utils/types";
import { queryId } from "../../utils/queryId";
import { authenticateOctokit } from "../../utils/octokit";
import { gql } from "../../utils/gql";
import { RecentFollowers } from "../../queries/recent-followers";
import {
  RecentFollowersQuery,
  RepoDescriptionQuery,
} from "../../queries/gen-types";

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
      const [owner, name] = repo.name.split("/") as [string, string];

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
    const result = await graphqlWithAuth<RepoDescriptionQuery>(fullQuery);
    return result;
  } catch (error) {
    return error.data;
  }
}

async function getRecentFollowers(
  graphqlWithAuth: typeof graphql,
  login: string
) {
  try {
    const result = await graphqlWithAuth<RecentFollowersQuery>(
      RecentFollowers,
      {
        variables: {
          login,
        },
      }
    );

    return result.user.followers.nodes;
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
  const active = Array.isArray(req.query["active"])
    ? req.query["active"][0]
    : req.query["active"];
  const result: GitHubFeedEvent[] = await octokit.paginate(
    active === "following"
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
