/**
 * Turn a movement's exact year range into a century phrase.
 *
 * Precise dates ("1924–1950") are noise when you're trying to place a movement
 * in history; "beginning to middle of the 20th century" is what actually sticks.
 */

const ordinal = (n: number): string => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix}`;
};

/**
 * Century by the "1400s = 15th century" convention, not the strict one where
 * 1400 belongs to the 14th. Strict counting reads as pedantic on exactly the
 * round numbers movement ranges like to start on — it filed Early Renaissance
 * (1400–1490) under the 14th century and Baroque (1600–1750) under the 16th.
 */
const centuryOf = (year: number): number => Math.floor(year / 100) + 1;

/** Which third of its century a year falls in: 0 beginning, 1 middle, 2 end. */
function third(year: number): 0 | 1 | 2 {
  const within = year % 100; // 0..99
  if (within <= 32) return 0;
  if (within <= 65) return 1;
  return 2;
}

const THIRD_NAMES = ['beginning', 'middle', 'end'] as const;

/**
 * A closing year on a century boundary means "up to then": Ukiyo-e's
 * "1660–1900" ran through the 19th century, it didn't reach into the 20th.
 */
function endParts(year: number): { century: number; third: 0 | 1 | 2 } {
  if (year % 100 === 0) return { century: Math.floor(year / 100), third: 2 };
  return { century: centuryOf(year), third: third(year) };
}

/**
 * @param years e.g. "1490–1527", "1965–present"
 * @returns e.g. "end of the 15th to beginning of the 16th century"
 */
export function eraLabel(years: string): string {
  const found = years.match(/\d{3,4}/g);
  if (!found || found.length === 0) return years;

  const start = Number(found[0]);
  const startCentury = centuryOf(start);
  const startThird = third(start);

  if (/present/i.test(years)) {
    return `${THIRD_NAMES[startThird]} of the ${ordinal(startCentury)} century to present`;
  }

  const end = endParts(Number(found[1] ?? found[0]));

  if (startCentury !== end.century) {
    // Adjacent centuries keep their positions — a movement running 1490–1527 is
    // really a turn-of-the-century affair, and that's worth saying.
    if (end.century - startCentury === 1) {
      return `${THIRD_NAMES[startThird]} of the ${ordinal(startCentury)} to ${THIRD_NAMES[end.third]} of the ${ordinal(end.century)} century`;
    }
    return `${ordinal(startCentury)} to ${ordinal(end.century)} century`;
  }

  // Within a single century.
  if (startThird === 0 && end.third === 2) return `the ${ordinal(startCentury)} century`;
  if (startThird === end.third) return `${THIRD_NAMES[startThird]} of the ${ordinal(startCentury)} century`;
  return `${THIRD_NAMES[startThird]} to ${THIRD_NAMES[end.third]} of the ${ordinal(startCentury)} century`;
}
