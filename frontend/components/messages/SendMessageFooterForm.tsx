import React from "react";
import _ from "lodash";
import SendMessageForm from "components/messages/SendMessageForm";

export default function SendMessageFooterForm({
  selectedConversation,
  onSuccess,
}: any) {
  const sendToUser = {
    user_id: _.get(selectedConversation, `user_id`),
    name: _.get(selectedConversation, `user_name`),
    image_url: _.get(selectedConversation, `user_image`),
  };

  return (
    <div className="absolute bottom-[0] left-[0] right-[0] bg-neutral_white border-t border-gray-75 py-[16px] px-[32px]">
      <SendMessageForm
        sendToUser={sendToUser}
        type="horizontal"
        className="w-full max-w-[696px] flex items-center gap-[12px] mx-auto"
        onSuccess={onSuccess}
      />
    </div>
  );
}
