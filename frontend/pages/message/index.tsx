import React from "react";
import _ from "lodash";
import Text from "../../components/atoms/text/Text";
import Icon from "../../components/atoms/icons/Icon";

import Sidebar from "components/common/Sidebar";
import ChatHistory from "components/chat/ChatHistory";
import UserAvatar from "components/common/UserAvatar";

export default function Message() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-w-[280px] w-[280px] px-[8px] py-[24px] border-r border-gray-50 h-screen overflow-y-scroll flex flex-col">
        {[1, 2, 3, 5].map((item) => (
          <div className="grid grid-cols-[40px_calc(100%-52px)] rounded-[8px] gap-[12px] items-center px-[16px] bg-white hover:bg-primary-50">
            <UserAvatar size="md" user={{ name: "A L" }} />
            <div className="flex-grow py-[16px] border-b border-gray-50">
              <div className="flex gap-[8px] items-center">
                <p className="flex-grow text-size_body2 font-semibold truncate">
                  Tiana Kenter fdadfsfdas dsfadfs sfasdf
                </p>
                <p className="text-size_caption2 text-gray-700">10:30PM</p>
              </div>
              <p className="text-size_body2 text-gray-700 w-full truncate">
                Hey, wassup??, how are you doing?
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* <ChatHistory />
      <div className="flex-grow relative"></div> */}
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
    </div>
  );
}
