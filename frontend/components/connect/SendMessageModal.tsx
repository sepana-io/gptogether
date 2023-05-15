import React, { useRef, useEffect } from "react";
import { Button, Input } from "components/atoms";
import UserAvatar from "components/common/UserAvatar";
import { useFirebase } from "hooks/useFirebase";
import {
  getFirestore,
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useAuth } from "contexts/UserContext";
// import { useCollection } from "react-firebase-hooks/firestore";

export default function SendMessageModal({ userDetails }: any) {
  const modalRef = useRef<any>(null);
  const { sendMessage } = useFirebase();
  const { firestore } = useAuth();
  // const [value, valueLoading, error] = useCollection(
  //   collection(getFirestore(firebaseApp), "a-b"),
  //   {}
  // );

  // const data = collection(firestore, "a-b");
  //
  // console.log({ data });

  // if (data) {
  //   data.docs.map((doc) => console.log(doc.data()));
  // }

  // if (!valueLoading && value) {
  //   value.docs.map((doc) => console.log(doc.data()));
  // }
  // const getData = async () => {
  //   const result = await firestore.collection("a-b").doc("1232").get();

  //   console.log(result);
  // };

  useEffect(() => {
    closeModalOnOverlayClick();
    // getData();
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

  const onButtonClick = () => {
    const res = sendMessage();
    console.log(res);
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
        <Input
          size="md"
          placeholder="Type your message"
          className="mb-[12px]"
        />
        <Button onClick={onButtonClick} size="md" className="w-full">
          Send
        </Button>
      </dialog>
    </>
  );
}
