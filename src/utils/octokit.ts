import { NextApiRequest } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import jwt from "next-auth/jwt";
import dotenv from "dotenv";

dotenv.config();

export const authenticateOctokit = async (req: NextApiRequest) => {
  // eslint-disable-next-line dot-notation
  const token = await jwt.getJwt({ req, secret: process.env["GITHUB_SECRET"] });
  const octokit = new Octokit({
    auth: token.account.accessToken,
  });
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token.account.accessToken}`,
    },
  });

  return { octokit, graphqlWithAuth };
};
