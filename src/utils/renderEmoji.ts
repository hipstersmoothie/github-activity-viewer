import toEmoji from "gemoji/name-to-emoji";

export const renderEmoji = (str: string) =>
  str && str.replace(/:([^:]*):/g, (_, val) => toEmoji[val] || val);
