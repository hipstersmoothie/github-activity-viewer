import { Avatar, Link, LinkProps, Tooltip } from "@primer/react";
import { User } from "../utils/types";

interface ActorAvatarProps extends Omit<LinkProps, "href"> {
  /** The size of the avatar */
  size?: number;
  /** The user to display an avatar for */
  actor: Pick<User, "avatar_url" | "login">;
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
    <Avatar src={actor.avatar_url} alt={`@${actor.login}`} size={size} />
  );

  return (
    <Link
      {...linkProps}
      className={className}
      sx={sx}
      target="_blank"
      rel="noopener"
      href={`https://github.com/${actor.login}`}
      style={{
        ...style,
        borderRadius: "50%",
        overflow: "visible",
        flex: "none",
      }}
    >
      {showTooltip ? (
        <Tooltip
          aria-label={actor.login}
          sx={{ borderRadius: "50%", display: "flex", overflow: "visible" }}
        >
          {avatar}
        </Tooltip>
      ) : (
        avatar
      )}
    </Link>
  );
};
