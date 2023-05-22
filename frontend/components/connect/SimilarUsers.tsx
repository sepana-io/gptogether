import React from "react";
import _ from "lodash";
import UserList from "./UserList";
import { useUser } from "hooks/useUser";
import { useMutation, useQuery } from "react-query";

interface SimilarUsersProps {
  radius: number | null;
}

export default function SimilarUsers({ radius }: SimilarUsersProps) {
  const { findSimilarUsers, fetchUserByIDs } = useUser();
  /**
   * Collect users based on filter
   */
  const collectedUsers = useQuery(
    ["similar-users", radius],
    () => findSimilarUsers({ radius }),
    {
      retryOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const userIds: string[] = _.map(data, "user_id");
        userlist.mutate(userIds);
      },
    }
  );

  /**
   * Get user details based on ids recieved
   */
  const userlist = useMutation(
    "similar-users-list",
    (userIds: string[]) => fetchUserByIDs(userIds),
    { retry: false }
  );

  /**
   * convert format for the values
   */
  const finalDataList = _.values(_.get(userlist, "data"));

  return (
    <UserList
      isLoading={
        collectedUsers.isLoading ||
        userlist.isLoading ||
        collectedUsers.isFetching
      }
      userlist={finalDataList}
    />
  );
}
