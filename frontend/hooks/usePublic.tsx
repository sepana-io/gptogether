import axios from "axios";
import { getAuth } from "@firebase/auth";
import { useAuth } from "contexts/UserContext";

export const usePublic = () => {
  const auth = getAuth();
  const { user, userDetails, updateUser } = useAuth();

  const homepage = async () => {
    const token = await user?.getIdToken();
    return await axios.get("https://gptogether-api.sepana.io/v1/", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const decryptKey = async (key: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/decrypt_key",
        { key },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    homepage,
    decryptKey,
  };
};
