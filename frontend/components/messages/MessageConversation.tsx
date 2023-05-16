import React from "react";
import _ from "lodash";
import { useAuth } from "contexts/UserContext";

import UserAvatar from "components/common/UserAvatar";
import clsx from "clsx";

interface MessageConversationProps {
  currentConversation: any;
}

export default function MessageConversation({
  currentConversation,
}: MessageConversationProps) {
  const { user } = useAuth();
  const currentUser = {
    user_id: user?.uid,
    name: user?.displayName,
    image_url: user?.photoURL,
  };

  return (
    <div className="w-full max-w-[880px] flex flex-col gap-[16px] mx-auto pt-[24px] pb-[200px] px-[40px]">
      {currentConversation &&
        _.get(currentConversation, "messages").map((item: any) => (
          <div className="flex gap-[20px]">
            <UserAvatar
              size="sm"
              user={{ name: "A" }}
              className={clsx({
                "opacity-1": _.get(item, "type") === "incoming",
                "opacity-0": _.get(item, "type") === "outgoing",
              })}
            />
            <div
              className={clsx({
                "flex-grow flex": true,
                "justify-start": _.get(item, "type") === "incoming",
                "justify-end": _.get(item, "type") === "outgoing",
              })}
            >
              <div
                className={clsx({
                  "py-[12px] px-[20px] text-size_body2 font-semibold": true,
                  "rounded-r-[16px] rounded-bl-[16px] bg-gray-75 text-gray-900":
                    _.get(item, "type") === "incoming",
                  "rounded-l-[16px] rounded-br-[16px] bg-primary-500 text-neutral_white":
                    _.get(item, "type") === "outgoing",
                })}
              >
                {_.get(item, "message")}
              </div>
            </div>
            <UserAvatar
              size="sm"
              user={currentUser}
              className={clsx({
                "opacity-0": _.get(item, "type") === "incoming",
                "opacity-1": _.get(item, "type") === "outgoing",
              })}
            />
          </div>
        ))}
    </div>
  );
}
