import React, { InputHTMLAttributes } from "react";
import Text from "../text/Text";
import clsx from "clsx";
import { filterOut } from "../utils/functions";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md";
  label?: string;
  caption?: string;
  indeterminate?: boolean;
}

export default function Radio({
  size = "md",
  label,
  caption,
  className = "",
  checked,
  disabled,
  indeterminate,
  ...rest
}: RadioProps) {
  /**
   * Property classes
   */
  const displayClasses = filterOut(
    className,
    ["block", "inline", "inline-block", "flex", "table", "grid", "hidden"],
    "flex"
  );
  const gapClasses = filterOut(className, ["gap-"], "gap-[12px]");

  return (
    <label
      className={clsx(
        className,
        displayClasses,
        gapClasses,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        "[&>input:indeterminate~.radio>div]:bg-primary-300 [&>input:indeterminate~.radio>div]:border-none [&>input:indeterminate~.radio>div>.indeterminate-icon]:block [&>input:indeterminate~.radio>div>.radio-tick]:hidden", // Indetmiate State
        "[&>input:checked~.radio>div]:bg-primary-500 [&>input:checked~.radio>div]:border-none [&>input:checked~.radio>div>.radio-tick]:block", // Checked state
        "[&>input:focus~.radio>div]:shadow-outline-focus_gray [&>input:focus:checked~.radio>div]:shadow-outline-focus_primary [&>input:focus:indeterminate~.radio>div]:shadow-outline-focus_primary", // Focus state
        "[&>input:hover~.radio>div]:border-primary-200", // Focus state
        `[&>input[type="radio"]:disabled:checked~.radio>div]:bg-gray-400 [&>input[type="radio"]:disabled~.radio>div]:border-gray-400 [&>input[type="radio"]:disabled:indeterminate~.radio>div]:bg-gray-400` // Disabled
      )}
    >
      <input
        ref={(input) => {
          if (input) {
            indeterminate && (input.indeterminate = true);
            !indeterminate && (input.indeterminate = false);
          }
        }}
        type="radio"
        className="h-0 w-0 absolute opacity-0 pointer-events-none"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <div
        className={clsx(
          "radio",
          size === "sm" && "p-[2px]",
          size === "md" && "p-[3px]",
          !disabled && "text-neutral_white",
          disabled && indeterminate && "text-gray-700",
          disabled && !indeterminate && "text-gray-500"
        )}
      >
        <div
          className={clsx(
            size === "sm" && "h-[16px] w-[16px] min-w-[16px]",
            size === "md" && "h-[18px] w-[18px] min-w-[18px]",
            "border-2 border-gray-500 flex items-center justify-center",
            "rounded-full",
            "transition"
          )}
        >
          <svg
            className="indeterminate-icon hidden w-full h-full"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <rect x="4" y="7" width="8" height="2" fill="currentColor" />
          </svg>
          {/* <svg
            className="radio-tick hidden w-full h-full"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M12.813 5.914L6.743 11.985L3.5 8.742L4.914 7.328L6.743 9.157L11.399 4.5L12.813 5.914Z"
              fill="currentColor"
            />
          </svg> */}
          <div
            className={clsx(
              "radio-tick",
              size === "sm" && "h-[6px] w-[6px] min-w-[6px]",
              size === "md" && "h-[8px] w-[8px] min-w-[8px]",
              "bg-neutral_white rounded-full"
            )}
          />
        </div>
      </div>
      {(label || caption) && (
        <div className="flex flex-col gap-[2px] justify-center flex-grow">
          {label && (
            <Text
              className={clsx(
                "font-semibold",
                size === "sm" && "text-size_caption1",
                size === "md" && "text-size_body2",
                disabled && indeterminate && "text-gray-700",
                disabled && !indeterminate && "text-gray-500"
              )}
            >
              {label}
            </Text>
          )}
          {caption && (
            <Text
              size="text-size_caption1"
              color={disabled ? "text-gray-500" : "text-gray-700"}
            >
              {caption}
            </Text>
          )}
        </div>
      )}
    </label>
  );
}
