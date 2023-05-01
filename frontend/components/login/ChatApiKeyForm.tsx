import React, { useState } from "react";
import { isEqual } from "lodash";

import { Text, Input, Button, Icon } from "components/atoms";

interface ChatApiKeyFormProps {
  formik: any;
  initialValue?: any;
}

export default function ChatApiKeyForm({
  formik,
  initialValue,
}: ChatApiKeyFormProps) {
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  return (
    <div className="p-[32px] border border-gray-200 rounded-[8px] mb-[24px]">
      <Text size="text-size_title1" className="font-semibold mb-[8px]">
        ChatGPT API Key
      </Text>
      <Text size="text-size_body1" color="text-gray-700" className="mb-[12px]">
        This will be required to let you use chat GPT
      </Text>
      <Input
        size="md"
        placeholder="Enter API Key"
        autoComplete="off"
        type={showApiKey ? "text" : "password"}
        error={
          !!(formik.touched.openai_api_key && formik.errors.openai_api_key)
        }
        rightElement={
          <button type="button" onClick={() => setShowApiKey((prev) => !prev)}>
            <Icon
              name={showApiKey ? "HiOutlineEyeOff" : "HiOutlineEye"}
              size={20}
            />
          </button>
        }
        hint={
          <>
            You can get this key from{" "}
            <a
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
            >
              <Text tag="span" className="text-primary-500 underline">
                OpenAI settings
              </Text>
            </a>
            .{" "}
            {formik.touched.openai_api_key && formik.errors.openai_api_key && (
              <Text tag="span" className="text-danger-500">
                {formik.errors.openai_api_key}
              </Text>
            )}
          </>
        }
        hintIcon="HiInformationCircle"
        {...formik.getFieldProps("openai_api_key")}
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
          Update Key
        </Button>
      )}
    </div>
  );
}
