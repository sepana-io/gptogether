import React from "react";
import _ from "lodash";
import Link from "next/link";
import { Text, Icon } from "components/atoms";
import UserListItem from "./UserListItem";

interface UserListProps {
  userlist: any;
  isLoading: boolean;
}

export default function UserList({ userlist, isLoading }: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[8px]">
        {[1, 2, 3].map((item) => (
          <div
            key={`loading-${item}`}
            className="flex items-end justify-center p-[40px] bg-gray-50 animate-pulse rounded-[12px]"
          />
        ))}
      </div>
    );
  }

  if (!userlist) {
    return (
      <>
        <div className="border-t border-gray-100" />
        <div className="flex flex-col items-center py-[80px] max-w-[400px] mx-auto">
          <div className="p-[12px] bg-gray-50 rounded-full mb-[12px]">
            <Icon name="HiOutlineExclamation" size={40} className="shrink-0" />
          </div>
          <Text
            size="text-size_body1"
            weight="font-medium"
            color="text-gray-700"
            className="text-center"
          >
            No Result found. You might need to have some{" "}
            <Link href="/chat" className="text-primary-500 underline">
              prompt conversations here
            </Link>{" "}
            to start finding similar users.
          </Text>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {userlist &&
        userlist.map((item: any, index: number) => (
          <UserListItem
            key={`${item?.prompt_subject}-${item?.user_id}-${index}`}
            userDetails={item}
          />
        ))}
    </div>
  );
}
