import React from "react";

import { Box, Popover, Relative } from "@primer/components";
import { GitHubFeedEvent } from "../utils/types";

import { ActorLink, RepoLink } from "./HomePageLink";
import { RepoDescription } from "./RepoDescription";
import { useRepoInfo } from "../hooks/useRepoInfo";
import { Event } from "./Event";

export const CreateEvent = ({ event }: { event: GitHubFeedEvent }) => {
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
            created <RepoLink repo={event.repo} />
          </span>
        </Box>
      </Event>
      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};
