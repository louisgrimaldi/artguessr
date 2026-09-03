/**
 * Nationality → flag emoji, shown in place of the word on artist cards.
 *
 * Hyphenated nationalities yield both flags ("Russian-French" → 🇷🇺🇫🇷).
 * Two entries are historical rather than modern states: Netherlandish covers the
 * Low Countries before the Dutch/Belgian split, and Flemish the southern part
 * that became Belgium.
 */
const FLAGS: Record<string, string> = {
  American: '🇺🇸',
  Austrian: '🇦🇹',
  Belgian: '🇧🇪',
  British: '🇬🇧',
  Canadian: '🇨🇦',
  Chinese: '🇨🇳',
  Danish: '🇩🇰',
  Dutch: '🇳🇱',
  Flemish: '🇧🇪',
  French: '🇫🇷',
  German: '🇩🇪',
  Ghanaian: '🇬🇭',
  Greek: '🇬🇷',
  Icelandic: '🇮🇸',
  Indian: '🇮🇳',
  Italian: '🇮🇹',
  Japanese: '🇯🇵',
  Mexican: '🇲🇽',
  Netherlandish: '🇳🇱',
  Norwegian: '🇳🇴',
  Polish: '🇵🇱',
  Romanian: '🇷🇴',
  Russian: '🇷🇺',
  Serbian: '🇷🇸',
  Spanish: '🇪🇸',
  Swedish: '🇸🇪',
  Swiss: '🇨🇭',
  Ukrainian: '🇺🇦',
};

/** Flag emoji for a nationality string, or '' if none is known. */
export function flagFor(nationality: string): string {
  return nationality
    .split('-')
    .map((part) => FLAGS[part.trim()] ?? '')
    .join('');
}
