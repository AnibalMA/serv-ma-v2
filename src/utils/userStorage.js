// The logged-in user is saved in LocalStorage as base64 text.
// btoa() only accepts Latin-1, so we turn the text into UTF-8 first;
// that way names like "D’Angelo 😀" can be saved too.

export function encodeUser(user) {
  const utf8 = unescape(encodeURIComponent(JSON.stringify(user)));
  return btoa(utf8);
}

export function decodeUser(saved) {
  const text = atob(saved);
  try {
    return JSON.parse(decodeURIComponent(escape(text)));
  } catch {
    // Saved by an older version, without the UTF-8 step
    return JSON.parse(text);
  }
}
