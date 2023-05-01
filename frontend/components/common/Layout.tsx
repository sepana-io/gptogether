import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useUser } from "hooks/useUser";
import { getAuth } from "@firebase/auth";
import { useAuth } from "contexts/UserContext";

import { Spinner } from "components/atoms";
import Onboarding from "components/login/Onboarding";

export default function Layout({ children }: any) {
  const auth = getAuth();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { fetchUserByEmail } = useUser();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      console.log("no user");
      auth.signOut();
    }
    // Redirect to chat page if user is logged in and on the homepage
    if (user && router.pathname === "/") {
      router.push("/chat");
    }
    // Redirect to login page if user is not logged in and not on the homepage
    if (!user && router.pathname !== "/") {
      router.push("/");
    }
  }, [user, router.pathname, loading]);

  const {
    data: userProfileData,
    isLoading: userProfileDataLoading,
    isError,
    error,
  } = useQuery(
    ["user-details", user?.email],
    () => fetchUserByEmail(user?.email),
    {
      enabled: !!user?.email,
      staleTime: 300000,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  if (loading || userProfileDataLoading) {
    return (
      <div className="h-screen w-screen pt-[40px] pb-[80px] flex items-center justify-center text-gray-700">
        <Spinner />
      </div>
    );
  }

  if (user && !userProfileData) {
    return <Onboarding />;
  }

  return children;
}
