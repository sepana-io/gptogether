import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { useAuth } from "contexts/UserContext";
import { useFirebase } from "hooks/useFirebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import Sidebar from "components/common/Sidebar";
import AllMessagesPannel from "components/messages/AllMessagesPannel";
import EmptyMessagesState from "components/messages/EmptyMessagesState";
import SendMessageFooterForm from "components/messages/SendMessageFooterForm";
import MessageConversation from "components/messages/MessageConversation";

export default function Message() {
  const { firestore, user } = useAuth();
  const { updateConversationToRead } = useFirebase();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversations, setConversations] = useState<any>({
    isLoading: true,
    data: [],
  });

  useEffect(() => {
    subscribeToAnyMessageChange();
  }, [user]);

  /**
   * Subscribe to change in data and set selectedCoversations and
   * @returns
   */
  const subscribeToAnyMessageChange = () => {
    if (!user) {
      setConversations({
        isLoading: false,
        data: [],
      });
      return;
    }
    const q = query(
      collection(firestore, user?.uid),
      orderBy("last_updated", "desc")
    );
    onSnapshot(q, (querySnapchot) => {
      let ar: any = [];
      querySnapchot.docs.forEach((doc) => {
        ar.push(doc.data());
      });
      setConversations({
        isLoading: false,
        data: ar,
      });
    });
  };

  const changeSelectedConversation = (value: any) => {
    updateConversationToRead(value);
    setSelectedConversation(value);
  };

  // 👇️ scroll to bottom every time messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [selectedConversation]);

  const currentSelectedIndex = _.findIndex(
    conversations.data,
    function (o: any) {
      return o?.user_id === selectedConversation?.user_id;
    }
  );

  return (
    <div className="flex">
      <Sidebar />
      {!conversations.isLoading && conversations.data.length === 0 ? (
        <EmptyMessagesState
          title="No messages yet"
          description="When someone connects with you or you start a new chat and it will appear here."
        />
      ) : (
        <>
          <AllMessagesPannel
            allMessages={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={changeSelectedConversation}
          />
          {!conversations.isLoading && (
            <>
              {selectedConversation ? (
                <div className="flex-grow relative">
                  <div className="h-screen overflow-scroll">
                    <MessageConversation
                      currentConversation={
                        conversations.data[currentSelectedIndex]
                      }
                    />
                    <div ref={bottomRef} />
                  </div>
                  <SendMessageFooterForm
                    selectedConversation={selectedConversation}
                    onSuccess={changeSelectedConversation}
                  />
                </div>
              ) : (
                <EmptyMessagesState
                  title="Connect"
                  description="Click on the chat on the left to see entire chat"
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
