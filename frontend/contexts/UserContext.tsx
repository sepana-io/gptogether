import { getAuth } from "@firebase/auth";
import { useContext, createContext, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { initFirebase } from "../firebase/firebaseApp";
import { getFirestore } from "firebase/firestore";

interface UserContextData {
  firebaseApp: any;
  firestore: any;
  user: any;
  loading: boolean;
  userDetails: any;
  updateUser: (newUser: any) => void;
}

export const UserContext = createContext<UserContextData>({
  firebaseApp: null,
  firestore: null,
  user: null,
  loading: false,
  userDetails: null,
  updateUser: () => {},
});

export const UserContextProvider = ({ children }: any) => {
  const firebaseApp = initFirebase();
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const [userDetails, setUserDetails] = useState({});

  console.log({ firestore });

  const updateUser = (newUserDetails: any) => {
    setUserDetails((prevState) => ({ ...prevState, ...newUserDetails }));
  };

  return (
    <UserContext.Provider
      value={{ firebaseApp, firestore, user, loading, userDetails, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(UserContext);
};
