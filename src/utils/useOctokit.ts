import * as React from "react";
import { Octokit } from "@octokit/rest";
import { useSession } from "@supabase/auth-helpers-react";

export const useOctokit = () => {
  const session = useSession();

  if (!session) {
    throw new Error("No session");
  }

  const accessToken = session["provider_token"];

  if (!accessToken) {
    throw new Error("No access token");
  }

  const [octokit] = React.useState<Octokit | null>(() => {
    return new Octokit({ auth: accessToken });
  });

  return octokit;
};
