import React, { useCallback, useState } from "react";
import _ from "lodash";
import Image from "next/image";
import { Button, Input, Radio, Spinner, Text } from "components/atoms";
import { useMutation, useQuery } from "react-query";
import { usePrompt } from "hooks/usePrompt";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useConversation } from "hooks/useConversation";

import Sidebar from "components/common/Sidebar";
import ChatHistory from "components/chat/ChatHistory";
import GptSuggestion from "components/chat/GptSuggestion";
import ChatContainer from "components/chat/ChatContainer";
import Conversation from "components/chat/Conversation";
import { useAuth } from "contexts/UserContext";

export default function Chat() {
  const router = useRouter();
  const { userDetails } = useAuth();
  const { suggestPrompt } = usePrompt();
  const { createConversation } = useConversation();

  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [visibilitySetting, setVisibilitySetting] = useState<
    "history_exposed" | "prompts_exposed" | "private"
  >("history_exposed");
  const [lastMessage, setLastMessage] = useState<string>("");

  /**
   * Prompt suggestion
   */
  const delayedSuggestPrompt = useCallback(debounce(suggestPrompt, 500), []);
  const {
    data: promptSuggestion,
    isLoading: promptSuggestionLoading,
    isFetching: promptSuggestionFetching,
  } = useQuery(["search", query], () => delayedSuggestPrompt(query), {
    enabled: query !== "",
  });

  /**
   * Start Converstaion
   */
  const {
    mutate: chatMutate,
    data: chatMutateData,
    isLoading: chatMulateLoading,
    error: chatMutateError,
  } = useMutation({
    mutationFn: (query: string) => {
      return createConversation(query, query, visibilitySetting);
    },
    onSuccess: (data) => {
      router.push(`/chat/${data?.conversation?.conversation_id}`);
    },
  });

  const startNewChat = (val: string) => {
    setLastMessage(val);
    chatMutate(val);
  };

  return (
    <div className="flex">
      <Sidebar />
      <ChatHistory />
      <div className="flex-grow relative">
        <div className="h-screen max-h-screen overflow-scroll pb-[200px]">
          <ChatContainer>
            {chatMulateLoading || chatMutateData || chatMutateError ? (
              <Conversation
                messageHistory={[]}
                lastMessage={lastMessage}
                isLoading={chatMulateLoading}
                userDetails={userDetails}
                errorMessage={_.get(chatMutateError, "response.data.detail")}
              />
            ) : (
              <>
                <div className="w-[312px] mx-auto my-[64px]">
                  <Image
                    alt="gpt-logo"
                    height={61}
                    width={312}
                    src="/images/gptogether.svg"
                  />
                </div>
                <GptSuggestion
                  onSelect={(val: string) => {
                    startNewChat(val);
                  }}
                />
              </>
            )}
          </ChatContainer>
        </div>
        <div className="absolute bottom-[0] left-[0] right-[0] bg-gradient-to-t from-neutral_white-100 to-neutral_white-64">
          <ChatContainer>
            <div className="pb-[24px] flex flex-col gap-[16px] relative">
              {!chatMulateLoading &&
                promptSuggestion &&
                promptSuggestion.length > 0 && (
                  <div className="absolute bottom-[calc(100%+4px)] left-[0] right-[0] p-[8px] bg-neutral_white shadow-e4 border border-gray-100 rounded-[16px]">
                    {promptSuggestion.map((item: string, index: number) => (
                      <div
                        key={`suggestion-${item}-${index}`}
                        onClick={() => startNewChat(item)}
                        className="px-[16px] py-[8px] text-size_body2 font-semibold transition text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-[8px]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              <Input
                disabled={chatMulateLoading}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    startNewChat(query);
                  }
                }}
                type="text"
                size="lg"
                className="shadow-e2 relative pr-[8px] pl-[16px]"
                placeholder="Send a message..."
                autoComplete="off"
                rightElement={
                  <div className="flex items-center gap-[12px]">
                    {(promptSuggestionLoading || promptSuggestionFetching) && (
                      <Spinner size="xs" className="text-gray-400" />
                    )}
                    <Button
                      onClick={() => startNewChat(query)}
                      icon="HiArrowNarrowUp"
                      iconClassName="transform rotate-[45deg]"
                      size="sm"
                      disabled={query === "" || chatMulateLoading}
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
                  onChange={(e: any) => setVisibilitySetting(e.target.value)}
                />
                <Radio
                  className="gap-[8px]"
                  label="First Prompt Public"
                  name="visibility_setting"
                  value="prompts_exposed"
                  checked={visibilitySetting === "prompts_exposed"}
                  onChange={(e: any) => setVisibilitySetting(e.target.value)}
                />
                <Radio
                  className="gap-[8px]"
                  label="Private"
                  name="visibility_setting"
                  value="private"
                  checked={visibilitySetting === "private"}
                  onChange={(e: any) => setVisibilitySetting(e.target.value)}
                />
              </div>
            </div>
          </ChatContainer>
        </div>
      </div>
    </div>
  );
}
