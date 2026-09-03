/**
 * Tidying the prose lifted from Wikipedia leads.
 *
 * Shared by build-longform, build-blurbs and build-stories so they cannot drift
 * apart, and by clean-text.mjs, which repairs already-generated files.
 */

/**
 * Characters that only ever appear in phonetic transcription. Deliberately
 * excludes letters that are ordinary in names and loanwords — ç (Garçon à la
 * pipe), ø (Munch), œ, ð (Viðey), å — which an earlier, greedier version
 * flagged as junk.
 */
const IPA_ONLY = /[ˈˌːʁʃʒŋɡɱɸβθðʑʐɕʂʈɖɳɭʟʀɾɽɺʙʜʢʡʘǀǁǂǃɓɗʄɠʛʝɟʇʖχʁħʕʔɰɥʍɧɫɬɮ]|[ɑɐɒɔɘɜɞɤɵɪʊʌʏɨʉøœɶəɛ]̃/;

/** A bracketed run that is a pronunciation rather than an editorial insertion. */
const IPA_BRACKET = /\s*\[[^\]]*\]/g;

/**
 * Remove parenthesised asides, counting depth so nested brackets don't end the
 * match early.
 *
 * This is the whole reason the module exists. The obvious `\([^)]*\)` stops at
 * the first `)`, and Wikipedia's pronunciation blocks nest one:
 *
 *   (French: Le Radeau de la Méduse [lə ʁado d(ə) la medyz])
 *                                            ^ naive match ends here
 *
 * which deleted the front half and left `The Raft of the Medusa la medyz])—`
 * on the page.
 */
export function stripParens(text) {
  let out = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '(') depth += 1;
    else if (ch === ')' && depth > 0) depth -= 1;
    else if (depth === 0) out += ch;
  }
  return out;
}

/**
 * Drop a bracketed span only when it is phonetic. Square brackets in these
 * articles are usually an editor clarifying a quotation — "the kind of people
 * [he] fancied", "O virgin mother [...] your merit" — and those are wanted.
 */
export function stripIpaBrackets(text) {
  return text.replace(IPA_BRACKET, (match) => (IPA_ONLY.test(match) ? '' : match));
}

/**
 * Remove closing brackets that nothing ever opened, together with the phonetic
 * run stranded in front of them.
 *
 * Written as a scan rather than a regex because the decision needs bracket
 * depth, which a regex cannot carry: `"the kind of people [he] fancied"` must
 * survive untouched while `Medusa la medyz])` must lose four words. An orphan
 * `]` means an opening `[` was destroyed upstream, so whatever sits between the
 * last sentence boundary and the bracket is the tail of that transcription.
 */
export function dropOrphanBrackets(text) {
  let out = '';
  let depth = 0;
  let pending = ''; // text accumulated since the last `[`-free boundary

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (ch === '[') {
      depth += 1;
      out += pending + ch;
      pending = '';
      continue;
    }

    if (ch === ']' && depth === 0) {
      // Orphan: an opening bracket was destroyed upstream, so the words
      // immediately before this are the tail of a transcription. Walk back by
      // whole words and drop the all-lowercase ones — stopping at the first
      // capitalised word, which is the subject's actual name. Character-wise
      // backtracking ate into it and left "The Raft of the M".
      const words = pending.split(/(\s+)/);
      while (words.length) {
        const last = words[words.length - 1];
        if (/^\s*$/.test(last)) {
          words.pop();
          continue;
        }
        // Uppercase, a digit or sentence punctuation means we've reached real
        // prose again.
        if (/^[^\p{Ll}]/u.test(last) || /[.,;:!?]$/.test(last)) break;
        words.pop();
      }
      out += words.join('');
      pending = '';
      if (text[i + 1] === ')') i += 1;
      continue;
    }

    if (ch === ']') {
      depth -= 1;
      out += pending + ch;
      pending = '';
      continue;
    }

    pending += ch;
  }

  return out + pending;
}

/**
 * Sweep up: orphan brackets, a space pushed against punctuation, doubled
 * separators, whitespace.
 */
export function tidy(text) {
  return (
    dropOrphanBrackets(text)
      // A language label whose transcription has just been removed, e.g.
      // "Georges Braque French:; 13 May 1882".
      .replace(
        /\b(?:French|Dutch|German|Italian|Spanish|Japanese|Russian|Norwegian|Polish|Portuguese|Danish|Swedish|Catalan|Flemish|Greek|Hungarian|Czech|Romanian|Finnish|Latin|Chinese|Korean)\s*:\s*(?=[;,)]|$)/g,
        '',
      )
      .replace(/\s+([,;:!?])/g, '$1')
      // A single full stop only. An ellipsis marking an omission inside a
      // quotation keeps the space in front of it: "every form ... a nut in its
      // shell" must not become "every form... a nut".
      .replace(/\s+\.(?!\.)/g, '.')
      // Two different separators left adjacent once what sat between them went,
      // e.g. "Jean-Michel Basquiat,; December 22, 1960".
      .replace(/([,;:])\s*(?=[,;:])/g, '')
      // An em dash left with a gap after the parenthetical before it went.
      .replace(/\s+—/g, '—')
      .replace(/—\s{2,}/g, '— ')
      .replace(/\(\s*[;,]\s*/g, '(')
      .replace(/\s*\(\s*\)\s*/g, ' ')
      // No rule here for orphan closing parens. One was tried and removed: its
      // guard `[^(]*?` can never contain a `(`, so it stripped unconditionally,
      // and Wikipedia prose contains genuinely unbalanced parens — "24 by 18
      // inches (61 cm × 46 cm) shows Kahlo" lost the bracket it needed.
      .replace(/\s+/g, ' ')
      .replace(/\s+([,;:!?])/g, '$1')
      .replace(/\s+\.(?!\.)/g, '.')
      .trim()
  );
}

/** Everything, for text where parenthetical asides are unwanted. */
export function cleanProse(text) {
  return tidy(stripIpaBrackets(stripParens(text)));
}

/** For text that keeps its parentheses — the per-work stories. */
export function cleanKeepingParens(text) {
  return tidy(stripIpaBrackets(text));
}
