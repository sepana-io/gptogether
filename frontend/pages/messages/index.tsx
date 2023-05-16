import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useFirebase } from "hooks/useFirebase";
import { useQuery } from "react-query";
import { Text, Icon, Button, Input } from "components/atoms";

import Sidebar from "components/common/Sidebar";
import AllMessagesPannel from "components/messages/AllMessagesPannel";
import EmptyMessagesState from "components/messages/EmptyMessagesState";
import SendMessageFooterForm from "components/messages/SendMessageFooterForm";
import MessageConversation from "components/messages/MessageConversation";
import { useAuth } from "contexts/UserContext";

export default function Message() {
  const { realDB, user } = useAuth();
  const { getAllMessages } = useFirebase();
  const [selectedConversation, setSelectedConversation] = useState<number>(0);
  const allMessages = useQuery(["all-messages"], getAllMessages, {
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      setSelectedConversation(0);
    },
  });

  const sendToUser = {
    user_id: _.get(allMessages, `data[${selectedConversation}].user_id`),
    name: _.get(allMessages, `data[${selectedConversation}].user_name`),
    image_url: _.get(allMessages, `data[${selectedConversation}].user_image`),
  };

  return (
    <div className="flex">
      <Sidebar />
      {!allMessages.isLoading && allMessages.data.length === 0 ? (
        <EmptyMessagesState />
      ) : (
        <>
          <AllMessagesPannel
            allMessages={allMessages}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
          {!allMessages.isLoading && (
            <div className="flex-grow relative">
              <div className="h-screen overflow-scroll">
                <MessageConversation
                  currentConversation={allMessages.data[selectedConversation]}
                />
              </div>
              <SendMessageFooterForm sendToUser={sendToUser} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
