import React from "react";

import { Flex, Text, Link } from "@primer/components";
import { StarIcon } from "@primer/styled-octicons";

export const StarCount = ({
  repo,
  stargazers,
  ...props
}: {
  stargazers: number;
  repo: string;
} & React.ComponentProps<typeof Flex>) => {
  return (
    <Link muted href={`${repo}/stargazers`}>
      <Flex alignItems="center" {...props}>
        <StarIcon size="small" mr={1} />
        <Text>{stargazers.toLocaleString()}</Text>
      </Flex>
    </Link>
  );
};
