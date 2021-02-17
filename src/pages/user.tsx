import Head from "next/head";

import { DataContext } from "../contexts/data";
import { GithubActivityViewer } from "../components/GithubActivityViewer";
import { useFeeds } from "../hooks/useFeeds";

const App = () => {
  const { feeds, repoInfo, user } = useFeeds("user");

  return (
    <DataContext.Provider value={{ repoInfo, user }}>
      <GithubActivityViewer {...feeds} />
    </DataContext.Provider>
  );
};

const UserPage = () => (
  <>
    <Head>
      <title>User Activity</title>
    </Head>
    <App />
  </>
);

export default UserPage;
