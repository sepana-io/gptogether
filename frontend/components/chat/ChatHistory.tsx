import React from "react";
import _ from "lodash";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";

import { Button, Icon, Spinner, Text } from "components/atoms";
import { useConversation } from "hooks/useConversation";

interface ChatHistoryProps {
  currentChatID?: string;
}

export default function ChatHistory({ currentChatID }: ChatHistoryProps) {
  const router = useRouter();
  const { listConversation } = useConversation();

  /**
   * Get Chat History
   */
  const {
    data: chatHistory,
    refetch: refetchChatHistory,
    isLoading: chatHistoryLoading,
    isFetching: chatHistoryFetching,
  } = useQuery("chat-history", listConversation, {
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="w-[240px] border-r border-gray-75 max-h-screen overflow-scroll">
      <div className="p-[24px]">
        <Button
          onClick={() => router.push("/chat")}
          leftIcon="HiOutlinePlus"
          variant={currentChatID ? "secondary" : "tertiary"}
          size="sm"
          className="w-full"
        >
          New Chat
        </Button>
      </div>
      {chatHistoryLoading || chatHistoryFetching ? (
        <div className="p-[24px] mx-auto">
          <Spinner size="sm" className="mx-auto text-gray-300" />
        </div>
      ) : (
        <div className="px-[8px] gap-[2px] flex flex-col">
          {chatHistory &&
            chatHistory.conversations.length > 0 &&
            chatHistory.conversations.map((item: any) => {
              const active = item.conversation_id === currentChatID;

              if (item.title_prompt === "") {
                return null;
              }

              return (
                <>
                  <Link
                    key={item.conversation_id}
                    href={`/chat/${item.conversation_id}`}
                    className={clsx(
                      "pl-[16px] pr-[2px] gap-[8px] flex items-center rounded-[8px] focus:outline-none focus:shadow-outline-focus_primary",
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
                      className="line-clamp-1 flex-grow"
                    >
                      {item.title_prompt}
                    </Text>
                    <DeleteConversation
                      conversation_id={item.conversation_id}
                      refetchChatHistory={refetchChatHistory}
                    />
                  </Link>
                </>
              );
            })}
        </div>
      )}
    </div>
  );
}

const DeleteConversation = ({ conversation_id, refetchChatHistory }: any) => {
  const router = useRouter();
  const { deleteConversation } = useConversation();

  /**
   * Delete Conversation
   */
  const { mutate: deleteConversationMutate, isLoading: isDeleting } =
    useMutation({
      mutationFn: (conversation_id: string) => {
        return deleteConversation(conversation_id);
      },
      onSuccess: () => {
        if (_.get(router, "query.chat_id") === conversation_id) {
          router.push("/chat");
        }
        setTimeout(() => refetchChatHistory(), 500);
      },
    });

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteConversationMutate(conversation_id);
      }}
      icon="HiOutlineTrash"
      size="sm"
      variant="quaternary"
    />
  );
};
