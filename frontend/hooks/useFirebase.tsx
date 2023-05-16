import { useAuth } from "contexts/UserContext";
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
    const prevData = (await readData(sendFrom.user_id, sendTo.user_id)) || {
      messages: [],
    };
    const newMessages = [
      ...prevData.messages,
      {
        type,
        status,
        message: message,
        Timestamp: Timestamp.fromDate(new Date()),
      },
    ];
    try {
      const userDoc = doc(firestore, sendFrom.user_id, sendTo.user_id);
      const response = await setDoc(userDoc, {
        messages: newMessages,
        user_name: sendTo.name,
        user_id: sendTo.user_id,
        user_image: sendTo.image_url,
        last_updated: Timestamp.fromDate(new Date()),
      });
      console.log({ response });
      return response;
    } catch (error) {
      console.log({ error });

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
      return response2;
    } catch (error) {
      throw error;
    }
  };

  return { readData, continueConversation, getAllMessages };
};
