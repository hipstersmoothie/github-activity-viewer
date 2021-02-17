import { Link, Heading, Box, Text } from "@primer/components";
import Markdown from "markdown-to-jsx";

import { ReleaseEventType } from "../utils/types";
import { useRepoInfo } from "../hooks/useRepoInfo";
import { ActorLink, RepoLink } from "./HomePageLink";
import { Since } from "./Since";
import { renderEmoji } from "../utils/renderEmoji";
import { CardDivider } from "./Card";
import { RepoDescription } from "./RepoDescription";
import { Event } from "./Event";
import PopperPopover from "./Popover";

export const ReleaseEvent = ({ event }: { event: ReleaseEventType }) => {
  const repo = useRepoInfo(event.repo);
  const trigger = (
    <Event as="summary" event={event}>
      <Box>
        <ActorLink {...event.actor} />{" "}
        <span>
          released <RepoLink repo={event.repo} />
        </span>{" "}
        <span>at</span>{" "}
        <Link target="_blank" href={event.payload.release.html_url}>
          {event.payload.release.tag_name}
        </Link>
      </Box>
      <Since date={event.created_at} pb={3} />
    </Event>
  );

  return (
    <PopperPopover interactive trigger={trigger}>
      <RepoDescription repo={repo} />

      <CardDivider my={4} />

      <Heading fontSize={3}>
        {event.payload.release.name || event.payload.release.tag_name}
      </Heading>

      <Text>
        <Markdown>{renderEmoji(event.payload.release.body)}</Markdown>
      </Text>
    </PopperPopover>
  );
};
