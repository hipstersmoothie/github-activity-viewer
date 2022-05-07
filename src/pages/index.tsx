import Head from "next/head";

import { SidebarLayout } from "../components/Sidebar";
import { DataContext } from "../contexts/data";
import { useFeeds } from "../hooks/useFeeds";
import { GithubActivityViewer } from "../components/GithubActivityViewer";

const App = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds("following");

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
    <SidebarLayout>
      <App />
    </SidebarLayout>
  </>
);

export default Home;
