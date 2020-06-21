import React from "react";
import { DataContext } from "../contexts/data";
import { Repo } from "../utils/types";
import { queryId } from "../utils/queryId";

export const useRepoInfo = (repo: Repo) => {
  const { repoInfo } = React.useContext(DataContext);
  return { ...repo, ...repoInfo[queryId(repo)] };
};