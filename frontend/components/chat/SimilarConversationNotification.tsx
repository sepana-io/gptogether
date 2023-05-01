import React, { useEffect, useState } from "react";
import _ from "lodash";
import Link from "next/link";
import clsx from "clsx";
import { useMutation, useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";

import { Icon, Text } from "components/atoms";

interface SimilarConversationNotificationProps {
  conversationId: string;
}
export default function SimilarConversationNotification({
  conversationId,
}: SimilarConversationNotificationProps) {
  const { similarConversations } = useConversation();
  const [showNotification, setShowNotication] = useState<boolean>(false);

  /**
   * Get similar conversations
   */
  const {
    mutate: fetchIfSimilarConversationsExist,
    data: similarConversationsData,
    // isLoading: similarConversationLoading,
  } = useMutation(
    "similar-converstation",
    (conversationId: string) => similarConversations(conversationId),
    {
      onSuccess: (data) => {
        if (data && data.length > 0) {
          setShowNotication(true);
        }
      },
    }
  );

  useEffect(() => {
    setShowNotication(false);
    fetchIfSimilarConversationsExist(conversationId);
  }, [conversationId]);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="absolute w-[360px] top-[16px] right-[15px] z-10 p-[24px] gap-[16px] flex rounded-[16px] shadow-e4 border-2 border-success-75 bg-neutral_white items-start">
      <Icon
        name="HiInformationCircle"
        size={24}
        className="min-w-[24px] text-success-500"
      />
      <div className="flex-grow">
        <Text size="text-size_body1" weight="font-bold" className="mb-[4px]">
          Found similar Conversations
        </Text>
        <Text
          size="text-size_body2"
          weight="font-semibold"
          color="text-gray-700"
          className="mb-[12px]"
        >
          See how other discussed on similar topics.
        </Text>
        {similarConversationsData && (
          <div className="py-[12px] -mx-[16px] flex flex-col gap-[4px]">
            {similarConversationsData.map((item: any, index: number) => {
              return (
                <Link
                  key={item.storage_index}
                  href={`/similar-conversation/${conversationId}?index=${index}`}
                  target="_blank"
                >
                  <button
                    className={clsx(
                      "w-full px-[16px] py-[8px] gap-[8px] flex items-center rounded-[8px] focus:outline-none focus:shadow-outline-focus_primary",
                      "text-gray-700 bg-transparent"
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
                    <Icon
                      name="HiOutlineArrowUp"
                      size={18}
                      className="min-w-[18px] text-success-500 transform rotate-45"
                    />
                  </button>
                </Link>
              );
            })}
          </div>
        )}
        {_.get(similarConversationsData, "length") > 1 && (
          <Link
            href={`/similar-conversation/${conversationId}`}
            target="_blank"
            className="flex items-center text-success-500 gap-[4px]"
          >
            <Text size="text-size_body2" weight="font-semibold">
              Check All
            </Text>
            <Icon name="HiArrowUp" size={18} className="transform rotate-45" />
          </Link>
        )}
      </div>
      <button onClick={() => setShowNotication(false)}>
        <Icon
          name="HiX"
          size={24}
          className="min-w-[24px] text-gray-700 cursor-pointer"
        />
      </button>
    </div>
  );
}
