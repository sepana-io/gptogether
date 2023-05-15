import { Avatar } from "components/atoms";
import React from "react";
import _ from "lodash";
import clsx from "clsx";

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
  if (_.get(user, "image_url")) {
    return (
      <Avatar
        type="image"
        imageUrl={_.get(user, "image_url")}
        size={size}
        className={clsx("bg-gray-100 bg-cover bg-center", className)}
      />
    );
  }
  if (
    _.get(user, "name") ||
    _.get(user, "user_name") ||
    _.get(user, "user_id")
  ) {
    const initials: string = _.reduce(
      (
        _.get(user, "name") ||
        _.get(user, "user_name") ||
        _.get(user, "user_id")
      ).split(" "),
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
