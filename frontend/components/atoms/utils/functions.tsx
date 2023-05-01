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
