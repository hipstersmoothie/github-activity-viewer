import React from "react";

import { Avatar, Link } from "@primer/components";
import { Actor } from "../utils/types";

interface ActorAvatarProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  /** The size of the avatar */
  size?: number;
  /** The user to display an avatar for */
  actor: Actor;
}

/** Display an avatar for a user */
export const ActorAvatar = ({
  actor,
  size = 32,
  style,
  ...linkProps
}: ActorAvatarProps) => (
  <Link
    {...linkProps}
    title={actor.display_login}
    href={`https://github.com/${actor.display_login}`}
    style={{ ...style, borderRadius: "50%", overflow: "hidden", flex: "none" }}
  >
    <Avatar
      src={actor.avatar_url}
      alt={`@${actor.display_login}`}
      size={size}
    />
  </Link>
);
