import * as React from "react";
import { RestEndpointMethodTypes } from "@octokit/rest";

import { RepoInfoMap } from "../utils/types";

export const DataContext = React.createContext<{
  repoInfo: RepoInfoMap;
  user:
    | RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]["data"]
    | null;
}>({
  repoInfo: {},
  user: null,
});
