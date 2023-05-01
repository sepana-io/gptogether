import React, { useState } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { useMutation, useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";
import { useAuth } from "contexts/UserContext";

import { Button, Radio, Spinner, Text } from "components/atoms";
import ChatContainer from "components/chat/ChatContainer";
import Conversation from "components/chat/Conversation";

interface OthersConversationProps {
  document_id: string;
  userProfileData?: any;
}

export default function OthersConversation({
  document_id,
  userProfileData,
}: OthersConversationProps) {
  const router = useRouter();
  const { userDetails } = useAuth();
  const { fetchConversationByDocumentID, shareConversationState } =
    useConversation();

  const [visibilitySetting, setVisibilitySetting] = useState<
    "history_exposed" | "prompts_exposed" | "private"
  >("history_exposed");

  /**
   * Get Initial conversation
   */
  const {
    data: conversationData,
    isLoading: conversationLoading,
    refetch: refetchConversationData,
  } = useQuery(
    ["converstation", document_id],
    () => fetchConversationByDocumentID(document_id),
    { retry: false, retryOnMount: false, refetchOnWindowFocus: false }
  );

  const {
    data: conversationStateData,
    isLoading: conversationStateDataLoading,
    mutate: conversationStateMutate,
  } = useMutation(
    ["converstation-state", document_id],
    ({ document_id, visibility_setting }: any) => {
      console.log({ document_id, visibility_setting });
      return shareConversationState(document_id, visibility_setting);
    },
    {
      onSuccess: (data) => {
        router.push(`/chat/${data.conversation.conversation_id}`);
      },
    }
  );

  const contiueConversation = () => {
    conversationStateMutate({
      document_id,
      visibility_setting: visibilitySetting,
    });
  };

  const disableContinue =
    _.get(userDetails, "user_id") === _.get(userProfileData, "user_id");

  if (conversationLoading) {
    return (
      <div className="flex-grow relative">
        <ChatContainer>
          <div className="h-screen max-h-screen flex items-center justify-center">
            <Spinner size="md" className="text-gray-700 mx-auto" />
          </div>
        </ChatContainer>
      </div>
    );
  }

  return (
    <div className="flex-grow relative">
      <div className="h-screen max-h-screen overflow-scroll pb-[200px]">
        <ChatContainer>
          <Conversation
            totalPrompt={conversationData?.total_prompts}
            titlePrompt={conversationData?.title_prompt}
            previousVisibility={conversationData?.visibility_setting}
            userDetails={userProfileData}
            messageHistory={conversationData?.message_history}
          />
          <div className="px-[32px] py-[24px] bg-gray-50 rounded-[20px]">
            <Text size="text-size_heading6" className="font-semibold mb-[8px]">
              Continue Conversation
            </Text>
            <div className="flex items-center justify-start gap-[12px] z-10 mb-[16px]">
              <Text size="text-size_body2" className="font-semibold">
                Keep continued conversation:
              </Text>
              <Radio
                disabled={disableContinue}
                className="gap-[8px]"
                defaultChecked
                label="Public"
                name="visibility_setting"
                value="history_exposed"
                checked={visibilitySetting === "history_exposed"}
                onChange={(e: any) => setVisibilitySetting(e.target.value)}
              />
              <Radio
                disabled={disableContinue}
                className="gap-[8px]"
                label="First Prompt Public"
                name="visibility_setting"
                value="prompts_exposed"
                checked={visibilitySetting === "prompts_exposed"}
                onChange={(e: any) => setVisibilitySetting(e.target.value)}
              />
              <Radio
                disabled={disableContinue}
                className="gap-[8px]"
                label="Private"
                name="visibility_setting"
                value="private"
                checked={visibilitySetting === "private"}
                onChange={(e: any) => setVisibilitySetting(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={contiueConversation}
              disabled={disableContinue}
            >
              Continue Conversation
            </Button>
          </div>
        </ChatContainer>
      </div>
    </div>
  );
}
