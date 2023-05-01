import React from "react";
import clsx from "clsx";
import { isEqual } from "lodash";

import { Text, Input, Button } from "components/atoms";

interface SocialAccountFormProps {
  formik: any;
  initialValue?: any;
  className?: string;
}

export default function SocialAccountForm({
  formik,
  initialValue,
  className = "mb-[24px]",
}: SocialAccountFormProps) {
  return (
    <div
      className={clsx(
        "p-[32px] border border-gray-200 rounded-[8px]",
        className
      )}
    >
      <Text size="text-size_title1" className="font-semibold mb-[8px]">
        Social Accounts
      </Text>
      <Text size="text-size_body1" color="text-gray-700" className="mb-[32px]">
        These will let other people discover and connect with you.
      </Text>
      <Input
        size="md"
        autoComplete="off"
        label="Twitter Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("twitter_handle")}
      />
      <Input
        size="md"
        autoComplete="off"
        label="Instagram Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("instagram_handle")}
      />
      <Input
        size="md"
        autoComplete="off"
        label="Facebook Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("facebook_handle")}
      />
      <Input
        size="md"
        autoComplete="off"
        label="YouTube Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("youtube_channel")}
      />
      <Input
        size="md"
        autoComplete="off"
        label="Discord Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("discord_handle")}
      />
      <Input
        size="md"
        autoComplete="off"
        label="Telegram Handle"
        className="mb-[8px]"
        {...formik.getFieldProps("telegram_handle")}
      />
      {initialValue && (
        <Button
          type="submit"
          size="md"
          className="mt-[16px] ml-auto"
          disabled={
            isEqual(formik.values, initialValue) ||
            formik.values.openai_api_key === ""
          }
        >
          Save
        </Button>
      )}
    </div>
  );
}
