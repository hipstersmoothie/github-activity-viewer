import * as React from "react";

import { Box } from "@primer/react";

import { EventMap, ReleaseEventType, RecentFollower } from "../utils/types";
import { WatchEvents } from "./WatchEvents";
import { GridCard } from "./Event";
import { ReleaseEvent } from "./ReleaseEvent";
import { CreateEvent } from "./CreateEvent";
import { TrendingUser } from "./TrendingUser";

export const GithubActivityViewer = (
  props: EventMap & { recentFollowers?: RecentFollower[] }
) => {
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const [pageHeight, pageHeightSet] = React.useState<number>();
  const newRepoEvents = [
    ...props.CreateEvent.filter((e) => e.payload.ref_type === "repository"),
    ...props.PublicEvent,
    ...props.ForkEvent,
  ].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  React.useEffect(() => {
    if (!leftColumnRef.current) {
      pageHeightSet(document.body.clientHeight);
      return;
    }

    pageHeightSet(
      Math.min(document.body.clientHeight, leftColumnRef.current?.clientHeight)
    );
  }, []);

  return (
    <Box
      px={4}
      py={3}
      display="grid"
      gridGap={6}
      gridTemplateColumns={["repeat(1, auto)", "1fr 2fr"]}
      alignItems="start"
      maxWidth={1600}
    >
      <Box ref={leftColumnRef} display="grid" gridGap={6}>
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
        {props.recentFollowers && (
          <GridCard
            title="New Followers"
            showCount={5}
            rows={props.recentFollowers.map((follower) => (
              <TrendingUser
                key={follower.id}
                isAuthenticatedUserFollowing
                {...follower}
              />
            ))}
          />
        )}
      </Box>

      <WatchEvents events={props.WatchEvent} pageHeight={pageHeight} />
    </Box>
  );
};
