import React, { Suspense } from "react";
import Head from "next/head";
import { useSession } from "next-auth/client";
import Router from "next/router";

import { DataContext } from "../contexts/data";
import { FullPageSpinner } from "../components/Spinner";
import { SidebarLayout } from "../components/Sidebar";
import { GithubActivityViewer } from "../components/GithubActivityViewer";
import { useFeeds } from "../hooks/useFeeds";

const active = "user";

const App = () => {
  const { feeds, repoInfo, user, recentFollowers } = useFeeds(active);
  const [clientHeight, clientHeightSet] = React.useState<number | undefined>();

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

const Home = () => {
  const [session, loading] = useSession();

  if (loading) {
    return null;
  }

  if (!session) {
    Router.push("/api/auth/signin");
    return null;
  }

  return (
    <>
      <Head>
        <title>GitHub Activity</title>
        <link rel="icon" href="/favicon-dark.png" />
      </Head>
      <SidebarLayout active={active}>
        <Suspense fallback={<FullPageSpinner />}>
          <App />
        </Suspense>
      </SidebarLayout>
    </>
  );
};

export default Home;
