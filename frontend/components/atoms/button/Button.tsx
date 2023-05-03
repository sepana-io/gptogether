import React, { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import IconList from "../icons/icon-lib";
import { filterOut } from "../utils/functions";
import { buttonTheme } from "./button-theme";
import { buttonSize, iconSize } from "./button-size";

import Icon from "../icons/Icon";

interface CommonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "primary_info"
    | "primary_danger"
    | "primary_success"
    | "primary_warning"
    | "secondary"
    | "secondary_info"
    | "secondary_danger"
    | "secondary_success"
    | "secondary_warning"
    | "tertiary"
    | "tertiary_info"
    | "tertiary_danger"
    | "tertiary_success"
    | "tertiary_warning"
    | "quaternary"
    | "quaternary_info"
    | "quaternary_danger"
    | "quaternary_success"
    | "quaternary_warning";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

type ConditionalProps =
  | {
      icon?: keyof typeof IconList;
      iconElement?: ReactNode;
      leftIcon?: never;
      leftElement?: never;
      rightIcon?: never;
      rightElement?: never;
      iconClassName?: string;
    }
  | {
      icon?: never;
      iconElement?: never;
      leftIcon?: keyof typeof IconList;
      leftElement?: ReactNode;
      rightIcon?: keyof typeof IconList;
      rightElement?: ReactNode;
      iconClassName?: string;
    };

type ButtonProps = CommonProps & ConditionalProps;

export default function Button({
  variant = "primary",
  size = "xs",
  icon,
  iconElement,
  leftIcon,
  leftElement,
  rightIcon,
  rightElement,
  className = "",
  iconClassName = "",
  children,
  ...rest
}: ButtonProps) {
  const currentButtonTheme = buttonTheme[variant];
  const currentButtonSize = buttonSize[size];
  const currentIconSize = iconSize[size];
  // ----
  const hoverClass = filterOut(
    className,
    ["hover:"],
    currentButtonTheme.hoverClass
  );
  const focusClass = filterOut(
    className,
    ["focus:"],
    currentButtonTheme.focusClass
  );
  const disabledClass = filterOut(
    className,
    ["disabled:"],
    currentButtonTheme.disabledClass
  );
  const combinedPsedoClassArray: string[] = clsx(
    hoverClass,
    focusClass,
    disabledClass
  ).split(" ");
  const classMinusPsedo: string = className
    .split(" ")
    .filter((cls) => !combinedPsedoClassArray.includes(cls))
    .join(" ");
  //  ---
  const displayClass = filterOut(
    classMinusPsedo,
    ["block", "inline", "inline-block", "flex", "table", "grid", "hidden"],
    "flex"
  );
  const alignItemsClass = filterOut(
    classMinusPsedo,
    ["items-"],
    "items-center"
  );
  const justifyItemClass = filterOut(
    classMinusPsedo,
    ["items-"],
    "justify-center"
  );
  const transitionClass = filterOut(
    classMinusPsedo,
    ["transition"],
    "transition"
  );
  const durationClass = filterOut(
    classMinusPsedo,
    ["duration-"],
    "duration-300"
  );
  // ----
  const weightClass = filterOut(classMinusPsedo, ["font-"], "font-semibold");
  const bgClass = filterOut(
    classMinusPsedo,
    ["bg-"],
    currentButtonTheme.bgClass
  );
  const borderClass = filterOut(
    classMinusPsedo,
    ["border"],
    currentButtonTheme.borderClass
  );
  const textColorClass = filterOut(
    classMinusPsedo,
    ["text-"],
    currentButtonTheme.textColorClass
  );
  const shadowClass = filterOut(
    classMinusPsedo,
    ["shadow-"],
    currentButtonTheme.shadowClass
  );
  // ----
  const roundedClass = filterOut(
    classMinusPsedo,
    ["rounded"],
    currentButtonSize.roundedClass
  );
  const textSizeClass = filterOut(
    classMinusPsedo,
    ["text-size_"],
    currentButtonSize.textSizeClass
  );
  const gapClass = filterOut(
    classMinusPsedo,
    ["gap-"],
    currentButtonSize.gapClass
  );
  const paddingClass = filterOut(classMinusPsedo, ["p-"], false);
  const paddingHorClass = filterOut(
    classMinusPsedo,
    ["px-", "pl-", "pr-"],
    currentButtonSize?.paddingHorClass
  );
  const paddingVerClass = filterOut(
    classMinusPsedo,
    ["py-", "pt-", "pb-"],
    currentButtonSize?.paddingVerClass
  );
  const finalPadding =
    paddingClass ||
    (icon || iconElement
      ? currentButtonSize.iconButtonPadding
      : `${paddingHorClass} ${paddingVerClass}`);
  // ----
  const iconWidthClass = filterOut(
    iconClassName,
    ["w-"],
    currentIconSize.widthClass
  );
  const iconHeightClass = filterOut(
    iconClassName,
    ["w-"],
    currentIconSize.heightClass
  );

  return (
    <button
      className={clsx(
        ...combinedPsedoClassArray,
        "antialiased",
        displayClass,
        alignItemsClass,
        justifyItemClass,
        transitionClass,
        durationClass,
        //  Theme
        weightClass,
        bgClass,
        borderClass,
        textColorClass,
        shadowClass,
        // Size
        finalPadding,
        roundedClass,
        textSizeClass,
        gapClass,
        className
      )}
      {...rest}
    >
      {iconElement ? (
        iconElement
      ) : (
        <>
          {icon ? (
            <Icon
              name={icon as keyof typeof IconList}
              className={clsx(iconWidthClass, iconHeightClass, iconClassName)}
            />
          ) : (
            <>
              {leftElement ||
                (leftIcon && (
                  <Icon
                    name={leftIcon as keyof typeof IconList}
                    className={clsx(
                      iconWidthClass,
                      iconHeightClass,
                      iconClassName
                    )}
                  />
                ))}
              {children}
              {rightElement ||
                (rightIcon && (
                  <Icon
                    name={rightIcon as keyof typeof IconList}
                    className={clsx(
                      iconWidthClass,
                      iconHeightClass,
                      iconClassName
                    )}
                  />
                ))}
            </>
          )}
        </>
      )}
    </button>
  );
}
