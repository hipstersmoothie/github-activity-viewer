/* eslint-disable */

import { NextApiRequest } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import jwt from "next-auth/jwt";
import dotenv from "dotenv";

dotenv.config();

export const authenticateOctokit = async (req: NextApiRequest) => {
  const token = await jwt.getToken({
    req,
    secret: process.env["GITHUB_SECRET"] as string,
  });
  const octokit = new Octokit({
    auth: (token as any).accessToken,
  });
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${(token as any).accessToken}`,
    },
  });

  return {
    octokit,
    graphqlWithAuth,
  };
};
