import React, { HTMLAttributes } from "react";
import IconList from "../icons/icon-lib";
import clsx from "clsx";
import { filterOut } from "../utils/functions";
import { avatarTheme } from "./avatar-theme";
import {
  avatarSize,
  iconSize,
  statusSize,
  verifiedCheckSize,
} from "./avatar-size";
import Image from "next/image";

import Icon from "../icons/Icon";

interface CommonProps extends HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  shape?: "rounded" | "square";
  className?: string;
}

type ConditionalProps =
  | {
      type?: "image";
      imageUrl: string;
      text?: never;
      icon?: never;
    }
  | {
      type?: "text";
      imageUrl?: never;
      text: string;
      icon?: never;
    }
  | {
      type?: "icon";
      imageUrl?: never;
      text?: never;
      icon?: keyof typeof IconList;
    };

type VerifiedOrStatusConditionalProps =
  | { status?: boolean; verified?: never }
  | { status?: never; verified?: boolean };

type AvatarProps = CommonProps &
  ConditionalProps &
  VerifiedOrStatusConditionalProps;

export default function Avatar({
  type = "icon",
  size = "md",
  shape = "rounded",
  status = false,
  verified = false,
  imageUrl = "",
  text,
  icon = "HiUser",
  className = "",
  ...rest
}: AvatarProps) {
  const currentAvatarTheme = avatarTheme[type];
  const currentAvatarSize = avatarSize[size];
  // --
  const hoverClass = filterOut(className, ["hover:"], false);
  const focusClass = filterOut(
    className,
    ["focus:"],
    "focus:shadow-outline-focus_primary focus-visible:outline-none"
  );
  const disabledClass = filterOut(className, ["disabled:"], false);
  const combinedPsedoClassArray: string[] = clsx(
    hoverClass,
    focusClass,
    disabledClass
  ).split(" ");
  const classMinusPsedo: string = className
    .split(" ")
    .filter((cls) => !combinedPsedoClassArray.includes(cls))
    .join(" ");
  // --
  const displayClass = filterOut(
    classMinusPsedo,
    ["block", "inline", "inline-block", "flex", "table", "grid", "hidden"],
    "flex"
  );
  const transitionClass = filterOut(
    classMinusPsedo,
    ["transition"],
    "transition"
  );

  const weightClass = filterOut(classMinusPsedo, ["font-"], "font-semibold");
  // --
  const textColorClass = filterOut(
    classMinusPsedo,
    ["text-"],
    currentAvatarTheme.textColorClass
  );
  const bgClass = filterOut(
    classMinusPsedo,
    ["bg-"],
    currentAvatarTheme.bgClass
  );
  // --
  const heightClass = filterOut(
    classMinusPsedo,
    ["h-"],
    currentAvatarSize.heightClass
  );
  const widthClass = filterOut(
    classMinusPsedo,
    ["w-"],
    currentAvatarSize.widthClass
  );
  const textSizeClass = filterOut(
    classMinusPsedo,
    ["text-size"],
    currentAvatarSize.textSizeClass
  );
  const roundedClass = filterOut(
    classMinusPsedo,
    ["rounded-"],
    shape === "rounded" ? "rounded-full" : currentAvatarSize.roundedClass
  );
  // --
  const iconSizeClass: string = iconSize[size].class;
  // --
  const statusClass: string = statusSize[size].class;
  // --
  const verifyClass: string = verifiedCheckSize[size].class;

  return (
    <div
      className={clsx(
        displayClass,
        "antialiased relative items-center justify-center overflow-hidden",
        combinedPsedoClassArray,
        transitionClass,
        weightClass,
        // --
        bgClass,
        textColorClass,
        // --
        heightClass,
        widthClass,
        textSizeClass,
        roundedClass,
        // --
        className
      )}
      {...rest}
    >
      {type === "image" && <Image src={imageUrl} alt="profile-image" fill />}
      {type === "icon" && <Icon name={icon} className={iconSizeClass} />}
      {type === "text" && text}
      {status && (
        <svg
          className={clsx(
            statusClass,
            "absolute shadow-e2 rounded-full z-[1]",
            shape === "rounded" && "bottom-[0] right-[0]",
            shape === "square" && "bottom-[-2px] right-[-2px]"
          )}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 9C2 5.13401 5.13401 2 9 2V2C12.866 2 16 5.13401 16 9V9C16 12.866 12.866 16 9 16V16C5.13401 16 2 12.866 2 9V9Z"
            fill="#0BAA60"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.5 9C0.5 4.30558 4.30558 0.5 9 0.5C13.6944 0.5 17.5 4.30558 17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9ZM9 3.5C5.96243 3.5 3.5 5.96243 3.5 9C3.5 12.0376 5.96243 14.5 9 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9 3.5Z"
            fill="white"
          />
        </svg>
      )}
      {status && (
        <svg
          className={clsx(
            statusClass,
            "absolute shadow-e2 rounded-full z-[1]",
            shape === "rounded" && "bottom-[0] right-[0]",
            shape === "square" && "bottom-[-2px] right-[-2px]"
          )}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 9C2 5.13401 5.13401 2 9 2V2C12.866 2 16 5.13401 16 9V9C16 12.866 12.866 16 9 16V16C5.13401 16 2 12.866 2 9V9Z"
            fill="#0BAA60"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.5 9C0.5 4.30558 4.30558 0.5 9 0.5C13.6944 0.5 17.5 4.30558 17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9ZM9 3.5C5.96243 3.5 3.5 5.96243 3.5 9C3.5 12.0376 5.96243 14.5 9 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9 3.5Z"
            fill="white"
          />
        </svg>
      )}
      {verified && (
        <>
          <svg
            className={clsx(
              verifyClass,
              "absolute z-[2]",
              shape === "rounded" && "bottom-[0] right-[0]",
              shape === "square" && "bottom-[-2px] right-[-2px]"
            )}
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5486 0.905725L13.6528 1.11381L14.439 3.20462C14.5008 3.36927 14.6307 3.49919 14.7954 3.56096L16.814 4.31829C17.6999 4.65063 18.1759 5.59722 17.9399 6.49282L17.8831 6.67107L16.9439 8.74803C16.8712 8.90813 16.8712 9.09187 16.9439 9.25197L17.8358 11.2149C18.2272 12.0763 17.8945 13.0822 17.0943 13.5486L16.8862 13.6528L14.7954 14.439C14.6307 14.5008 14.5008 14.6307 14.439 14.7954L13.6817 16.814C13.3494 17.6999 12.4028 18.1759 11.5072 17.9399L11.3289 17.8831L9.25197 16.9439C9.09187 16.8712 8.90813 16.8712 8.74803 16.9439L6.78511 17.8358C5.92372 18.2272 4.91778 17.8945 4.45141 17.0943L4.34718 16.8862L3.56096 14.7954C3.49919 14.6307 3.36927 14.5008 3.20462 14.439L1.18597 13.6817C0.300118 13.3494 -0.17591 12.4028 0.0601429 11.5072L0.116938 11.3289L1.05606 9.25197C1.12881 9.09187 1.12881 8.90813 1.05606 8.74803L0.164176 6.78511C-0.227213 5.92372 0.105523 4.91778 0.905725 4.45141L1.11381 4.34718L3.20462 3.56096C3.36927 3.49919 3.49919 3.36927 3.56096 3.20462L4.31829 1.18597C4.65063 0.300118 5.59722 -0.17591 6.49282 0.0601429L6.67107 0.116938L8.74803 1.05606C8.90813 1.12881 9.09187 1.12881 9.25197 1.05606L11.2149 0.164176C12.0763 -0.227213 13.0822 0.105523 13.5486 0.905725Z"
              fill="#1C92FF"
            />
            <path
              d="M7.60196 10.8376L11.9468 5.87208C12.1683 5.61891 12.5532 5.59326 12.8063 5.81478C13.0595 6.0363 13.0852 6.42112 12.8636 6.67429L8.09003 12.1298C7.85801 12.395 7.45007 12.4086 7.20092 12.1594L5.15509 10.1136C4.91722 9.87574 4.91722 9.49007 5.15509 9.25219C5.39296 9.01432 5.77863 9.01432 6.01651 9.25219L7.60196 10.8376Z"
              fill="white"
            />
          </svg>
          <div
            className={clsx(
              statusClass,
              "absolute shadow-e2 rounded-full z-[1]",
              shape === "rounded" && "bottom-[2px] right-[2px]",
              shape === "square" && "bottom-[0] right-[0]"
            )}
          />
        </>
      )}
    </div>
  );
}
