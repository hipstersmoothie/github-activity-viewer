import * as React from "react";

import { Box, Popover } from "@primer/react";
import { ForkEventType } from "../utils/types";
import { useRepoInfo } from "../hooks/useRepoInfo";
import { ActorLink, RepoLink } from "./HomePageLink";
import { Event } from "./Event";
import { Since } from "./Since";
import { RepoDescription } from "./RepoDescription";

export const ForkEvent = ({ event }: { event: ForkEventType }) => {
  const repo = useRepoInfo(event.repo);
  const [showPopover, showPopoverSet] = React.useState(false);

  return (
    <Box
      position="relative"
      onMouseEnter={() => showPopoverSet(true)}
      onMouseLeave={() => showPopoverSet(false)}
    >
      <Event event={event}>
        <Box color="fg.muted">
          <ActorLink {...event.actor} />{" "}
          <span>
            forked <RepoLink repo={event.repo} />
          </span>
        </Box>
        <Since date={event.created_at} />
      </Event>
      <Popover open={showPopover} caret="top" sx={{ width: "100%" }}>
        <Popover.Content sx={{ mt: 2, width: "100%" }}>
          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Box>
  );
};
