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
  const now = moment();
  const inputDate = moment(
    new Date(time.seconds * 1000 + time.nanoseconds / 1000000)
  );
  const diffMinutes = now.diff(inputDate, "minutes");

  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return diffMinutes + " minutes ago";
  } else if (diffMinutes < 1440) {
    // 1440 minutes in a day
    return inputDate.fromNow();
  } else if (diffMinutes < 10080) {
    // 10080 minutes in a week
    return inputDate.calendar(now, {
      sameDay: "[Today]",
      nextDay: "[Tomorrow]",
      nextWeek: "dddd",
      lastDay: "[Yesterday]",
      lastWeek: "[Last] dddd",
    });
  } else {
    return inputDate.format("ll");
  }
};
