import React, { useState } from "react";
import _ from "lodash";
import clsx from "clsx";
import { useMutation, useQuery } from "react-query";
import { useUser } from "hooks/useUser";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "contexts/UserContext";

import { Button, Icon, Text } from "components/atoms";
import Sidebar from "components/common/Sidebar";
import UserListItem from "components/connect/UserListItem";
import Link from "next/link";

export default function Connect() {
  const { userDetails } = useAuth();
  const { findSimilarUsers, fetchUserByIDs, findNearbyUsers } = useUser();
  const [userType, setUserType] = useState<string>("similar");
  const [radius, setRadius] = useState<string>("any");

  /**
   * Fetching different api and data based on filters
   */
  const collectUsersBasedOnState = ({ queryKey, pageParams = 1 }: any) => {
    const [_key, userType, radius] = queryKey;
    console.log(_key, userType, radius);
    if (userType === "similar") {
      if (radius === "any") {
        return findSimilarUsers({ page: (pageParams = 1) });
      }
      return findSimilarUsers({ radius, page: (pageParams = 1) });
    }

    if (radius === "any") {
      return findNearbyUsers({ page: (pageParams = 1) });
    }
    return findNearbyUsers({ radius, page: (pageParams = 1) });
  };

  /**
   * Collect users based on filter
   */
  const collectedUsers = useQuery(
    ["similar-users", userType, radius],
    collectUsersBasedOnState,
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
   * Get user details after getting the list
   */
  const userlist = useMutation(
    "similar-users-list",
    (userIds: string[]) => fetchUserByIDs(userIds),
    { retry: false }
  );

  /**
   * Change user type
   * @param key
   */
  const changeUserType = (key: string) => {
    setUserType(key);
    // Change distance as there is no option of any distance for any user
    // if (key === "all" && radius === "any") {
    //   setRadius("500");
    // } else if (key === "similar") {
    //   setRadius("any");
    // }
  };

  /**
   * Calculate distanceOptions based on user type
   */
  let distanceOptions: any = {
    any: "anywhere",
    "100000": "within 100,000 kms",
    "10000": "within 10,000 kms",
    "1000": "within 1000 kms",
    "500": "within 500 kms",
    "100": "within 100 kms",
  };
  // if (userType === "similar") {
  //   distanceOptions = {
  //     any: "anywhere",
  //     ...distanceOptions,
  //   };
  // }

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
          {userDetails.longitude && userDetails.latitude ? (
            <div className="mb-[32px] text-size_body2 font-semibold flex items-baseline gap-[8px]">
              Show
              <Dropdown
                selected={userType}
                onChange={changeUserType}
                options={{
                  similar: "Similar Users",
                  all: "All Users",
                }}
              />
              with location
              <Dropdown
                selected={radius}
                onChange={setRadius}
                options={distanceOptions}
              />
            </div>
          ) : (
            <div className="flex py-[8px] px-[16px] bg-danger-50 rounded-[8px] mb-[32px]">
              <Text
                size="text-size_body2"
                weight="font-medium"
                color="text-gray-900"
                className="font-semibold"
              >
                You haven't set your location. You need to{" "}
                <Link href="/chat" className="text-primary-500 underline">
                  set it here
                </Link>{" "}
                if you want to use filters
              </Text>
            </div>
          )}
          <UsersList
            isLoading={
              collectedUsers.isLoading ||
              userlist.isLoading ||
              collectedUsers.isFetching
            }
            userType={userType}
            collectedUsers={collectedUsers}
            userlist={userlist}
          />
        </div>
      </div>
    </div>
  );
}

interface UserListProps {
  userType: string;
  collectedUsers: any;
  userlist: any;
  isLoading: boolean;
}

const UsersList = ({
  collectedUsers,
  userType,
  userlist,
  isLoading,
}: UserListProps) => {
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

  const finalDataList = _.get(collectedUsers, "data");

  if (!finalDataList) {
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
      {finalDataList &&
        finalDataList.map((item: any, index: number) => (
          <UserListItem
            key={`${item?.prompt_subject}-${item?.user_id}-${index}`}
            promptDetail={item}
            userDetails={userlist.data[item.user_id]}
          />
        ))}
    </div>
  );
};

const Dropdown = ({ selected, options, onChange }: any) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-[8px] focus:outline-none focus-visible:ring-4 focus-visible:shadow-e2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-primary-75">
        <Button
          size="sm"
          variant="secondary"
          rightIcon="HiChevronDown"
          className="text-gray-900"
        >
          {options[selected]}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="bg-neutral_white rounded-[8px] p-[4px] border border-gray-100 shadow-e2 w-full"
        >
          {Object.keys(options).map((key: any) => {
            const isSelected = key === selected;
            return (
              <DropdownMenu.Item
                key={key}
                onClick={() => onChange(key)}
                className={clsx(
                  "relative text-size_body2 font-semibold px-[8px] py-[4px] hover:z-[1] focus-visible:z-[1] rounded-[8px] focus:outline-none focus-visible:ring-4 focus-visible:shadow-e2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-primary-75",
                  isSelected
                    ? "bg-primary-50 text-primary-500"
                    : "bg-transparent text-gray-900 hover:bg-primary-25"
                )}
              >
                {options[key]}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
