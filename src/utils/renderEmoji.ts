import toEmoji from "gemoji/name-to-emoji.json";

export const renderEmoji = (str: string) =>
  str && str.replace(/:([^:]*):/g, (_, val) => toEmoji[val] || val);
