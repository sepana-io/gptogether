import React, { InputHTMLAttributes, ReactNode } from "react";
import IconList from "../icon/icon-lib";
import clsx from "clsx";
import Icon from "../icon/Icon";
import Text from "../text/Text";
import { filterOut } from "../utils/functions";
import {
  hintSizeClass,
  iconSizeClass,
  inputSize,
  labelSizeClass,
} from "./input-size";
import { hintState, inputStates, labelState } from "./input-states";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg" | "xl";
  leftIcon?: keyof typeof IconList;
  leftElement?: ReactNode;
  rightIcon?: keyof typeof IconList;
  rightElement?: ReactNode;
  label?: string;
  labelIcon?: keyof typeof IconList;
  labelSize?: "sm" | "md" | "lg" | "xl";
  hint?: ReactNode;
  hintIcon?: keyof typeof IconList;
  hintSize?: "sm" | "md" | "lg" | "xl";
  error?: boolean;
  errorHint?: string;
  success?: boolean;
  successHint?: string;
}

export default function Input({
  size = "sm",
  className = "",
  leftIcon,
  leftElement,
  rightIcon,
  rightElement,
  label,
  labelSize,
  labelIcon,
  hint,
  hintIcon,
  hintSize,
  error,
  errorHint,
  success,
  successHint,
  disabled,
  ...rest
}: InputProps) {
  // Size
  const currentInputSize = inputSize[size];
  const currentLableSizeClass = labelSizeClass[labelSize || size];
  const currentHintSizeClass = hintSizeClass[hintSize || size];
  const currentIconSizeClass = iconSizeClass[size].className;
  // State
  const currentState = (() => {
    if (disabled) return "disabled";
    else if (success) return "success";
    else if (error) return "danger";
    else return "default";
  })();
  const currentInputTheme = inputStates[currentState];
  const currentLabelTheme = labelState[currentState];
  const currentHintTheme = hintState[currentState];
  // Classes
  const displayClass = filterOut(
    className,
    ["block", "inline", "inline-block", "flex", "table", "grid", "hidden"],
    "block"
  );
  const widthClass = filterOut(className, ["w-"], "w-full");
  // Based on State
  const focusClass = filterOut(
    className,
    ["focus-within:"],
    currentInputTheme.focusClass
  );
  const bgClass = filterOut(className, ["bg-"], currentInputTheme.bgClass);
  const borderClass = filterOut(
    className,
    ["border"],
    currentInputTheme.borderClass
  );
  const textColorClass = filterOut(
    className,
    ["text-"],
    currentInputTheme.textColorClass
  );
  const placeholderClass = filterOut(
    className,
    ["placeholder:"],
    currentInputTheme.placeholderClass
  );
  const cursorClass = filterOut(
    className,
    ["cursor-"],
    currentInputTheme.cursorClass
  );
  const shadowClass = filterOut(
    className,
    ["shadow-"],
    currentInputTheme.shadowClass
  );
  const weightClass = filterOut(className, ["font-"], "font-semibold");
  // Based on Size
  const roundedClass = filterOut(
    className,
    ["rounded"],
    currentInputSize.roundedClass
  );
  const gapClass = filterOut(className, ["gap-"], currentInputSize.gapClass);
  const heightClass = filterOut(
    className,
    ["h-"],
    currentInputSize.heightClass
  );
  const textSizeClass = filterOut(
    className,
    ["text-size_"],
    currentInputSize.textSizeClass
  );
  const paddingClass = filterOut(className, ["p-"], false);
  const paddingHorClass = filterOut(
    className,
    ["px-", "pl-", "pr-"],
    currentInputSize.paddingHorClass
  );
  const paddingVerClass = filterOut(
    className,
    ["py-", "pt-", "pb-"],
    currentInputSize.paddingVerClass
  );
  const finalPadding = paddingClass || `${paddingHorClass} ${paddingVerClass}`;
  // Remainging Class
  const combinedClass: string[] = clsx(
    focusClass,
    bgClass,
    borderClass,
    textColorClass,
    placeholderClass,
    cursorClass,
    shadowClass,
    weightClass,
    roundedClass,
    gapClass,
    heightClass,
    textColorClass,
    finalPadding
  ).split(" ");
  const remainingClass: string = className
    .split(" ")
    .filter((cls) => !combinedClass.includes(cls))
    .join(" ");

  return (
    <label
      className={clsx("antialiased", displayClass, widthClass, remainingClass)}
    >
      {label && (
        <div className={clsx("flex", currentLableSizeClass.wrapper)}>
          <Text
            className={clsx(
              "flex-grow",
              currentLabelTheme.text,
              currentLableSizeClass.text
            )}
          >
            {label}
          </Text>
          {labelIcon && (
            <Icon
              name={labelIcon as keyof typeof IconList}
              className={clsx(
                currentLabelTheme.icon,
                currentLableSizeClass.icon
              )}
            />
          )}
        </div>
      )}
      <div
        className={clsx(
          "flex transition items-center w-full",
          // Based on State
          bgClass,
          borderClass,
          cursorClass,
          shadowClass,
          textColorClass,
          focusClass,
          // Based on Size
          roundedClass,
          heightClass,
          gapClass,
          finalPadding
        )}
      >
        {leftElement}
        {leftIcon && (
          <Icon
            name={leftIcon as keyof typeof IconList}
            className={currentIconSizeClass}
          />
        )}
        <input
          disabled={disabled}
          className={clsx(
            "antialiased",
            "flex-grow bg-transparent focus:outline-none",
            weightClass,
            // Based On Theme
            placeholderClass,
            cursorClass,
            textColorClass,
            // Based On Size
            heightClass,
            textSizeClass
          )}
          {...rest}
        />
        {rightIcon && (
          <Icon
            name={rightIcon as keyof typeof IconList}
            className={currentIconSizeClass}
          />
        )}
        {rightElement}
      </div>
      {hint && (
        <div className={clsx("flex", currentHintSizeClass.wrapper)}>
          {hintIcon && (
            <Icon
              name={hintIcon as keyof typeof IconList}
              className={clsx(currentHintTheme.icon, currentHintSizeClass.icon)}
            />
          )}
          <Text
            className={clsx(
              "flex-grow",
              currentHintTheme.text,
              currentHintSizeClass.text
            )}
          >
            {hint}
          </Text>
        </div>
      )}
    </label>
  );
}
