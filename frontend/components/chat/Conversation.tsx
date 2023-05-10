import React from "react";
import clsx from "clsx";
import { Markup } from "interweave";

import { Avatar } from "components/atoms";
import UserAvatar from "components/common/UserAvatar";

export default function Conversation({
  totalPrompt,
  titlePrompt,
  messageHistory,
  userDetails,
  lastMessage,
  isLoading,
  previousVisibility,
  previousUserDetails,
  errorMessage,
}: any) {
  return (
    <div className="py-[40px] px-[32px] gap-[16px] flex flex-col">
      {previousVisibility && previousVisibility !== "history_exposed" && (
        <>
          <ConversationMessageItem
            item={{
              role: "user",
              content: titlePrompt,
            }}
            userDetails={previousUserDetails}
          />
          <div className="w-full text-center text-size_body2 bg-danger-75 rounded-[8px] px-[12px] py-[40px] font-semibold">
            Conversation was shared with history not exposed.
            {totalPrompt &&
              ` There ${
                totalPrompt === 1 ? "is" : "are"
              } ${totalPrompt} prompt${
                totalPrompt === 1 ? "" : "s"
              } in the following conversation`}
          </div>
        </>
      )}
      {messageHistory.map((item: any, index: number) => (
        <ConversationMessageItem
          item={item}
          key={`message-${item.content}-${index}`}
          userDetails={userDetails}
        />
      ))}
      {lastMessage && lastMessage !== "" && (
        <ConversationMessageItem
          item={{ role: "user", content: lastMessage }}
          userDetails={userDetails}
        />
      )}
      {isLoading && (
        <ConversationMessageItem
          item={{ role: "assistant", content: "Loading..." }}
          userDetails={userDetails}
          loading={true}
        />
      )}
      {errorMessage && (
        <div className="px-[20px] py-[8px] rounded-[8px] text-size_body2 w-full bg-danger-50 text-danger-700 font-semibold">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

interface ConversationMessageItemProps {
  item: any;
  userDetails?: any;
  loading?: boolean;
}

const ConversationMessageItem = ({
  item,
  userDetails,
  loading,
}: ConversationMessageItemProps) => {
  return (
    <div className="w-full flex gap-[20px]">
      <Avatar
        size="md"
        type="image"
        imageUrl="/images/chat-gpt-icon.svg"
        className={clsx({ "opacity-0": item.role === "user" })}
      />
      <div
        className={clsx({
          "flex-grow flex flex-col": true,
          "items-start": item.role === "assistant",
          "items-end": item.role === "user",
        })}
      >
        <div
          className={clsx({
            "text-size_body2 font-semibold px-[20px] py-[12px]": true,
            "bg-gray-50 rounded-l-[12px] rounded-br-[12px]":
              item.role === "user",
            "bg-gray-100 rounded-r-[12px] rounded-bl-[12px] w-full":
              item.role === "assistant",
            "animate-pulse": loading,
          })}
        >
          <Markup content={item.content} />
        </div>
      </div>
      <UserAvatar
        size="md"
        user={userDetails}
        className={clsx({ "opacity-0": item.role === "assistant" })}
      />
    </div>
  );
};
