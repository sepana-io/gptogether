import { getAuth } from "@firebase/auth";
import { useContext, createContext, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface UserContextData {
  user: any;
  loading: boolean;
  userDetails: any;
  updateUser: (newUser: any) => void;
}

export const UserContext = createContext<UserContextData>({
  user: null,
  loading: false,
  userDetails: null,
  updateUser: () => {},
});

export const UserContextProvider = ({ children }: any) => {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const [userDetails, setUserDetails] = useState({});

  const updateUser = (newUserDetails: any) => {
    setUserDetails((prevState) => ({ ...prevState, ...newUserDetails }));
  };

  return (
    <UserContext.Provider value={{ user, loading, userDetails, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(UserContext);
};
