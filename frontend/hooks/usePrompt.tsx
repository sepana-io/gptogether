import axios from "axios";
import { useAuth } from "contexts/UserContext";

export const usePrompt = () => {
  const { user } = useAuth();

  const suggestPrompt = async (
    query: string | null | undefined = "",
    top_n: number = 10,
    max_words: number = 10
  ) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/prompts/suggest",
        {
          query,
          top_n,
          max_words,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return error;
    }
  };

  return {
    suggestPrompt,
  };
};
