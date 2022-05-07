import * as React from "react";
import { theme, BoxProps, Box, Text } from "@primer/react";

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
} & BoxProps) => (
  <Box key={event.id} display="flex" alignItems="baseline" {...props}>
    <ActorAvatar actor={event.actor} sx={{ mr: 3 }} />
    <Box>{children}</Box>
  </Box>
);

export const GridCard = <T extends unknown>({
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
} & Omit<BoxProps, "title">) => {
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
              cursor: "pointer",
              borderBottomLeftRadius: theme["radii"][2],
              borderBottomRightRadius: theme["radii"][2],
              ":hover": { backgroundColor: "blue.0", color: "blue.5" },
              ":focus": {
                backgroundColor: "blue.0",
                color: "blue.5",
                outline: "none",
              },
            }}
            tabIndex={0}
            onClick={toggleExpanded}
          >
            <Text color="fg.default">Show {expanded ? "less" : "more"}</Text>
          </Box>
        </>
      )}
    </Card>
  );
};
