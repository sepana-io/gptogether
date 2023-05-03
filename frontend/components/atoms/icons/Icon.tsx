import React from "react";
import IconList from "./icon-lib";

interface IconProps {
  name: keyof typeof IconList;
  size?: number;
  className?: string;
  style?: object;
}

export default function Icon({ name, size = 24, ...rest }: IconProps) {
  const IconComponent = IconList[name];
  return <IconComponent size={size} {...rest} />;
}
