import React from "react";
import { Text, Button } from "components/atoms";
import { useUser } from "hooks/useUser";
import { useQuery } from "react-query";
import { getAuth } from "@firebase/auth";

export default function DeleteAccount() {
  const auth = getAuth();
  const { deleteUser } = useUser();
  const { refetch } = useQuery("data", deleteUser, {
    enabled: false,
    onSuccess: () => {
      auth.signOut();
    },
  });

  return (
    <div className="p-[32px] border border-gray-200 rounded-[8px] mb-[24px]">
      <Text size="text-size_title1" className="font-semibold mb-[8px]">
        Delete Account
      </Text>
      <Text size="text-size_body1" color="text-gray-700" className="mb-[12px]">
        Any prompts and states in the app will be deleted and you wont be able
        to get them back. <br /> <br />
        This action can not be undone.
      </Text>
      <Button
        variant="primary_danger"
        size="md"
        className="mt-[16px] ml-auto"
        onClick={() => refetch()}
      >
        Delete Account
      </Button>
    </div>
  );
}
