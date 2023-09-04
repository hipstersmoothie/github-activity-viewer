import * as React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { SidebarLayout } from "../components/Sidebar";

const DiscoverFeed = dynamic(() => import("../components/DiscoverFeed"), {
  ssr: false,
});

const Home = () => (
  <>
    <Head>
      <title>Discover</title>
    </Head>
    <SidebarLayout>
      <DiscoverFeed />
    </SidebarLayout>
  </>
);

export default Home;
