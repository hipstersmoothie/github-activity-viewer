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
          totalCount
          nodes {
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
            totalCount: number;
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

      let weight = 1;

      // We cant sort by date followed so we have to assign weight to infrequent followers
      if (users.following.totalCount < 10) {
        weight = 0.1;
      } else if (users.following.totalCount < 65) {
        weight = 0.3;
      } else if (users.following.totalCount < 100) {
        weight = 0.5;
      } else if (users.following.totalCount > 600) {
        weight = 1.5;
      } else if (users.following.totalCount > 300) {
        weight = 1.2;
      }

      users.following.nodes.forEach((user) => {
        const trendingActor = trendingActors.find(
          (a) => userQueryId(a) === userQueryId(user)
        );

        if (trendingActor) {
          trendingActor.newFollowers.push({
            ...actor,
            weight,
            display_login: actor.login,
          });
        } else {
          trendingActors.push({
            ...user,
            weight: 1,
            avatar_url: user.avatarUrl,
            display_login: user.login,
            isAuthenticatedUserFollowing: following.some(
              (f) => f.login === user.login
            ),
            newFollowers: [
              {
                ...actor,
                weight,
                display_login: actor.login,
              },
            ],
          });
        }
      });
    });

    return trendingActors
      .map((actor) => ({
        ...actor,
        weight: actor.newFollowers.reduce((all, item) => all + item.weight, 0),
      }))
      .sort((a, b) => b.weight - a.weight);
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
                  state
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

        repositories(orderBy: {field: STARGAZERS, direction: DESC}, first: 6, ownerAffiliations: OWNER) {
          edges {
            node {
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
    const featuredRepos =
      data.user.pinnedItems.edges.length > 0
        ? data.user.pinnedItems.edges
        : data.user.repositories.edges;

    return {
      pinnedItems: featuredRepos.map((e) => e.node),
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

interface QueryType {
  previousFeaturedUser: string;
  previousFeaturedUserDate: string;
}

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
    (actor) => actor.newFollowers.length >= 2 || actor.weight > 1
  );
  const followersToConsider = filteredFollowers.length
    ? filteredFollowers
    : followersWithoutUser;
  const query = (req.query as unknown) as QueryType;
  const hoursSincePreviousFeaturedUser =
    (new Date().getTime() -
      new Date(query.previousFeaturedUserDate).getTime()) /
    (1000 * 60 * 60);
  const featuredUser = followersToConsider.find((follower) => {
    if (hoursSincePreviousFeaturedUser < 24) {
      return follower.login === query.previousFeaturedUser;
    }

    return follower.login !== query.previousFeaturedUser;
  });
  const trendingInNetwork = followersToConsider.filter(
    (f) => f.login !== featuredUser.login
  );

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
