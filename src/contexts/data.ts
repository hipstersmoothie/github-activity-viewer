import * as React from "react";

import { RepoInfoMap, User } from "../utils/types";

export const DataContext = React.createContext<{
  repoInfo: RepoInfoMap;
  user: User | null;
}>({
  repoInfo: {},
  user: null,
});
