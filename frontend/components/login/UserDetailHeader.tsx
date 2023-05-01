import React from "react";
import { Text } from "components/atoms";

import UserAvatar from "components/common/UserAvatar";

interface UserDetailHeader {
  user: any;
}

export default function UserDetailHeader({ user }: UserDetailHeader) {
  return (
    <div className="flex gap-[24px] items-center mb-[32px]">
      <UserAvatar user={user} size="xxl" />
      <div>
        <Text size="text-size_heading5" className="mb-[-2px] font-semibold">
          {user?.name}
        </Text>
        <Text
          size="text-size_heading6"
          color="text-gray-700"
          className="font-semibold"
        >
          {user?.email}
        </Text>
      </div>
    </div>
  );
}
