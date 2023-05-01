import React from "react";
import clsx from "clsx";
import { filterOut } from "../utils/functions";

interface AvatarGroupProps extends React.HTMLProps<HTMLDivElement> {}

export default function AvatarGroup({
  className = "",
  ...rest
}: AvatarGroupProps) {
  const gapClasses = filterOut(
    className,
    ["gap-"],
    "[&>div:not(:first-child)]:ml-[calc(-0.5em)] [&>div]:shadow-[0px_0px_0px_calc(0.2em)_#fff]"
  );
  const itemsClassNames = filterOut(className, ["items-"], "items-center");
  return (
    <div
      className={clsx(
        "flex",
        "avatar-group",
        gapClasses,
        itemsClassNames,
        className
      )}
      {...rest}
    />
  );
}
