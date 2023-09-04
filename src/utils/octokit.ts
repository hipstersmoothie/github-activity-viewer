/* eslint-disable */

import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import dotenv from "dotenv";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

dotenv.config();

export const authenticateOctokit = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const supabaseServerClient = createPagesServerClient({
    req,
    res,
  });
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) {
    throw new Error("No session");
  }

  const accessToken = session["provider_token"];

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
