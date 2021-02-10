import React from "react";
import { BaseStyles } from "@primer/components";
import { Provider } from "next-auth/client";
import { useSession } from "next-auth/client";
import Router from "next/router";
import { SidebarActive, SidebarLayout } from "../components/Sidebar";

const MyApp = ({ Component, pageProps }) => {
  const [session, loading] = useSession();

  if (loading) {
    return null;
  }

  if (!session) {
    Router.push("/api/auth/signin");
    return null;
  }

  return (
    <Provider session={pageProps.session}>
      <BaseStyles>
        <SidebarLayout active={Router.route as SidebarActive}>
          <Component {...pageProps} />
        </SidebarLayout>
      </BaseStyles>
    </Provider>
  );
};

export default MyApp;
