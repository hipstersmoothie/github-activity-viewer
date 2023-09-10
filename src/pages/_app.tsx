import type { AppContext, AppProps } from "next/app";
import { ThemeProvider } from "@primer/react";
import { decode } from "querystring";
import { CookiesProvider } from "react-cookie";
import { useCookies } from "react-cookie";

import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

import "../css/main.css";
// eslint-disable-next-line import/no-unassigned-import
import "../css/main.scss";
import App from "next/app";
import Script from "next/script";

const MyApp = ({
  Component,
  pageProps,
  colorMode,
}: AppProps & { colorMode: "day" | "night" }) => {
  const [cookies] = useCookies(["colorMode"]);
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  return (
    <CookiesProvider>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <ThemeProvider colorMode={cookies.colorMode || colorMode}>
          <Component {...pageProps} />
          <Script type="module">
            {`
              import { codeToHtml } from 'https://esm.sh/shikiji@0.5.0'; 
              window.codeToHtml = codeToHtml;
            `}
          </Script>
          <Script type="module">
            {`
              import { Octokit } from 'https://esm.sh/@octokit/rest'; 
              window.Octokit = Octokit;
            `}
          </Script>
        </ThemeProvider>
      </SessionContextProvider>
    </CookiesProvider>
  );
};

export default MyApp;

MyApp.getInitialProps = async (context: AppContext) => {
  const ctx = await App.getInitialProps(context);

  return {
    ...ctx,
    colorMode:
      decode(context.ctx.req?.headers.cookie || "", "; ")["colorMode"] ?? "day",
  };
};
