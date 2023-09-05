import React from "react";
import Head from "next/head";

import { DataContext } from "../contexts/data";
import { GithubActivityViewer } from "../components/GithubActivityViewer";
import { useFeeds } from "../hooks/useFeeds";
import { SidebarLayout } from "../components/Sidebar";

const App = () => {
  const { feeds, repoInfo, user } = useFeeds("user");
  const value = React.useMemo(() => ({ repoInfo, user }), [repoInfo, user]);

  return (
    <DataContext.Provider value={value}>
      <GithubActivityViewer {...feeds} />
    </DataContext.Provider>
  );
};

const UserPage = () => (
  <>
    <Head>
      <title>User Activity</title>
    </Head>
    <SidebarLayout>
      <App />
    </SidebarLayout>
  </>
);

export default UserPage;
