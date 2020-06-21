require("dotenv").config();

import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import {
  GitHubFeedEvent,
  Repo,
  GetFeedResponse,
  RepoInfoMap,
  queryId,
  EventType,
} from "../../src/types";

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GH_TOKEN}`,
  },
});

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

async function getRepoInfo(data: GitHubFeedEvent[]) {
  const repos: Repo[] = [];
  const eventsToAddRepoInfoFor: EventType[] = [
    "WatchEvent",
    "ForkEvent",
    "ReleaseEvent",
    "CreateEvent",
  ]

  data.forEach((event) => {
    if (repos.find(r => r.name === event.repo.name)) {
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
    console.log(error);
    return {};
  }
}

export default async (
  _: NextApiRequest,
  res: NextApiResponse<GetFeedResponse>
) => {
  const user = await octokit.users.getAuthenticated();
  const result: GitHubFeedEvent[] = await octokit.paginate(
    octokit.activity.listReceivedEventsForUser,
    {
      username: user.data.login,
    }
  );
  const repoInfo = await getRepoInfo(result);

  res.json({
    events: result,
    repoInfo,
  });
};
