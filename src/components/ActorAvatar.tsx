import React from "react";

import { Avatar, Link } from "@primer/components";
import { Actor } from "../types";

interface ActorAvatarProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  size?: number;
  actor: Actor;
}

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
