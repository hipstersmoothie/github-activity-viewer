import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import jwt from "next-auth/jwt";
import dotenv from 'dotenv'

import {
  GitHubFeedEvent,
  Repo,
  GetFeedResponse,
  RepoInfoMap,
  EventType,
} from "../../utils/types";
import { queryId } from "../../utils/queryId";

dotenv.config();

/** Just constructs the template string. Used for syntax highlighting in VSCode */
function gql(
  staticParts: TemplateStringsArray,
  ...dynamicParts: (string | number)[]
) {
  const str = [];

  for (let i = 0; i < staticParts.length; i++) {
    str.push(staticParts[i]);

    if (dynamicParts[i]) {
      str.push(dynamicParts[i]);
    }
  }

  return str.join("");
}

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

export default async (
  req: NextApiRequest,
  res: NextApiResponse<GetFeedResponse>
) => {
  const token = await jwt.getJwt({ req, secret: process.env.GITHUB_SECRET });
  const octokit = new Octokit({
    auth: token.account.accessToken,
  });
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token.account.accessToken}`,
    },
  });
  const user = await octokit.users.getAuthenticated();
  const result: GitHubFeedEvent[] = await octokit.paginate(
    octokit.activity.listReceivedEventsForUser,
    {
      username: user.data.login,
    }
  );
  const repoInfo = await getRepoInfo(graphqlWithAuth, result);

  res.json({
    events: result,
    repoInfo,
    user: user.data,
  });
};
