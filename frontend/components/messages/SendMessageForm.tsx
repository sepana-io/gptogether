import React, { useState } from "react";
import _ from "lodash";

import { Button, Input, Spinner } from "components/atoms";
import { useFirebase } from "hooks/useFirebase";
import { useFormik } from "formik";

const validate = (values: any) => {
  let errors: any = {};
  if (!values.message) {
    errors.message = "This key is required";
  }
  return errors;
};

interface SendMessageFormProps {
  sendToUser: any;
  onSuccess?: () => void;
  className?: string;
  type: "verical" | "horizontal";
}

export default function SendMessageForm({
  sendToUser,
  onSuccess,
  className,
  type,
}: SendMessageFormProps) {
  const { continueConversation } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Forms
   */
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await continueConversation(sendToUser, values.message);
      setIsLoading(false);
      formik.values.message = "";
      onSuccess && onSuccess();
    } catch (error) {
      formik.setFieldError("message", _.get(error, "response.data.detail"));
      setIsLoading(false);
    }
  };
  const formik = useFormik({
    initialValues: {
      message: "",
    },
    onSubmit,
    validate,
  });

  return (
    <form onSubmit={formik.handleSubmit} className={className}>
      <Input
        size="md"
        autoComplete="off"
        placeholder="Type your message"
        {...formik.getFieldProps("message")}
        error={!!(formik.touched.message && formik.errors.message)}
      />
      {type === "horizontal" ? (
        <Button
          type="submit"
          size="md"
          icon="HiReply"
          variant="secondary"
          iconElement={isLoading && <Spinner size="xs" />}
          disabled={formik.values.message === "" || isLoading}
        />
      ) : (
        <Button
          type="submit"
          size="md"
          className="w-full"
          leftElement={isLoading && <Spinner size="xs" />}
          disabled={formik.values.message === "" || isLoading}
        >
          Send
        </Button>
      )}
    </form>
  );
}
