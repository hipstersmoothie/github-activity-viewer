import React from "react";
import { DataContext } from "../contexts/data";
import { useFeeds } from "../hooks/useFeeds";
import { GithubActivityViewer } from "./GithubActivityViewer";

const FollowingFeed = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds("following");
  const value = React.useMemo(() => ({ repoInfo, user }), [repoInfo, user]);

  return (
    <DataContext.Provider value={value}>
      <GithubActivityViewer recentFollowers={recentFollowers} {...feeds} />
    </DataContext.Provider>
  );
};

export default FollowingFeed;
