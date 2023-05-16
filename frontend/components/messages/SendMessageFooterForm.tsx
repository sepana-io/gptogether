import React from "react";
import SendMessageForm from "components/messages/SendMessageForm";

export default function SendMessageFooterForm({ sendToUser }: any) {
  return (
    <div className="absolute bottom-[0] left-[0] right-[0] bg-neutral_white border-t border-gray-75 py-[16px] px-[32px]">
      <SendMessageForm
        sendToUser={sendToUser}
        type="horizontal"
        className="w-full max-w-[696px] flex items-center gap-[12px] mx-auto"
      />
    </div>
  );
}
