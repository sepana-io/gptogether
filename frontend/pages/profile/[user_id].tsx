import React, { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";
import { useUser } from "hooks/useUser";

import { Icon, Spinner, Text } from "components/atoms";
import UserAvatar from "components/common/UserAvatar";
import OthersConversation from "components/chat/OthersConversation";

export default function OtherUsers() {
  const router = useRouter();
  const currentUserId: string = Array.isArray(router.query.user_id)
    ? router.query.user_id.join("")
    : (router.query.user_id as string);

  if (currentUserId.startsWith("sys_user_")) {
    router.push(`/system-user/${currentUserId}`);
  }

  const { fetchUserByIDs } = useUser();
  const { listOthersConversation } = useConversation();

  const [currentConv, setCurrentConv] = useState<any>(null);

  /**
   * Fetch User
   */
  const { data: userProfileData, isLoading: userProfileDataLoading } = useQuery(
    ["user-details", currentUserId],
    () => fetchUserByIDs([currentUserId]),
    {
      enabled: currentUserId !== "",
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  /**
   * Get Initial conversation
   */
  const { data, isLoading, isError } = useQuery(
    ["converstation", currentUserId],
    () => listOthersConversation(currentUserId),
    {
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setCurrentConv(data.conversations[0] || "");
      },
    }
  );

  const userData =
    userProfileData &&
    Object.keys(userProfileData)[0] &&
    userProfileData[Object.keys(userProfileData)[0]];

  if (isLoading || userProfileDataLoading) {
    return (
      <div className="h-screen w-screen pt-[40px] pb-[80px] flex items-center justify-center text-gray-700">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-[256px] min-w-[320px] px-[24px] py-[24px] border-r border-gray-100 h-screen overflow-scroll">
        <div className="flex gap-[8px] items-center mb-[4px]">
          <Text
            size="text-size_title1"
            weight="font-semibold"
            className="whitespace-nowrap"
          >
            Prompts of
          </Text>
          <UserAvatar size="xs" user={userData} />
          <Text weight="font-semibold" className="whitespace-nowrap">
            {userData?.name}
          </Text>
        </div>
        <Text size="text-size_title2" weight="font-medium">
          Total {data.total} prompts
        </Text>
        <div className="py-[40px] -mx-[16px] flex flex-col gap-[4px]">
          {data.conversations.map((item: any) => {
            const active = currentConv?.storage_index === item?.storage_index;
            return (
              <button
                key={item.storage_index}
                onClick={() => setCurrentConv(item)}
                className={clsx(
                  "w-full px-[16px] py-[8px] gap-[8px] flex items-center rounded-[8px] focus:outline-none focus:shadow-outline-focus_primary",
                  active
                    ? "text-primary-700 bg-primary-50"
                    : "text-gray-700 bg-transparent hover:text-primary-700 hover:bg-primary-25 focus:text-primary-700 focus:bg-primary-25"
                )}
              >
                <Icon name="HiOutlineChat" size={18} className="min-w-[18px]" />
                <Text
                  size="text-size_body2"
                  weight="font-semibold"
                  className="line-clamp-1 flex-grow text-left"
                >
                  {item.title_prompt}
                </Text>
              </button>
            );
          })}
        </div>
      </div>
      <OthersConversation
        document_id={currentConv?.storage_index}
        userProfileData={userData}
      />
    </div>
  );
}
