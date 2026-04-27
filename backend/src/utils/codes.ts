// Generates a short, readable invite code (8 chars, A-Z + 0-9, no ambiguous chars)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip 0/O/1/I

export const generateInviteCode = (length = 8) => {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
};

// Generic random ref id (for tx hashes, etc. — useful if you need fake hashes during dev)
export const randomRef = (prefix = "ref", length = 16) => {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `${prefix}_${s}`;
};
