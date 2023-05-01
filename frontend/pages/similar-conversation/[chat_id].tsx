import React, { useState } from "react";
import clsx from "clsx";
import _ from "lodash";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";

import { Text, Icon, Spinner } from "components/atoms";
import OthersConversation from "components/chat/OthersConversation";

export default function SimilarConversations() {
  const router = useRouter();
  const { similarConversations, fetchConversationByDocumentID } =
    useConversation();
  const [currentConv, setCurrentConv] = useState("");
  const similarFromChatId: string = Array.isArray(router.query.chat_id)
    ? router.query.chat_id.join("")
    : (router.query.chat_id as string);
  const initialIndex: string = Array.isArray(router.query.index)
    ? router.query.index.join("")
    : (router.query.index as string);

  /**
   * Get similar conversations
   */
  const {
    data: similarConversationsData,
    isLoading: similarConversationLoading,
  } = useQuery(
    ["similar-converstation", similarFromChatId],
    () => similarConversations(similarFromChatId),
    {
      onSuccess: (data) => {
        console.log(data);
        if (initialIndex) {
          setCurrentConv(_.get(data[initialIndex], "storage_index"));
        } else {
          setCurrentConv(_.get(data[0], "storage_index"));
        }
      },
    }
  );

  function removeQueryParam() {
    const { pathname, query } = router;
    delete query.index;
    router.replace({ pathname, query });
  }

  const onTabChange = (value: string) => {
    removeQueryParam();
    setCurrentConv(value);
  };


  if (similarConversationLoading) {
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
            Similar Conversations
          </Text>
        </div>
        <Text size="text-size_title2" weight="font-medium">
          Total {similarConversationsData.length} prompts
        </Text>
        {similarConversationsData && (
          <div className="py-[40px] -mx-[16px] flex flex-col gap-[4px]">
            {similarConversationsData.map((item: any) => {
              const active = currentConv === item?.storage_index;
              return (
                <button
                  key={item.storage_index}
                  onClick={() => onTabChange(item.storage_index)}
                  className={clsx(
                    "w-full px-[16px] py-[8px] gap-[8px] flex items-center rounded-[8px] focus:outline-none focus:shadow-outline-focus_primary",
                    active
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-700 bg-transparent hover:text-primary-700 hover:bg-primary-25 focus:text-primary-700 focus:bg-primary-25"
                  )}
                >
                  <Icon
                    name="HiOutlineChat"
                    size={18}
                    className="min-w-[18px]"
                  />
                  <Text
                    size="text-size_body2"
                    weight="font-semibold"
                    className="line-clamp-1 flex-grow text-left"
                  >
                    {item.conv_subject}
                  </Text>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <OthersConversation
        document_id={currentConv}
      />
    </div>
  );
}
