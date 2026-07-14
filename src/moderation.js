const BLOCKED_LANGUAGE = [
  /\bf+(?:u|a)+c+k+(?:e+d|i+n+g|e+r|s+)?\b/,
  /\bs+h+i+t+(?:t+y|h+e+a+d|s+)?\b/,
  /\bb+i+t+c+h+(?:e+s|y)?\b/,
  /\bc+u+n+t+s?\b/,
  /\bm+o+t+h+e+r+f+u+c+k+e+r+s?\b/,
  /\bf+a+g+g+o+t+s?\b/,
  /\bn+i+g+g+(?:e+r|a)+s?\b/,
  /\bk+i+k+e+s?\b/,
  /\bs+p+i+c+s?\b/,
  /\bc+h+i+n+k+s?\b/
];

function normalizeForModeration(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[013457@$!]/g, (character) => ({
      "0": "o",
      "1": "i",
      "3": "e",
      "4": "a",
      "5": "s",
      "7": "t",
      "@": "a",
      "$": "s",
      "!": "i"
    })[character])
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function containsBlockedLanguage(value) {
  const normalized = normalizeForModeration(value);
  return normalized ? BLOCKED_LANGUAGE.some((pattern) => pattern.test(normalized)) : false;
}

export function firstBlockedField(fields) {
  return fields.find(({ value }) => containsBlockedLanguage(value)) || null;
}

export function flagBlockedField(field) {
  if (!field) return;
  field.setAttribute("aria-invalid", "true");
  field.focus();
  field.addEventListener("input", () => field.removeAttribute("aria-invalid"), { once: true });
}
