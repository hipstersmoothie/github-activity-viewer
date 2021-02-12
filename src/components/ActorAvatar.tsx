import * as React from "react";

import { Avatar, Link, Tooltip } from "@primer/components";
import { Actor } from "../utils/types";

interface ActorAvatarProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  /** The size of the avatar */
  size?: number;
  /** The user to display an avatar for */
  actor: Actor;
  showTooltip?: boolean;
}

/** Display an avatar for a user */
export const ActorAvatar = ({
  actor,
  size = 32,
  style,
  showTooltip,
  className,
  sx,
  ...linkProps
}: ActorAvatarProps) => {
  console.log(linkProps);
  const link = (
    <Link
      {...linkProps}
      className={showTooltip ? undefined : className}
      sx={showTooltip ? undefined : sx}
      target="_blank"
      rel="noopener"
      href={`https://github.com/${actor.display_login}`}
      style={{
        ...style,
        borderRadius: "50%",
        overflow: "hidden",
        flex: "none",
        // display: "flex",
      }}
    >
      <Avatar
        src={actor.avatar_url}
        alt={`@${actor.display_login}`}
        size={size}
      />
    </Link>
  );

  if (showTooltip) {
    return (
      <Tooltip
        aria-label={actor.login}
        className={className}
        sx={{ ...sx, borderRadius: "50%" }}
      >
        {link}
      </Tooltip>
    );
  }

  return link;
};
