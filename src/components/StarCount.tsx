import { Box, BoxProps, Text, Link } from "@primer/react";
import { StarIcon } from "@primer/styled-octicons";

export const StarCount = ({
  repo,
  stargazers,
  ...props
}: {
  stargazers: number;
  repo: string;
} & BoxProps) => {
  return (
    <Link muted href={`${repo}/stargazers`}>
      <Box display="flex" alignItems="center" {...props}>
        <StarIcon size="small" mr={1} />
        <Text>{stargazers.toLocaleString()}</Text>
      </Box>
    </Link>
  );
};
