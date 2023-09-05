import * as React from "react";
import { IconButton, Tooltip } from "@primer/react";
import { PlusIcon } from "@primer/styled-octicons";
import { Octokit } from "@octokit/rest";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

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
  const [supabaseClient] = React.useState(() => createPagesBrowserClient());
  const onFollow = async () => {
    const session = await supabaseClient.auth.getSession();

    if (!session.data.session) {
      throw new Error("No session");
    }

    const accessToken = session.data.session["provider_token"];

    if (!accessToken) {
      throw new Error("No access token");
    }

    const octokit = new Octokit({ auth: accessToken });
    await octokit.users.follow({ username });
    onFollowChange(true);
  };

  if (isFollowing) {
    return null;
  }

  return (
    <Tooltip aria-label="Follow" style={{ display: "flex" }}>
      <IconButton size={size} icon={PlusIcon} onClick={onFollow} />
    </Tooltip>
  );
};
