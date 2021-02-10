import React from "react";
import { theme, Flex, BorderBox, Box, Text } from "@primer/components";

import { GitHubFeedEvent } from "../utils/types";
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

export const GridCard = <T extends any>({
  title,
  shownFilter = () => true,
  showCount = 5,
  rows,
  staticRows,
  ...props
}: {
  title: React.ReactNode;
  shownFilter?: (event: T) => boolean;
  showCount?: number;
  rows: T[];
  staticRows?: React.ReactNode;
} & Omit<React.ComponentProps<typeof BorderBox>, "title">) => {
  const [expanded, expandedSet] = React.useState(false);
  const toggleExpanded = () => expandedSet(!expanded);
  const filteredRows = rows.filter(shownFilter);
  const shownRepos = expanded
    ? filteredRows
    : filteredRows.slice(0, showCount).filter(shownFilter);

  return (
    <Card
      title={<CardTitle title={title} count={React.Children.count(rows)} />}
      {...props}
    >
      {staticRows}

      {shownRepos}

      {filteredRows.length > showCount && (
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
