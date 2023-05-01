import axios from "axios";
import { useAuth } from "contexts/UserContext";

export const useConversation = () => {
  const { user } = useAuth();

  const createConversation = async (
    title_prompt: string,
    message: string,
    visibility_setting: "history_exposed" | "prompts_exposed" | "private"
  ) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/create",
        { title_prompt, message, visibility_setting },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateConversation = async (
    conversation_id: string,
    message: string,
    visibility_setting: "history_exposed" | "prompts_exposed" | "private"
  ) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/update",
        { conversation_id, message, visibility_setting },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateVisibility = async (
    conversation_id: string,
    visibility_setting: "history_exposed" | "prompts_exposed" | "private"
  ) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/update",
        { conversation_id, visibility_setting },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const listConversation = async () => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/list",
        { sort: "updated_at", page: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchConversationByDocumentID = async (document_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/fetch_by_document_id",
        { document_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchConversationByID = async (conversation_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/fetch_by_id",
        { conversation_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteConversation = async (conversation_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.delete(
        "https://gptogether-api.sepana.io/v1/conversation/delete",
        {
          data: { conversation_id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const listOthersConversation = async (others_user_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/list_others_conversations",
        { others_user_id, filters: { page: "1" } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const shareConversationState = async (
    document_id: string,
    visibility_setting: "history_exposed" | "prompts_exposed" | "private"
  ) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/share_state",
        { document_id, visibility_setting },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const similarConversations = async (conversation_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/conversation/similar_conversations",
        { conversation_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    createConversation,
    updateConversation,
    updateVisibility,
    listConversation,
    fetchConversationByID,
    fetchConversationByDocumentID,
    deleteConversation,
    listOthersConversation,
    shareConversationState,
    similarConversations,
  };
};
