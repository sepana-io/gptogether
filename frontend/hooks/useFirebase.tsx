import { useAuth } from "contexts/UserContext";
import _ from "lodash";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  getDocs,
  collection,
} from "firebase/firestore";

export const useFirebase = () => {
  const { firestore, user } = useAuth();
  const currentUser = {
    user_id: user?.uid,
    name: user?.displayName,
    image_url: user?.photoURL,
  };

  const getAllMessages = async () => {
    try {
      const userCollectionRef = collection(firestore, currentUser?.user_id);
      const querySnapshot = await getDocs(userCollectionRef);
      let result: any = [];
      querySnapshot.forEach((doc) => {
        result.push(doc.data());
      });
      result.sort((a: any, b: any) => b.last_updated - a.last_updated);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const readData = async (senderId: string, recieverId: string) => {
    try {
      const userDoc = doc(firestore, senderId, recieverId);
      const document = await getDoc(userDoc);
      if (document.exists()) {
        return document.data();
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  interface updateMessageProps {
    sendFrom: any;
    sendTo: any;
    message: string;
    type: "incoming" | "outgoing";
    status: "read" | "unread";
  }
  const updateMessage = async ({
    sendFrom,
    sendTo,
    message,
    type,
    status,
  }: updateMessageProps) => {
    try {
      const prevData = (await readData(sendFrom.user_id, sendTo.user_id)) || {
        messages: [],
      };
      const prevMessages =
        status === "read"
          ? _.map(prevData.messages, (prevMess: any) => ({
              ...prevMess,
              status: "read",
            }))
          : [...prevData.messages];
      const newMessages = [
        ...prevMessages,
        {
          type,
          status,
          message: message,
          Timestamp: Timestamp.fromDate(new Date()),
        },
      ];
      const total_unread: any = _.filter(newMessages, function (o) {
        return o.status === "unread";
      }).length;
      const userDoc = doc(firestore, sendFrom.user_id, sendTo.user_id);
      const newData = {
        messages: newMessages,
        user_name: sendTo.name,
        user_id: sendTo.user_id,
        user_image: sendTo.image_url,
        total_unread,
        last_updated: Timestamp.fromDate(new Date()),
      };
      const response = await setDoc(userDoc, newData);
      return newData;
    } catch (error) {
      throw error;
    }
  };

  const continueConversation = async (sendTo: any, message: string) => {
    try {
      const response1 = await updateMessage({
        sendFrom: currentUser,
        sendTo,
        message,
        type: "outgoing",
        status: "read",
      });
      const response2 = await updateMessage({
        sendFrom: sendTo,
        sendTo: currentUser,
        message,
        type: "incoming",
        status: "unread",
      });
      return response1;
    } catch (error) {
      throw error;
    }
  };

  const updateConversationToRead = async (conversationWith: any) => {
    try {
      const prevData = (await readData(
        currentUser.user_id,
        conversationWith.user_id
      )) || {
        messages: [],
      };
      const newMessages = _.map(prevData.messages, (prevMess: any) => ({
        ...prevMess,
        status: "read",
      }));
      const total_unread: any = 0;
      const userDoc = doc(
        firestore,
        currentUser.user_id,
        conversationWith.user_id
      );
      const newData = {
        ...prevData,
        messages: newMessages,
        total_unread,
      };
      const response = await setDoc(userDoc, newData);
      return newData;
    } catch (error) {
      throw error;
    }
  };

  return { continueConversation, getAllMessages, updateConversationToRead };
};
