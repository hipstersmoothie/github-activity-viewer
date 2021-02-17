import ago from "s-ago";

import { Text } from "@primer/components";

export const Since = ({
  date,
  ...props
}: { date: Date } & React.ComponentProps<typeof Text>) => (
  <Text as="div" color="gray.4" {...props}>
    {ago(new Date(date))}
  </Text>
);
