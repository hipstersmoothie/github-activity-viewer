/* eslint-disable */

import { NextApiRequest } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import dotenv from "dotenv";
import { getSession } from "next-auth/react";

dotenv.config();

export const authenticateOctokit = async (req: NextApiRequest) => {
  const session = (await getSession({ req })) || {};
  const accessToken = (session as any).accessToken;

  if (!accessToken) {
    throw new Error("No access token");
  }

  const octokit = new Octokit({ auth: accessToken });
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${accessToken}`,
    },
  });

  return {
    octokit,
    graphqlWithAuth,
  };
};
