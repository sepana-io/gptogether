import React from "react";
import _ from "lodash";
import { getDate } from "components/atoms/utils/functions";

import UserAvatar from "components/common/UserAvatar";
import clsx from "clsx";

interface AllMessagesPannelProps {
  allMessages: any;
  selectedConversation: any;
  setSelectedConversation: (val: number) => void;
}

export default function AllMessagesPannel({
  allMessages,
  selectedConversation,
  setSelectedConversation,
}: AllMessagesPannelProps) {
  return (
    <div className="min-w-[280px] w-[280px] px-[8px] py-[24px] border-r border-gray-50 h-screen overflow-y-scroll flex flex-col">
      <p className="px-[16px] text-size_heading6 font-semibold mb-[12px]">
        All Messages
      </p>
      {allMessages.isLoading ? (
        <div className="px-[16px] flex flex-col gap-[8px]">
          {[1, 2, 3].map((item) => (
            <div className="grid grid-cols-[40px_calc(100%-52px)] gap-[12px] items-center">
              <div className="bg-gray-100 animate-pulse h-[40px] rounded-full my-[12px]" />
              <div className="py-[12px] border-b border-gray-50">
                <div className="w-[50%] h-[20px] mb-[4px] bg-gray-100 animate-pulse" />
                <div className="w-[30%] h-[16px] bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {allMessages?.data?.map((item: any, index: number) => (
            <div
              className={clsx(
                "grid grid-cols-[40px_calc(100%-52px)] rounded-[8px] gap-[12px] items-center px-[16px]",
                _.isEqual(selectedConversation?.user_id, item?.user_id)
                  ? "bg-primary-50"
                  : "bg-white hover:bg-primary-25 cursor-pointer"
              )}
              onClick={() => setSelectedConversation(item)}
            >
              <UserAvatar
                user={{
                  user_name: _.get(item, "user_name"),
                  image_url: _.get(item, "user_image"),
                }}
                size="md"
              />
              <div className="flex-grow py-[12px] border-b border-gray-50">
                <div className="flex gap-[8px] items-center">
                  <p className="flex-grow text-size_body2 font-semibold truncate">
                    {_.get(item, "user_name")}
                  </p>
                  <p className="text-size_caption2 text-gray-700">
                    {getDate(_.get(item, "last_updated"))}
                  </p>
                </div>
                <div className="flex gap-[8px] items-center">
                  <p className="text-size_body2 text-gray-700 flex-grow truncate">
                    {item.messages[item.messages.length - 1].message}
                  </p>
                  {_.get(item, "total_unread") &&
                  _.toNumber(_.get(item, "total_unread")) > 0 ? (
                    <p className="text-size_caption2 font-semibold text-neutral_white bg-success-500 px-[8px] shadow-e1 rounded-full py-[2px]">
                      {_.get(item, "total_unread")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
