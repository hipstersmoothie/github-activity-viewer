import React from "react";

import {
  Link,
  Heading,
  Box,
  Text,
  Popover,
  Relative,
} from "@primer/components";
import Markdown from "markdown-to-jsx";

import { ReleaseEventType } from "../utils/types";
import { useRepoInfo } from "../hooks/useRepoInfo";
import { ActorLink, RepoLink } from "./HomePageLink";
import { Since } from "./Since";
import { renderEmoji } from "../utils/renderEmoji";
import { CardDivider } from "./Card";
import { RepoDescription } from "./RepoDescription";
import { Event } from "./Event";

export const ReleaseEvent = ({ event }: { event: ReleaseEventType }) => {
  const repo = useRepoInfo(event.repo);
  const [showPopover, showPopoverSet] = React.useState(false);

  return (
    <Relative
      onMouseEnter={() => showPopoverSet(true)}
      onMouseLeave={() => showPopoverSet(false)}
    >
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
        <Since date={event.created_at} />
      </Event>

      <Popover open={showPopover} caret="top" width="100%">
        <Popover.Content mt={2} width="100%">
          <Heading fontSize={3}>
            {event.payload.release.name || event.payload.release.tag_name}
          </Heading>

          <Text>
            <Markdown>{renderEmoji(event.payload.release.body)}</Markdown>
          </Text>

          <CardDivider my={4} />

          <RepoDescription repo={repo} />
        </Popover.Content>
      </Popover>
    </Relative>
  );
};
