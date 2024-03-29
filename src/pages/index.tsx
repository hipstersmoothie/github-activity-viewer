import Head from "next/head";
import dynamic from "next/dynamic";

import { SidebarLayout } from "../components/Sidebar";

const FollowingFeed = dynamic(() => import("../components/FollowingFeed"), {
  ssr: false,
});

const Home = () => {
  return (
    <>
      <Head>
        <title>GitHub Activity</title>
      </Head>
      <SidebarLayout>
        <FollowingFeed />
      </SidebarLayout>
    </>
  );
};

export default Home;
