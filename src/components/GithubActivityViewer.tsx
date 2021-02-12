import * as React from "react";

import { Grid } from "@primer/components";

import { Actor, EventMap, ReleaseEventType } from "../utils/types";
import { WatchEvents } from "./WatchEvents";
import { GridCard } from "./Event";
import { ReleaseEvent } from "./ReleaseEvent";
import { CreateEvent } from "./CreateEvent";
import { TrendingUser } from "./TrendingUser";

export const GithubActivityViewer = (
  props: EventMap & { recentFollowers?: Actor[] }
) => {
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const [pageHeight, pageHeightSet] = React.useState<number>();
  const newRepoEvents = [
    ...props.CreateEvent.filter((e) => e.payload.ref_type === "repository"),
    ...props.PublicEvent,
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
    <Grid
      px={4}
      py={3}
      gridGap={6}
      gridTemplateColumns={["repeat(1, auto)", "1fr 2fr"]}
      alignItems="start"
      maxWidth={1600}
    >
      <Grid ref={leftColumnRef} gridGap={6}>
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
              <TrendingUser key={follower.id} isAuthenticatedUserFollowing {...follower} />
            ))}
          />
        )}
      </Grid>

      <WatchEvents events={props.WatchEvent} pageHeight={pageHeight} />
    </Grid>
  );
};
