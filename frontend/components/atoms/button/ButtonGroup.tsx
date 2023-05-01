import React from "react";
import clsx from "clsx";
import { filterOut } from "../utils/functions";

interface ButtonGroupProps extends React.HTMLProps<HTMLDivElement> {}

export default function ButtonGroup({
  className = "",
  ...rest
}: ButtonGroupProps) {
  const gapClasses = filterOut(
    className,
    ["gap-"],
    "[&>button:not(:first-child)]:ml-[-1px] [&>button:not(:first-child)]:rounded-l-[0] [&>button:not(:last-child)]:rounded-r-[0]"
  );
  const itemsClassNames = filterOut(className, ["items-"], "items-center");
  return (
    <div
      className={clsx(
        "flex",
        "btn-group",
        gapClasses,
        itemsClassNames,
        className
      )}
      {...rest}
    />
  );
}
