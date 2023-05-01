import React from "react";
import { map } from "lodash";
import { useMutation, useQuery } from "react-query";
import { useUser } from "hooks/useUser";

import { Spinner, Text } from "components/atoms";
import Sidebar from "components/common/Sidebar";
import UserListItem from "components/connect/UserListItem";

export default function Connect() {
  const { findSimilarUsers, fetchUserByIDs } = useUser();
  const {
    data: similarPrompts,
    isLoading: similarPromptsLoading,
    isFetching: similarPromptsFetching,
  } = useQuery("similar-users", findSimilarUsers, {
    retryOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const userIds: string[] = map(data, "user_id");
      userListMutate(userIds);
    },
  });

  const {
    mutate: userListMutate,
    data: usersList,
    isLoading: usersListLoading,
  } = useMutation(
    "similar-users-list",
    (userIds: string[]) => fetchUserByIDs(userIds),
    {
      retry: false,
    }
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow h-screen overflow-scroll">
        <div className="max-w-[1184px] px-[64px] pt-[64px] pb-[104px] mx-auto">
          <Text
            size="text-size_heading1"
            weight="font-semibold"
            className="mb-[8px]"
          >
            Connect
          </Text>
          <Text
            size="text-size_title1"
            weight="font-medium"
            className="mb-[40px]"
          >
            Meet people with similar interests as yours based on your prompts.
          </Text>
          <UsersList
            isLoading={
              similarPromptsLoading ||
              usersListLoading ||
              similarPromptsFetching
            }
            similarPrompts={similarPrompts}
            usersList={usersList}
          />
        </div>
      </div>
    </div>
  );
}

interface UserListProps {
  similarPrompts: any;
  usersList: any;
  isLoading: boolean;
}

const UsersList = ({ similarPrompts, usersList, isLoading }: UserListProps) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (!similarPrompts || similarPrompts.length === 0) {
    return (
      <Text size="text-size_body2" weight="font-medium" color="text-gray-700">
        No Similar Users found
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {similarPrompts &&
        similarPrompts.map((item: any, index: number) => (
          <UserListItem
            key={`${item?.prompt_subject}-${item?.user_id}-${index}`}
            promptDetail={item}
            userDetails={usersList[item.user_id]}
          />
        ))}
    </div>
  );
};
