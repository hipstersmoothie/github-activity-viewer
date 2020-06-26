import React, { Suspense } from "react";
import Head from "next/head";
import fetch from "isomorphic-fetch";
import { useSession } from "next-auth/client";
import Router from "next/router";
import useSWR from "swr";

import { Grid, Flex } from "@primer/components";

import { GitHubFeedEvent, EventType, GetFeedResponse } from "../utils/types";
import { WatchEvents } from "../components/WatchEvents";
import { Events } from "../components/Event";
import { ReleaseEvent } from "../components/ReleaseEvent";
import { CreateEvent } from "../components/CreateEvent";
import { DataContext } from "../contexts/data";
import { FullPageSpinner } from "../components/Spinner";

type EventMap = Record<EventType, GitHubFeedEvent[]>;

const IGNORE_USERS = ["renovate"];

const useFeeds = () => {
  const [refreshWhenHidden, refreshWhenHiddenSet] = React.useState(false);

  React.useEffect(() => {
    const toggleRefreshWhenHidden = () =>
      refreshWhenHiddenSet(!refreshWhenHidden);

    window.addEventListener("visibilitychange", toggleRefreshWhenHidden, false);

    return () => {
      window.removeEventListener("visibilitychange", toggleRefreshWhenHidden);
    };
  });

  const { data } = useSWR(
    "/api/get-feed",
    async (pathname: string) => {
      return fetch(`${process.env.SITE || "http://localhost:3000"}${pathname}`)
        .then((res) => res.json())
        .then((res: GetFeedResponse) => {
          const map: EventMap = {
            ReleaseEvent: [],
            WatchEvent: [],
            PushEvent: [],
            PullRequestEvent: [],
            PullRequestReviewCommentEvent: [],
            CreateEvent: [],
            CommitCommentEvent: [],
            IssueCommentEvent: [],
            IssuesEvent: [],
            ForkEvent: [],
            DeleteEvent: [],
            PublicEvent: [],
            MemberEvent: [],
          };

          res.events.forEach((event) => {
            if (IGNORE_USERS.includes(event.actor.display_login)) {
              return;
            }

            if (map[event.type]) {
              map[event.type].push(event);
            } else {
              console.log(event.type);
            }
          });

          return {
            repoInfo: res.repoInfo,
            user: res.user,
            feeds: map,
          };
        });
    },
    {
      suspense: true,
      // Refresh every 5 minutes in the background but not when window is focused
      revalidateOnFocus: false,
      refreshWhenHidden,
      refreshInterval: refreshWhenHidden ? 5 * 60 * 1000 : undefined,
    }
  );

  return data || ({} as Partial<typeof data>);
};

const GithubActivityViewer = (props: EventMap & { pageHeight: number }) => (
  <Grid
    px={4}
    py={3}
    gridGap={6}
    gridTemplateColumns={["repeat(1, auto)", "1fr 2fr"]}
    alignItems="start"
    maxWidth={1600}
  >
    <Grid gridGap={6}>
      <Events
        events={props.ReleaseEvent}
        eventComponent={ReleaseEvent}
        title="Releases"
      />
      <Events
        events={props.CreateEvent.filter(
          (e) => e.payload.ref_type === "repository"
        )}
        eventComponent={CreateEvent}
        title="New Repos"
        showCount={8}
      />
    </Grid>

    <WatchEvents events={props.WatchEvent} pageHeight={props.pageHeight} />
  </Grid>
);

function App() {
  const { feeds, repoInfo, user } = useFeeds();
  const [clientHeight, clientHeightSet] = React.useState<number | undefined>();

  React.useEffect(() => {
    clientHeightSet(document.body.clientHeight);
  }, []);

  return (
    <DataContext.Provider value={{ repoInfo, user }}>
      <Flex
        justifyContent="center"
        sx={{
          backgroundColor: "gray.1",
          minHeight: "100vh",
        }}
      >
        <GithubActivityViewer pageHeight={clientHeight} {...feeds} />
      </Flex>
    </DataContext.Provider>
  );
}

export default function Home() {
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
      <Suspense fallback={<FullPageSpinner />}>
        <App />
      </Suspense>
    </>
  );
}
