import React from "react";
import { RestEndpointMethodTypes } from "@octokit/rest";

import { RepoInfoMap } from "../utils/types";

export const DataContext = React.createContext<{
  repoInfo: RepoInfoMap | null;
  user: RestEndpointMethodTypes['users']['getAuthenticated']["response"]["data"]
}>({
  repoInfo: {},
  user: null
});
