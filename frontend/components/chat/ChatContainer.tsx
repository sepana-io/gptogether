import React from "react";

export default function ChatContainer({ children }: any) {
  return (
    <div className="max-w-[880px] pl-[28px] pr-[52px] w-full mx-auto relative">
      {children}
    </div>
  );
}
