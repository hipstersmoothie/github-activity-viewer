import React from "react";

import { Grid, Flex } from "@primer/components";

import { Actor, EventMap, ReleaseEventType } from "../utils/types";
import { WatchEvents } from "./WatchEvents";
import { GridCard } from "./Event";
import { ReleaseEvent } from "./ReleaseEvent";
import { CreateEvent } from "./CreateEvent";
import { ActorLink } from "./HomePageLink";
import { ActorAvatar } from "./ActorAvatar";

export const GithubActivityViewer = (
  props: EventMap & { pageHeight: number; recentFollowers: Actor[] }
) => {
  const newRepoEvents = [
    ...props.CreateEvent.filter((e) => e.payload.ref_type === "repository"),
    ...props.PublicEvent,
  ].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Grid
      px={4}
      py={3}
      gridGap={6}
      gridTemplateColumns={["repeat(1, auto)", "1fr 2fr"]}
      alignItems="start"
      maxWidth={1600}
    >
      <Grid gridGap={6}>
        <GridCard
          title="Releases"
          showCount={8}
          rows={props.ReleaseEvent.map((event) => (
            <ReleaseEvent key={event.id} event={event as ReleaseEventType} />
          ))}
        />
        <GridCard
          title="New Repos"
          showCount={8}
          rows={newRepoEvents.map((event) => (
            <CreateEvent key={event.id} event={event} />
          ))}
        />
        <GridCard
          title="New Followers"
          showCount={5}
          rows={props.recentFollowers.map((follower) => (
            <Flex key={follower.id} alignItems="baseline" mb={3} {...props}>
              <ActorAvatar actor={follower} mr={3} />
              <ActorLink {...follower} />
            </Flex>
          ))}
        />
      </Grid>

      <WatchEvents events={props.WatchEvent} pageHeight={props.pageHeight} />
    </Grid>
  );
};
