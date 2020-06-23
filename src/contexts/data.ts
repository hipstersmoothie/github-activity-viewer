import React from "react";
import { RepoInfoMap } from "../utils/types";
import { RestEndpointMethodTypes } from "@octokit/rest";

export const DataContext = React.createContext<{
  repoInfo: RepoInfoMap | null;
  user: RestEndpointMethodTypes['users']['getAuthenticated']["response"]["data"]
}>({
  repoInfo: {},
  user: null
});
