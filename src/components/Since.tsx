import ago from "s-ago";

import { Text } from "@primer/react";

export const Since = ({
  date,
  ...props
}: { date: Date } & React.ComponentProps<typeof Text>) => (
  <Text as="div" color="fg.subtle" {...props}>
    {ago(new Date(date))}
  </Text>
);
