import { RestEndpointMethodTypes } from "@octokit/rest";
import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "@octokit/graphql";

import {
  GetTrendingFollowersResponse,
  PinnedAndContributionsItemsResponse,
  TrendingActor,
  TrendingActorData,
} from "../../utils/types";
import { gql } from "../../utils/gql";
import { authenticateOctokit } from "../../utils/octokit";
import { userQueryId } from "../../utils/queryId";

async function getRecentFollowers(
  graphqlWithAuth: typeof graphql,
  following: RestEndpointMethodTypes["users"]["listFollowersForUser"]["response"]["data"]
) {
  const query = following
    .map((user) => {
      return gql`
      ${userQueryId(user)}: user(login: "${user.login}") {
        following(first: 3) {
          nodes {
            login
            id
            avatarUrl
            bioHTML
            company
            location
            name
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
    `;
    })
    .join("\n");

  const fullQuery = `\n{${query}}\n`;

  try {
    const followingData = await graphqlWithAuth<
      Record<
        string,
        {
          following: {
            nodes: TrendingActorData[];
          };
        }
      >
    >(fullQuery);

    const trendingActors: TrendingActor[] = [];

    Object.entries(followingData).forEach(([queryId, users]) => {
      const actor = following.find((u) => userQueryId(u) === queryId);

      if (!actor) {
        return;
      }

      users.following.nodes.forEach((user) => {
        const trendingActor = trendingActors.find(
          (a) => userQueryId(a) === userQueryId(user)
        );

        if (trendingActor) {
          trendingActor.newFollowers.push({
            ...actor,
            display_login: actor.login,
          });
        } else {
          trendingActors.push({
            ...user,
            avatar_url: user.avatarUrl,
            display_login: user.login,
            isAuthenticatedUserFollowing: following.some(
              (f) => f.login === user.login
            ),
            newFollowers: [
              {
                ...actor,
                display_login: actor.login,
              },
            ],
          });
        }
      });
    });

    return trendingActors.sort(
      (a, b) => b.newFollowers.length - a.newFollowers.length
    );
  } catch (error) {
    console.log(error);
    return error.data;
  }
}

const getFeaturedUserInfo = async (
  graphqlWithAuth: typeof graphql,
  login: string
) => {
  const query = gql`
    {
      user(login: "${login}") {
        contributionsCollection {
          pullRequestContributions(orderBy: {direction: DESC}, first: 100) {
            edges {
              node {
                pullRequest {
                  title
                  url
                  bodyHTML
                  number
                  labels(first: 10) {
                    nodes {
                      name
                      color
                      description
                    }
                  }
                  repository {
                    description
                    nameWithOwner
                    url
                    stargazerCount
                    forkCount
                  }
                }
              }
            }
          }
        }

        pinnedItems(first: 6) {
          edges {
            node {
              ... on Gist {
                name
                url
                description
                stargazerCount
              }
              ... on Repository {
                name
                url
                description
                stargazerCount
                forkCount
                languages(first: 1) {
                  edges {
                    node {
                      name
                      color
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await graphqlWithAuth<{
      user: PinnedAndContributionsItemsResponse;
    }>(query);

    const seenRepos = new Set<string>();

    return {
      pinnedItems: data.user.pinnedItems.edges.map((e) => e.node),
      recentContributions: data.user.contributionsCollection.pullRequestContributions.edges
        .map((e) => e.node.pullRequest)
        .filter((e) => {
          if (seenRepos.has(e.repository.url)) {
            return false;
          }

          seenRepos.add(e.repository.url);
          return true;
        })
        .slice(0, 10),
    };
  } catch (error) {}
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<GetTrendingFollowersResponse>
) => {
  const { octokit, graphqlWithAuth } = await authenticateOctokit(req);
  const user = await octokit.users.getAuthenticated();
  const result = await octokit.paginate(octokit.users.listFollowingForUser, {
    username: user.data.login,
  });
  const recentFollowers: TrendingActor[] = await getRecentFollowers(
    graphqlWithAuth,
    result
  );
  const followersWithoutUser = recentFollowers.filter(
    (actor) => actor.login !== user.data.login
  );
  const filteredFollowers = followersWithoutUser.filter(
    (actor) => actor.newFollowers.length >= 2
  );
  const [featuredUser, ...trendingInNetwork] = filteredFollowers.length
    ? filteredFollowers
    : followersWithoutUser;
  const featuredUserInfo = await getFeaturedUserInfo(
    graphqlWithAuth,
    featuredUser.login
  );

  res.json({
    trendingInNetwork,
    featuredUser: {
      ...featuredUser,
      ...featuredUserInfo,
    },
  });
};
