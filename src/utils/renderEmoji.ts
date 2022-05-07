import { nameToEmoji } from "gemoji";

export const renderEmoji = (str: string) =>
  str && str.replace(/:([^:]*):/g, (_, val) => nameToEmoji[val] || val);
