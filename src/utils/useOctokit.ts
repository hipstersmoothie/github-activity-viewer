import * as React from "react";
import type { Octokit } from "@octokit/rest";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (window as any).Octokit({ auth: accessToken });
  });

  return octokit;
};
