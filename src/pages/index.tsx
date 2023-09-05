import Head from "next/head";
import dynamic from "next/dynamic";

import { SidebarLayout } from "../components/Sidebar";
import Script from "next/script";

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
      <Script type="module">
        {`
          import { codeToHtml } from 'https://esm.sh/shikiji@0.5.0'; 
          window.codeToHtml = codeToHtml;
        `}
      </Script>
    </>
  );
};

export default Home;
