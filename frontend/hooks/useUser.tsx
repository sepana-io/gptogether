import axios from "axios";
import _ from "lodash";
import { useAuth } from "contexts/UserContext";

export const useUser = () => {
  const { user, userDetails, updateUser } = useAuth();

  const fetchUserByEmail = async (email: string | null | undefined) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.get(
        "https://gptogether-api.sepana.io/v1/user/info_by_email",
        {
          params: { email },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchUserByID = async (user_id: string) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.get(
        "https://gptogether-api.sepana.io/v1/user/info_by_user_id",
        { params: { user_id }, headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const fetchUserByIDs = async (userIdList: any) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/user/info_by_user_ids",
        { user_ids: userIdList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const onboardUser = async (values: any) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/user/onboard_user",
        {
          ...values,
          user_id: user?.uid,
          email: user?.email,
          name: user?.displayName,
          image_url: user?.photoURL,
          type_of_login: "google",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateUserInfo = async (values: any) => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/user/update_user_info",
        {
          ...values,
          user_id: user?.uid,
          email: user?.email,
          name: user?.displayName,
          image_url: user?.photoURL,
          type_of_login: "google",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async () => {
    const token = await user?.getIdToken();
    try {
      const response = await axios.delete(
        "https://gptogether-api.sepana.io/v1/user/revoke",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(null);
      return response;
    } catch (error) {
      throw error;
    }
  };

  interface findSimilarUsersProps {
    radius?: string;
    page?: number;
  }
  const findSimilarUsers = async ({ radius, page }: findSimilarUsersProps) => {
    const token = await user?.getIdToken();
    const requestData = radius
      ? {
          location: {
            latitude: _.get(userDetails, "latitude"),
            longitude: _.get(userDetails, "longitude"),
            radius,
            page,
          },
        }
      : {};
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/user/find_similar_users",
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  interface findNearbyUsersProps {
    radius?: string;
    page: number;
  }
  const findNearbyUsers = async ({ radius, page }: findNearbyUsersProps) => {
    const token = await user?.getIdToken();
    const requestData = radius
      ? {
          latitude: _.get(userDetails, "latitude"),
          longitude: _.get(userDetails, "longitude"),
          radius,
          page,
        }
      : {
          latitude: _.get(userDetails, "latitude"),
          longitude: _.get(userDetails, "longitude"),
          page,
        };
    try {
      const response = await axios.post(
        "https://gptogether-api.sepana.io/v1/user/find_nearby_users",
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.users;
    } catch (error) {
      throw error;
    }
  };

  return {
    fetchUserByEmail,
    fetchUserByID,
    fetchUserByIDs,
    onboardUser,
    updateUserInfo,
    deleteUser,
    findSimilarUsers,
    findNearbyUsers,
  };
};
