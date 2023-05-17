import moment from "moment";

/**
 *
 * @param className Filter From
 * @param filterArray What to filter out
 * @param defaultReturn Default value if no element found
 * @returns
 */
export const filterOut = (
  className: string,
  filterArray: string[],
  defaultReturn: string | boolean
): string | boolean => {
  const classArray: string[] = className.split(" ");
  const filteredClassNames: string[] = classArray.filter(
    (classString: string) =>
      filterArray.some((substring: string) => classString.startsWith(substring))
  );
  return filteredClassNames.length
    ? filteredClassNames.join(" ")
    : defaultReturn;
};

/**
 * Get Date Time
 * @param time
 * @returns string
 */
export const getDate = (time: any) => {
  const timeVal = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
  if (moment(timeVal).startOf("day").fromNow() === "12 hours ago") {
    return moment(timeVal).format("LT");
  } else {
    return moment(timeVal).startOf("day").fromNow();
  }
};
