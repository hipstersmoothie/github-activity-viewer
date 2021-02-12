import { Box } from "@primer/components";
import { GitHubFeedEvent } from "../utils/types";

import { ActorLink, RepoLink } from "./HomePageLink";
import { RepoDescription } from "./RepoDescription";
import { useRepoInfo } from "../hooks/useRepoInfo";
import { Event } from "./Event";
import PopperPopover from "./Popover";

export const CreateEvent = ({ event }: { event: GitHubFeedEvent }) => {
  const repo = useRepoInfo(event.repo);
  const trigger = (
    <Event event={event}>
      <Box>
        <ActorLink {...event.actor} />{" "}
        <span>
          created <RepoLink repo={event.repo} />
        </span>
      </Box>
    </Event>
  );

  return (
    <PopperPopover trigger={trigger}>
      <RepoDescription repo={repo} />
    </PopperPopover>
  );
};
