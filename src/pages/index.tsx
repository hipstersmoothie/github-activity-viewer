import React from "react";
import Head from "next/head";

import { DataContext } from "../contexts/data";
import { useFeeds } from "../hooks/useFeeds";
import { GithubActivityViewer } from "../components/GithubActivityViewer";

const active = "following";

const App = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds(active);
  const [clientHeight, clientHeightSet] = React.useState<number>();

  React.useEffect(() => {
    clientHeightSet(document.body.clientHeight);
  }, []);

  return (
    <DataContext.Provider value={{ repoInfo, user }}>
      <GithubActivityViewer
        pageHeight={clientHeight}
        recentFollowers={recentFollowers}
        {...feeds}
      />
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
