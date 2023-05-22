import React from "react";
import _ from "lodash";
import UserList from "./UserList";
import { useUser } from "hooks/useUser";
import { useMutation, useQuery } from "react-query";

interface AllUsersProps {
  radius: number | null;
}

export default function AllUsers({ radius }: AllUsersProps) {
  const { findNearbyUsers } = useUser();

  /**
   * all users with location filter
   */
  const nearbyUsers = useQuery(
    ["all-users", radius],
    () => findNearbyUsers({ radius }),
    {
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <UserList
      isLoading={nearbyUsers.isLoading || nearbyUsers.isFetching}
      userlist={nearbyUsers.data}
    />
  );
}
