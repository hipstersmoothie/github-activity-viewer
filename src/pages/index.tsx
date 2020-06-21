import React from "react";
import Head from "next/head";
import fetch from "isomorphic-fetch";

import { theme, Grid, Flex } from "@primer/components";

import {
  GitHubFeedEvent,
  EventType,
  GetFeedResponse,
  RepoInfoMap,
} from "../utils/types";
import { WatchEvents } from "../components/WatchEvents";
import { Events } from "../components/Event";
import { ReleaseEvent } from "../components/ReleaseEvent";
import { CreateEvent } from "../components/CreateEvent";
import { DataContext } from "../contexts/data";
import { Spinner } from "../components/Spinner";

type EventMap = Record<EventType, GitHubFeedEvent[]>;

const IGNORE_USERS = ["renovate"];

const useFeeds = () => {
  const [feeds, feedsSet] = React.useState<EventMap | undefined>();
  const [repoInfo, repoInfoSet] = React.useState<RepoInfoMap>({});

  React.useEffect(() => {
    fetch("http://localhost:3000/api/get-feed")
      .then((res) => res.json())
      .then((res: GetFeedResponse) => {
        const map: EventMap = {
          ReleaseEvent: [],
          WatchEvent: [],
          PushEvent: [],
          PullRequestEvent: [],
          PullRequestReviewCommentEvent: [],
          CreateEvent: [],
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

          map[event.type].push(event);
        });

        repoInfoSet(res.repoInfo);
        feedsSet(map);
      });
  }, []);

  return { feeds, repoInfo };
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
        events={props.CreateEvent.filter((e) => e.payload.ref_type !== "tag")}
        eventComponent={CreateEvent}
        title="New Repos"
        showCount={9}
      />
    </Grid>
    <WatchEvents events={props.WatchEvent} pageHeight={props.pageHeight} />
  </Grid>
);

export default function Home() {
  const { feeds, repoInfo } = useFeeds();
  const [clientHeight, clientHeightSet] = React.useState<number | undefined>();

  React.useEffect(() => {
    clientHeightSet(document.body.clientHeight);
  }, []);

  return (
    <DataContext.Provider value={{ repoInfo }}>
      <Head>
        <title>GitHub Activity</title>
        <link rel="icon" href="/favicon-dark.png" />
      </Head>

      <Flex
        justifyContent="center"
        sx={{ backgroundColor: "gray.1", minHeight: "100vh" }}
      >
        {feeds ? (
          <GithubActivityViewer pageHeight={clientHeight} {...feeds} />
        ) : (
          <Spinner />
        )}
      </Flex>
    </DataContext.Provider>
  );
}
