import React from "react";
import Head from "next/head";

import { DataContext } from "../contexts/data";
import { GithubActivityViewer } from "../components/GithubActivityViewer";
import { useFeeds } from "../hooks/useFeeds";

const active = "user";

const App = () => {
  const { feeds, repoInfo, user } = useFeeds(active);

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
