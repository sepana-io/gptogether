import React, { useRef, useEffect } from "react";
import _ from "lodash";

import { Button } from "components/atoms";
import { useRouter } from "next/router";
import UserAvatar from "components/common/UserAvatar";
import SendMessageForm from "components/messages/SendMessageForm";

export default function SendMessageModal({ userDetails }: any) {
  const router = useRouter();
  const modalRef = useRef<any>(null);

  useEffect(() => {
    closeModalOnOverlayClick();
  }, []);

  const showModal = () => {
    modalRef.current?.showModal();
  };

  const closeModalOnOverlayClick = () => {
    modalRef.current?.addEventListener("click", (e: any) => {
      const dialogDimensions = modalRef.current?.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        modalRef.current?.close();
      }
    });
  };

  return (
    <>
      <Button onClick={showModal} leftIcon="HiOutlineChatAlt2" size="sm">
        Send Message
      </Button>
      <dialog
        aria-modal
        ref={modalRef}
        className="p-[32px] w-[480px] rounded-[12px] shadow-e5 bg-neutral_white"
      >
        <div className="flex mb-[20px] gap-[4px]">
          <p className="text-size_body2 font-semibold">Send a message to</p>
          <UserAvatar size="xs" user={userDetails} />
          <p className="text-size_body2 font-semibold">
            {userDetails?.name || userDetails?.user_id}
          </p>
        </div>
        <SendMessageForm
          className="flex flex-col gap-[12px]"
          type="verical"
          sendToUser={userDetails}
          onSuccess={() => {
            modalRef.current?.close();
            router.push("/messages");
          }}
        />
      </dialog>
    </>
  );
}
