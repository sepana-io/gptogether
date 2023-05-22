import React from "react";
import _ from "lodash";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { useUser } from "hooks/useUser";
import { useAuth } from "contexts/UserContext";

import { Button, Spinner, Text } from "components/atoms";
import UserDetailHeader from "./UserDetailHeader";
import ChatApiKeyForm from "./ChatApiKeyForm";
import SocialAccountForm from "./SocialAccountForm";

const initialValues = {
  openai_api_key: "",
  twitter_handle: "",
  instagram_handle: "",
  facebook_handle: "",
  youtube_channel: "",
  discord_handle: "",
  telegram_handle: "",
  location: {
    latitude: "-90",
    longitude: "42",
  },
};

const validate = (values: any) => {
  let errors: any = {};
  if (!values.openai_api_key) {
    errors.openai_api_key = "This key is required";
  }
  return errors;
};

export default function Onboarding() {
  const { user, userDetails } = useAuth();
  const { onboardUser } = useUser();
  const { mutate, isError, error, isLoading } = useMutation<any>(onboardUser, {
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      formik.setFieldError(
        "openai_api_key",
        _.get(error, "response.data.detail")
      );
    },
  });

  const onSubmit = (values: any) => {
    mutate(values);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validate,
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="w-full max-w-[552px] mx-auto py-[72px]"
    >
      <UserDetailHeader
        user={{
          name: user?.displayName,
          email: user?.email,
          image_url: user?.photoURL,
        }}
      />
      <ChatApiKeyForm formik={formik} />
      <SocialAccountForm
        formik={formik}
        initialValue={initialValues}
        className="mb-[80px]"
      />
      <div className="fixed bottom-[0] left-[0] right-[0] py-[16px] z-10 bg-neutral_white border-t border-gray-75">
        <div className="max-w-[552px] mx-auto">
          {isError && (error as any).message && (
            <Text
              size="text-size_body2"
              weight="font-medium"
              className="text-danger-500 mb-[4px]"
            >
              {(error as any).message}
            </Text>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Spinner size="xs" />}
            Get Started
          </Button>
        </div>
      </div>
    </form>
  );
}
