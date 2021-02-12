import ago from "s-ago";

import { Text } from "@primer/components";

export const Since = ({ date }: { date: Date }) => (
  <Text color="gray.4">{ago(new Date(date))}</Text>
);
