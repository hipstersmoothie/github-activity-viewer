import React from "react";

import { Flex, Text } from "@primer/components";
import { StarIcon } from "@primer/styled-octicons";

export const StarCount = ({
  stargazers,
  ...props
}: {
  stargazers: number;
} & React.ComponentProps<typeof Flex>) => {
  return (
    <Flex alignItems="center" color="gray.6" {...props}>
      <StarIcon size="small" mr={1} />
      <Text>{stargazers.toLocaleString()}</Text>
    </Flex>
  );
};
