import { Avatar } from "components/atoms";
import React from "react";
import { reduce } from "lodash";

interface UserAvatarProps {
  user: any;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
}

export default function UserAvatar({
  user,
  size = "sm",
  className,
}: UserAvatarProps) {
  if (user?.image_url) {
    return (
      <Avatar
        type="image"
        imageUrl={user?.image_url}
        size={size}
        className={className}
      />
    );
  }
  if (user?.name || user?.user_name || user?.user_id) {
    const initials: string = reduce(
      (user?.name || user?.user_name || user?.user_id).split(" "),
      (result, word) => result + word[0],
      ""
    );
    const maxInitials: string = initials.substring(0, 2);
    return (
      <Avatar
        type="text"
        text={maxInitials}
        size={size}
        className={className}
      />
    );
  }
  return <Avatar size={size} className={className} />;
}
