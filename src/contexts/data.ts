import React from "react";
import { RepoInfoMap } from "../types";

export const DataContext = React.createContext<{
  repoInfo: RepoInfoMap;
}>({
  repoInfo: {},
});
