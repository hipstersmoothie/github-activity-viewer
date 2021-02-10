import { RestEndpointMethodTypes } from "@octokit/rest";
import { NextApiRequest, NextApiResponse } from "next";
import { graphql } from "@octokit/graphql";

import {
  GetTrendingFollowersResponse,
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
    console.log(error)
    return error.data;
  }
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
  const trendingInNetwork = await getRecentFollowers(graphqlWithAuth, result);

  res.json({ trendingInNetwork });
};
