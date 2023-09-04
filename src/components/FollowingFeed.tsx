import { DataContext } from "../contexts/data";
import { useFeeds } from "../hooks/useFeeds";
import { GithubActivityViewer } from "./GithubActivityViewer";

const FollowingFeed = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds("following");

  return (
    <DataContext.Provider value={{ repoInfo, user }}>
      <GithubActivityViewer recentFollowers={recentFollowers} {...feeds} />
    </DataContext.Provider>
  );
};

export default FollowingFeed;
