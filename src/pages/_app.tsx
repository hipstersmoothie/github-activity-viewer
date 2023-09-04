import type { AppProps } from "next/app";
import { ThemeProvider } from "@primer/react";

import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

import "../css/main.css";
// eslint-disable-next-line import/no-unassigned-import
import "../css/main.scss";

const MyApp = ({ Component, pageProps }: AppProps) => {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ThemeProvider colorMode="auto">
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionContextProvider>
  );
};

export default MyApp;
