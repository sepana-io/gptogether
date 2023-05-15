import axios from "axios";
import { useAuth } from "contexts/UserContext";

export const useFirebase = () => {
  const { firebaseApp, firestore, user, userDetails, updateUser } = useAuth();

  const sendMessage = async () => {
    // const token = await user?.getIdToken();
    try {
      firestore
        .collection("myCollection")
        .doc("myDocument")
        .set({
          id: "name",
          name: "Proksh",
          messages: [
            { message: "Hello", type: "sent" },
            { message: "Hi Proksh", type: "recieved" },
          ],
        });
      // const ref = collection(firebaseApp, "posts").withConverter(postConverter);
      // return ref;
      // collection("votes");
      // const response = await axios.get(
      //   "https://gptogether-api.sepana.io/v1/user/info_by_email",
      //   {
      //     params: { email },
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      // updateUser(response.data);
      // return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { sendMessage };
};
