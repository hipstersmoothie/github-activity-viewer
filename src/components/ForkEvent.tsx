import * as React from "react";

import { Box, Popover, Relative } from "@primer/components";
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
    <Relative
      onMouseEnter={() => showPopoverSet(true)}
      onMouseLeave={() => showPopoverSet(false)}
    >
      <Event event={event}>
        <Box>
          <ActorLink {...event.actor} />{" "}
          <span>
            forked <RepoLink repo={event.repo} />
          </span>
        </Box>
        <Since date={event.created_at} />
      </Event>
      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};
