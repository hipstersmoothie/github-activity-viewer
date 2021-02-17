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
      <ActorLink {...event.actor} />{" "}
      <span>
        {event.type === 'ForkEvent'? 'forked' : 'created'} <RepoLink repo={event.repo} />
      </span>
    </Event>
  );

  return (
    <PopperPopover trigger={trigger} mb={3}>
      <RepoDescription repo={repo} />
    </PopperPopover>
  );
};
