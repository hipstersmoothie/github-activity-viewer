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
  const avatar = (
    <Avatar
      src={actor.avatar_url}
      alt={`@${actor.display_login}`}
      size={size}
    />
  );

  return (
    <Link
      {...linkProps}
      className={className}
      sx={sx}
      target="_blank"
      rel="noopener"
      href={`https://github.com/${actor.display_login}`}
      style={{
        ...style,
        borderRadius: "50%",
        overflow: 'visible',
        flex: "none",
        display: "flex",
      }}
    >
      {showTooltip ? (
        <Tooltip
          aria-label={actor.login}
          sx={{ borderRadius: "50%", display: "flex", overflow: 'visible' }}
        >
          {avatar}
        </Tooltip>
      ) : (
        avatar
      )}
    </Link>
  );
};
