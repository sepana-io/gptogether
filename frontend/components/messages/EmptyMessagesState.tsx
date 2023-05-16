import React from "react";
import { Icon, Text } from "components/atoms";

const EmptyMessagesState = () => {
  return (
    <div className="p-[40px] min-h-screen flex-grow mx-auto flex flex-col items-center justify-center max-w-[466px]">
      <div className="p-[12px] bg-gray-50 rounded-full mb-[12px]">
        <Icon name="HiOutlineChatAlt2" size={40} className="shrink-0" />
      </div>
      <Text
        size="text-size_heading5"
        weight="font-semibold"
        className="text-center mb-[12px]"
      >
        No messages yet
      </Text>
      <Text size="text-size_title2" className="text-center text-gray-700">
        When someone connects with you or you start a new chat and it will
        appear here.
      </Text>
    </div>
  );
};

export default EmptyMessagesState;
