import React from "react";
import clsx from "clsx";
import { filterOut } from "../utils/functions";

interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  size?:
    | "text-size_overline"
    | "text-size_caption2"
    | "text-size_caption1"
    | "text-size_body2"
    | "text-size_body1"
    | "text-size_title2"
    | "text-size_title1"
    | "text-size_heading6"
    | "text-size_heading5"
    | "text-size_heading4"
    | "text-size_heading3"
    | "text-size_heading2"
    | "text-size_heading1"
    | "text-size_heading6"
    | "text-size_display3"
    | "text-size_display2"
    | "text-size_display1";
  color?:
    | "text-gray-900"
    | "text-gray-700"
    | "text-gray-500"
    | "text-gray-100"
    | "text-neutral_white";
  tag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
  weight?: "font-medium" | "font-semibold" | "font-bold";
}

export default function Text({
  size,
  color,
  weight,
  className = "",
  tag = "p",
  ...rest
}: TextProps) {
  const textColorClass = filterOut(className, ["text-"], color || false);
  const textSizeClasses = filterOut(className, ["text-size_"], size || false);
  const weightClasses = filterOut(className, ["font-"], weight || false);

  const Tag = tag;

  return (
    <Tag
      className={clsx(
        "antialiased",
        textSizeClasses,
        textColorClass,
        weightClasses,
        className
      )}
      {...rest}
    />
  );
}
