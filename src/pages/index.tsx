import Head from "next/head";

import { DataContext } from "../contexts/data";
import { useFeeds } from "../hooks/useFeeds";
import { GithubActivityViewer } from "../components/GithubActivityViewer";

const active = "following";

const App = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds(active);

  console.log({feeds})

  return (
    <DataContext.Provider value={{ repoInfo, user }}>
      <GithubActivityViewer recentFollowers={recentFollowers} {...feeds} />
    </DataContext.Provider>
  );
};

const Home = () => (
  <>
    <Head>
      <title>GitHub Activity</title>
    </Head>
    <App />
  </>
);

export default Home;
