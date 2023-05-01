import React, { useState } from "react";
import _ from "lodash";
import { useRouter } from "next/router";
import { useAuth } from "contexts/UserContext";
import { useMutation, useQuery } from "react-query";
import { useConversation } from "hooks/useConversation";
import clsx from "clsx";
import { Avatar, Button, Input, Radio, Spinner, Text } from "components/atoms";
import { HiOutlineChat } from "react-icons/hi";
import ChatContainer from "components/chat/ChatContainer";
import Conversation from "components/chat/Conversation";
import { useUser } from "hooks/useUser";
import UserAvatar from "components/common/UserAvatar";
import axios from "axios";

export default function SystemUsers() {
  const router = useRouter();
  const userId: string = Array.isArray(router.query.user_id)
    ? router.query.user_id.join("")
    : (router.query.user_id as string);
  const { findSimilarUsers, fetchUserByIDs } = useUser();
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  const {
    data: similarPrompts,
    isLoading: similarPromptsLoading,
    isFetching: similarPromptsFetching,
  } = useQuery("similar-users", findSimilarUsers, {
    retryOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess: (data: any) => {
      const filteredData =
        data && data.find((item: any) => item.user_id !== userId);
      setCurrentPrompt(_.get(filteredData, "sample_prompts[0]"));
    },
  });

  if (similarPromptsLoading) {
    return (
      <div className="h-screen w-screen pt-[40px] pb-[80px] flex items-center justify-center text-gray-700">
        <Spinner />
      </div>
    );
  }

  const filteredPrompt =
    similarPrompts &&
    similarPrompts.find((item: any) => item.user_id !== userId);

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
          <UserAvatar size="xs" user={filteredPrompt} />
          <Text weight="font-semibold" className="whitespace-nowrap">
            {_.get(filteredPrompt, "user_name")}
          </Text>
        </div>
        <Text size="text-size_title2" weight="font-medium">
          Total {_.get(filteredPrompt, "sample_prompts.length")} prompts
        </Text>
        <div className="py-[40px] -mx-[16px] flex flex-col gap-[4px]">
          {_.get(filteredPrompt, "sample_prompts") &&
            _.get(filteredPrompt, "sample_prompts").map((item: any) => {
              const active = currentPrompt === item;
              return (
                <button
                  key={item.storage_index}
                  onClick={() => setCurrentPrompt(item)}
                  className={clsx(
                    "w-full px-[16px] py-[8px] gap-[8px] flex items-center rounded-[8px] focus:outline-none focus:shadow-outline-focus_primary",
                    active
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-700 bg-transparent hover:text-primary-700 hover:bg-primary-25 focus:text-primary-700 focus:bg-primary-25"
                  )}
                >
                  <HiOutlineChat size="18px" className="min-w-[18px]" />
                  <Text
                    size="text-size_body2"
                    weight="font-semibold"
                    className="line-clamp-1 flex-grow text-left"
                  >
                    {item}
                  </Text>
                </button>
              );
            })}
        </div>
      </div>
      <OthersConversation
        system_id={_.get(filteredPrompt, "user_name")}
        prompt={currentPrompt}
      />
    </div>
  );
}

interface OthersConversationProps {
  system_id: string;
  prompt: string;
}
const OthersConversation = ({ system_id, prompt }: OthersConversationProps) => {
  const [visibilitySetting, setVisibilitySetting] = useState<
    "history_exposed" | "prompts_exposed" | "private"
  >("history_exposed");

  const initials: string = _.reduce(
    system_id?.split(" "),
    (result, word) => result + word[0],
    ""
  );

  return (
    <div className="flex-grow relative">
      <div className="h-screen max-h-screen overflow-scroll pb-[200px]">
        <ChatContainer>
          <div className="py-[40px] px-[32px] gap-[16px] flex flex-col">
            <div className="w-full flex gap-[20px]">
              <Avatar
                size="md"
                type="image"
                imageUrl="/images/chat-gpt-icon.svg"
                className="opacity-0"
              />
              <div
                className={clsx({
                  "flex-grow flex flex-col": true,
                  "items-end": true,
                })}
              >
                <div
                  className={clsx({
                    "text-size_body2 font-semibold px-[20px] py-[12px]": true,
                    "bg-gray-50 rounded-l-[12px] rounded-br-[12px]": true,
                  })}
                  dangerouslySetInnerHTML={{
                    __html: prompt,
                  }}
                />
              </div>
              <Avatar size="md" type="text" text={initials} />
            </div>
            <div className="flex items-center gap-[24px] mt-[24px] mb-[24px]">
              <div className="flex-grow h-[1px] bg-gray-200" />
              <Text
                size="text-size_body2"
                weight="font-semibold"
                className="text-center text-gray-800"
              >
                This is a system generated prompt
              </Text>
              <div className="flex-grow h-[1px] bg-gray-200" />
            </div>
          </div>
        </ChatContainer>
      </div>
    </div>
  );
};
