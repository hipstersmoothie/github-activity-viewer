import React from "react";
import { theme, Flex, BorderBox, Heading, Box, Text } from "@primer/components";

import { DataContext } from "../contexts/data";
import { GitHubFeedEvent, Repo } from "../utils/types";
import { ActorAvatar } from "./ActorAvatar";
import { Card, CardDivider, CardTitle } from "./Card";

export const Event = ({
  event,
  children,
  ...props
}: {
  event: GitHubFeedEvent;
  children: React.ReactNode;
} & React.ComponentProps<typeof Flex>) => (
  <Flex key={event.id} alignItems="baseline" mb={3} {...props}>
    <ActorAvatar actor={event.actor} mr={3} />
    <div>{children}</div>
  </Flex>
);

const useUser = () => {
  const { user } = React.useContext(DataContext);
  return user;
};

const isGithubEvent = (
  value: GitHubFeedEvent | Repo
): value is GitHubFeedEvent => "type" in value;

const isRepo = (value: GitHubFeedEvent | Repo): value is Repo =>
  "name" in value;

const useUserRepoEvents = <T extends GitHubFeedEvent | Repo>(events: T[]) => {
  const { login } = useUser();
  const fromUsersRepos: T[] = [];
  const fromOtherRepos: T[] = [];

  events.forEach((event) => {
    if (
      (isGithubEvent(event) && event.repo.name.split("/")[0] === login) ||
      (isRepo(event) && event.name.split("/")[0] === login)
    ) {
      fromUsersRepos.push(event);
    } else {
      fromOtherRepos.push(event);
    }
  });

  return { fromUsersRepos, fromOtherRepos };
};

export const Events = <T extends GitHubFeedEvent | Repo>({
  events,
  eventComponent: EventComponent,
  title,
  filterComponent,
  shownFilter = () => true,
  showCount = 5,
  ...props
}: {
  events: T[];
  eventComponent: React.ComponentType<{ event: T }>;
  title: React.ReactNode;
  filterComponent?: React.ReactNode;
  shownFilter?: (event: T) => boolean;
  showCount?: number;
} & Omit<React.ComponentProps<typeof BorderBox>, "title">) => {
  const [expanded, expandedSet] = React.useState(false);
  const toggleExpanded = () => expandedSet(!expanded);
  const { fromOtherRepos, fromUsersRepos } = useUserRepoEvents(events);

  const filteredRepos = fromOtherRepos.filter(shownFilter);
  const shownRepos = expanded
    ? filteredRepos
    : filteredRepos.slice(0, showCount).filter(shownFilter);
  const shownTitle = (
    <Flex alignItems="center" justifyContent="space-between" mb={4}>
      <Heading fontSize={2}>On Other Repos</Heading>
      {filterComponent}
    </Flex>
  );

  return (
    <Card title={<CardTitle title={title} count={events.length} />} {...props}>
      {fromUsersRepos.length > 0 && (
        <>
          <Heading fontSize={2} mb={4}>
            On Your Repos
          </Heading>

          {fromUsersRepos.map((event) => (
            <EventComponent key={`event-${event.id}`} event={event} />
          ))}

          <CardDivider my={5} />

          {shownTitle}
        </>
      )}

      {filterComponent && fromUsersRepos.length === 0 && shownTitle}

      {shownRepos.map((event) => (
        <EventComponent key={`event-${event.id}`} event={event} />
      ))}

      {shownRepos.length >= showCount && (
        <>
          <CardDivider mt={5} />

          <Box
            mx={-4}
            mb={-3}
            px={4}
            py={3}
            sx={{
              borderBottomLeftRadius: theme.radii[2],
              borderBottomRightRadius: theme.radii[2],
              ":hover": { backgroundColor: "blue.0", color: "blue.5" },
              ":focus": {
                backgroundColor: "blue.0",
                color: "blue.5",
                outline: "none",
              },
            }}
            tabIndex={0}
            onClick={toggleExpanded}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                toggleExpanded();
              }
            }}
          >
            <Text>Show {expanded ? "less" : "more"}</Text>
          </Box>
        </>
      )}
    </Card>
  );
};
