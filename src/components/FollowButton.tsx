import * as React from "react";
import { IconButton, Tooltip } from "@primer/react";
import { PlusIcon } from "@primer/styled-octicons";
import { useOctokit } from "../utils/useOctokit";

export const FollowButton = ({
  username,
  isFollowing,
  size,
  onFollowChange,
}: {
  username: string;
  isFollowing: boolean | undefined;
  onFollowChange: (value: boolean) => void;
  size?: "small" | "default" | "large";
}) => {
  const octokit = useOctokit();
  const onFollow = async () => {
    if (!octokit) {
      return;
    }

    await octokit.users.follow({ username });
    onFollowChange(true);
  };

  if (isFollowing) {
    return null;
  }

  return (
    <Tooltip aria-label="Follow" style={{ display: "flex" }}>
      <IconButton
        size={size === "default" ? undefined : size}
        aria-label="follow"
        icon={PlusIcon}
        onClick={onFollow}
      />
    </Tooltip>
  );
};
