import React from "react";
import _ from "lodash";
import { useMutation, useQuery } from "react-query";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useFormik } from "formik";
import { useAuth } from "contexts/UserContext";
import { usePublic } from "hooks/usePublic";
import { useUser } from "hooks/useUser";

import { Icon, Spinner, Text } from "components/atoms";
import Sidebar from "components/common/Sidebar";
import UserDetailHeader from "components/login/UserDetailHeader";
import ChatApiKeyForm from "components/login/ChatApiKeyForm";
import SocialAccountForm from "components/login/SocialAccountForm";
import DeleteAccount from "components/login/DeleteAccount";
import LocationForm from "components/login/LocationForm";

type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({ props: { host: context.req.headers.host || null } });

export default function ProfilePage({ host }: Props) {
  const { decryptKey } = usePublic();
  const { userDetails } = useAuth();
  const { updateUserInfo } = useUser();
  const { mutate, isError, error, isLoading } = useMutation<any>(
    updateUserInfo,
    {
      onSuccess: () => {
        window.location.reload();
      },
      onError: (error: any) => {
        chatApiKeyformik.setFieldError(
          "openai_api_key",
          _.get(error, "response.data.detail")
        );
      },
    }
  );

  const { data: decryptedKey, isLoading: decryptedKeyLoading } = useQuery(
    ["decryptedKey", userDetails?.openai_api_key],
    () => decryptKey(userDetails?.openai_api_key),
    { enabled: userDetails?.openai_api_key !== "" }
  );

  /**
   * Onsubmit for both the forms
   */
  const onSubmit = (values: any) => {
    return mutate(values);
  };

  /**
   * Chat Api Key formik
   */
  const chatApiKeyInitialValue = {
    openai_api_key: decryptedKey?.key || "",
  };
  const chatApiKeyformik = useFormik({
    initialValues: chatApiKeyInitialValue,
    enableReinitialize: true,
    onSubmit,
    validate: (values: any) => {
      let errors: any = {};
      if (!values.openai_api_key) {
        errors.openai_api_key = "This key is required";
      }
      return errors;
    },
  });

  /**
   * Social Account Formik
   */
  const socialAccountAndLocationFormikInitialValue = {
    twitter_handle: _.get(userDetails, "location.twitter_handle", ""),
    instagram_handle: _.get(userDetails, "location.instagram_handle", ""),
    facebook_handle: _.get(userDetails, "location.facebook_handle", ""),
    youtube_channel: _.get(userDetails, "location.youtube_channel", ""),
    discord_handle: _.get(userDetails, "location.discord_handle", ""),
    telegram_handle: _.get(userDetails, "location.telegram_handle", ""),
    location: {
      longitude: _.get(userDetails, "longitude", "-90"),
      latitude: _.get(userDetails, "latitude", "42"),
    },
  };
  console.log([
    _.get(userDetails, "longitude", "-90"),
    _.get(userDetails, "latitude", "42"),
  ]);
  const socialAccountAndLocationFormik = useFormik({
    initialValues: socialAccountAndLocationFormikInitialValue,
    onSubmit,
  });

  if (decryptedKeyLoading) {
    return (
      <div className="h-screen flex-grow pt-[40px] pb-[80px] flex items-center justify-center text-gray-700">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow h-screen relative overflow-scroll">
        <div className="px-[56px] py-[24px] border-b border-gray-75">
          <Text size="text-size_heading5" className="font-semibold">
            Profile
          </Text>
        </div>
        <div className="w-full max-w-[552px] mx-auto py-[72px]">
          <UserDetailHeader user={userDetails} />
          <div className="p-[32px] border border-gray-200 rounded-[8px] mb-[24px]">
            <Text size="text-size_title1" className="font-semibold mb-[16px]">
              About you
            </Text>
            {userDetails?.interests && (
              <>
                <Text
                  size="text-size_caption1"
                  color="text-gray-700"
                  className="mb-[4px]"
                  weight="font-semibold"
                >
                  Your Description (based on your prompts)
                </Text>
                <Text
                  size="text-size_body2"
                  color="text-gray-900"
                  className="font-semibold mb-[16px]"
                >
                  {userDetails?.interests}
                </Text>
              </>
            )}
            <Text
              size="text-size_caption1"
              color="text-gray-700"
              className="mb-[4px]"
              weight="font-semibold"
            >
              Your prompts url
            </Text>
            <Link href={`/profile/${userDetails?.user_id}`} target="_blank">
              <div className="bg-gray-50 rounded-[8px] px-[12px] py-[8px] flex items-center shadow-e2 border border-gray-100">
                <Text
                  size="text-size_body2"
                  color="text-gray-900"
                  className="font-semibold flex-grow truncate"
                >
                  {`${host}/profile/${userDetails?.user_id}`}
                </Text>

                <Icon
                  name="HiOutlineArrowUp"
                  size={16}
                  className="transform rotate-45"
                />
              </div>
            </Link>
          </div>
          <form onSubmit={chatApiKeyformik.handleSubmit}>
            <ChatApiKeyForm
              formik={chatApiKeyformik}
              initialValue={chatApiKeyInitialValue}
            />
          </form>
          <form onSubmit={socialAccountAndLocationFormik.handleSubmit}>
            <SocialAccountForm
              formik={socialAccountAndLocationFormik}
              initialValue={socialAccountAndLocationFormikInitialValue}
            />
          </form>
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}
