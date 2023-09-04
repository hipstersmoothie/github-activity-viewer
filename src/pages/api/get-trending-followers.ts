import { RestEndpointMethodTypes } from "@octokit/rest";
import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "@octokit/graphql";
import chunk from "lodash.chunk";

import { GetTrendingFollowersResponse, TrendingActor } from "../../utils/types";
import { gql } from "../../utils/gql";
import { authenticateOctokit } from "../../utils/octokit";
import { userQueryId } from "../../utils/queryId";
import { SuggestedUsers } from "../../queries/suggested-users";
import {
  SuggestedUsersQuery,
  FeaturedUserQuery,
  RecentFollowingQuery,
} from "../../queries/gen-types";
import { FeaturedUser } from "../../queries/featured-user";

async function getDataChunk(
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
            avatar_url: avatarUrl
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
    return await graphqlWithAuth<RecentFollowingQuery>(fullQuery);
  } catch (error) {
    console.log(error);
    return {} as RecentFollowingQuery;
  }
}

async function getRecentFollowers(
  graphqlWithAuth: typeof graphql,
  following: RestEndpointMethodTypes["users"]["listFollowersForUser"]["response"]["data"]
) {
  try {
    const allData = await Promise.all(
      chunk(following, 100).map((c) => getDataChunk(graphqlWithAuth, c))
    );
    const followingData = allData.reduce((all, data) => {
      return {
        ...all,
        ...data,
      };
    }, {} as RecentFollowingQuery);

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
          });
        } else {
          trendingActors.push({
            ...user,
            weight: 1,
            // TODO LOOK AT THIS LOGIC
            isAuthenticatedUserFollowing: following.some(
              (f) => f.login === user.login
            ),
            newFollowers: [
              {
                ...actor,
                weight,
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
    return [];
  }
}

async function getSuggestedUsers(graphqlWithAuth: typeof graphql) {
  try {
    const suggestions = await graphqlWithAuth<SuggestedUsersQuery>(
      SuggestedUsers
    );

    return Object.values(suggestions);
  } catch (error) {
    console.log(error);
    return [];
  }
}

const getFeaturedUserInfo = async (
  graphqlWithAuth: typeof graphql,
  login: string
) => {
  try {
    const data = await graphqlWithAuth<FeaturedUserQuery>(FeaturedUser, {
      login,
    });

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
  } catch (error) {
    console.log(error);

    return {
      pinnedItems: [],
      recentContributions: [],
    };
  }
};

interface QueryType {
  previousFeaturedUser: string;
  previousFeaturedUserDate: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<GetTrendingFollowersResponse>
) => {
  const { octokit, graphqlWithAuth } = await authenticateOctokit(req, res);
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
    (f) => featuredUser && f.login !== featuredUser.login
  );
  const suggested =
    followersWithoutUser.length > 0
      ? []
      : await getSuggestedUsers(graphqlWithAuth);

  res.json({
    trendingInNetwork,
    suggested,
    featuredUser: featuredUser
      ? {
          ...featuredUser,
          ...(await getFeaturedUserInfo(graphqlWithAuth, featuredUser.login)),
        }
      : undefined,
  });
};
