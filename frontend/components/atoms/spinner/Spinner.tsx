import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { filterOut } from "../utils/functions";
import { spinnerSize, strokeWidth } from "./spinner-size";

interface SpinnerProps extends HTMLAttributes<HTMLInputElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  duration?: string;
}

export default function Spinner({
  size = "md",
  className = "",
  duration = "0.5s",
}: SpinnerProps) {
  const currentSpinnerSize = spinnerSize[size];
  const currentStrokeWidth = strokeWidth[size];
  const widthClass = filterOut(
    className,
    ["w-"],
    currentSpinnerSize.widthClass
  );
  const heightClass = filterOut(
    className,
    ["h-"],
    currentSpinnerSize.heightClass
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="38"
      viewBox="0 0 38 38"
      className={clsx(widthClass, heightClass, className)}
    >
      <defs>
        <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
          <stop stopColor="currentColor" stopOpacity="0" offset="0%" />
          <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%" />
          <stop stopColor="currentColor" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)">
          <path
            d="M36 18c0-9.94-8.06-18-18-18"
            id="Oval-2"
            stroke="url(#a)"
            strokeWidth={currentStrokeWidth}
            style={{ strokeWidth: currentStrokeWidth }}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur={duration}
              repeatCount="indefinite"
            />
          </path>
          <circle fill="currentColor" cx="36" cy="18" r="1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur={duration}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}
