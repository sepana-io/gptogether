import React, { useState } from "react";
import _ from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "contexts/UserContext";
import { useMutation, useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";

import { Button, Icon, Input, Radio, Spinner, Text } from "components/atoms";
import Sidebar from "components/common/Sidebar";
import ChatHistory from "components/chat/ChatHistory";
import ChatContainer from "components/chat/ChatContainer";
import Conversation from "components/chat/Conversation";
import SimilarConversationNotification from "components/chat/SimilarConversationNotification";

export default function Chat() {
  const router = useRouter();
  const { userDetails } = useAuth();
  const currentChatID: string = Array.isArray(router.query.chat_id)
    ? router.query.chat_id.join("")
    : (router.query.chat_id as string);
  const { fetchConversationByID, updateConversation, updateVisibility } =
    useConversation();

  const [query, setQuery] = useState<string>("");
  const [visibilitySetting, setVisibilitySetting] = useState<
    "history_exposed" | "prompts_exposed" | "private"
  >("history_exposed");
  const [lastMessage, setLastMessage] = useState<string>("");

  /**
   * Get Initial conversation
   */
  const {
    data: conversationData,
    isLoading: conversationLoading,
    isError: conversationDataError,
    refetch: refetchConversationData,
  } = useQuery(
    ["converstation", currentChatID],
    () => fetchConversationByID(currentChatID),
    {
      onSuccess: (data) => {
        setVisibilitySetting(data.visibility_setting);
      },
      // onError: (error) => router.push("/chat"),
      // retry: false,
      // retryOnMount: false,
      // refetchOnWindowFocus: false,
    }
  );

  /**
   * Update Conversation
   */
  const {
    mutate: updateChatMutate,
    isLoading: updateChatLoading,
    error: updateChatError,
  } = useMutation({
    mutationFn: ({ query, visibility_setting }: any) => {
      return updateConversation(currentChatID, query, visibility_setting);
    },
    onSuccess: (data) => {
      setLastMessage("");
      refetchConversationData();
    },
  });
  const updateChat = (val: string) => {
    setQuery("");
    setLastMessage(val);
    updateChatMutate({ query: val, visibility_setting: visibilitySetting });
  };

  /**
   * Update Visibilty
   */
  const { mutate: updateVisibilityMutate, isLoading: updatingVisibility } =
    useMutation({
      mutationFn: ({ visibility_setting }: any) => {
        return updateVisibility(currentChatID, visibility_setting);
      },
    });
  const updateVisibilitySetting = (
    val: "history_exposed" | "prompts_exposed" | "private"
  ) => {
    setVisibilitySetting(val);
    updateVisibilityMutate({ visibility_setting: val });
  };

  return (
    <div className="flex">
      <Sidebar />
      <ChatHistory currentChatID={currentChatID} />
      <div className="flex-grow relative">
        <SimilarConversationNotification conversationId={currentChatID} />
        <div className="h-screen max-h-screen overflow-scroll pb-[200px]">
          <ChatContainer>
            {conversationLoading ? (
              <div className="py-[60px]">
                <Spinner size="md" className="text-gray-700 mx-auto" />
              </div>
            ) : (
              <Conversation
                titlePrompt={conversationData?.title_prompt}
                userDetails={userDetails}
                previousVisibility={conversationData?.previous_visibility}
                messageHistory={conversationData?.message_history}
                lastMessage={lastMessage}
                isLoading={updateChatLoading}
                errorMessage={_.get(updateChatError, "response.data.detail")}
              />
            )}
          </ChatContainer>
        </div>
        <div className="absolute bottom-[0] left-[0] right-[0] bg-gradient-to-t from-neutral_white-100 to-neutral_white-64">
          <ChatContainer>
            <div className="pb-[24px] flex flex-col gap-[16px] relative">
              <Input
                disabled={updateChatLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateChat(query);
                  }
                }}
                type="text"
                size="lg"
                className="shadow-e2 relative pr-[8px] pl-[16px]"
                placeholder="Send a message..."
                autoComplete="off"
                rightElement={
                  <div className="flex items-center gap-[12px]">
                    <Button
                      onClick={() => updateChat(query)}
                      icon="HiArrowNarrowUp"
                      iconClassName="transform rotate-[45deg]"
                      size="sm"
                      disabled={query === "" || updateChatLoading}
                    />
                  </div>
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center justify-center gap-[12px] z-10">
                <Text size="text-size_body2" className="font-semibold">
                  How would like to share this:
                </Text>
                <Radio
                  className="gap-[8px]"
                  defaultChecked
                  label="Public"
                  name="visibility_setting"
                  value="history_exposed"
                  checked={visibilitySetting === "history_exposed"}
                  onChange={(e: any) => updateVisibilitySetting(e.target.value)}
                />
                <Radio
                  className="gap-[8px]"
                  label="First Prompt Public"
                  name="visibility_setting"
                  value="prompts_exposed"
                  checked={visibilitySetting === "prompts_exposed"}
                  onChange={(e: any) => updateVisibilitySetting(e.target.value)}
                />
                <Radio
                  className="gap-[8px]"
                  label="Private"
                  name="visibility_setting"
                  value="private"
                  checked={visibilitySetting === "private"}
                  onChange={(e: any) => updateVisibilitySetting(e.target.value)}
                />
              </div>
            </div>
          </ChatContainer>
        </div>
      </div>
    </div>
  );
}
