// "Did you mean gmail.com?" under the sign-up email. A hint only: it never blocks, since some real domains look like
// typos. Real look-alike domains are in the list, so they are never "corrected". Copied from system-design-learn.
const COMMON = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'ymail.com', 'outlook.com', 'hotmail.com', 'live.com',
  'msn.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com', 'aol.com', 'gmx.com', 'zoho.com',
  'rediffmail.com',
];

/** edits between two words; swapping two neighbouring letters counts as one */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** the email with its domain corrected, when the domain is one or two edits from a common one; otherwise null */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (domain.length < 4 || !domain.includes('.') || COMMON.includes(domain)) return null;
  let best: string | null = null;
  let bestDistance = 3;
  for (const c of COMMON) {
    const n = distance(domain, c);
    if (n < bestDistance) [best, bestDistance] = [c, n];
  }
  return best ? `${email.slice(0, at).trim()}@${best}` : null;
}
