// Which picture to show for a user. The saved "avatar" can be:
//   null                     -> default picture (boy or girl, by género)
//   "preset:lorelei-05"      -> one of the avatars in public/avatars
//   "https://res.cloudinary…" -> a photo the user uploaded

const PRESET_PREFIX = "preset:";
// Uploaded photos are only shown from Cloudinary (the last "/" matters:
// it stops look-alike hosts such as res.cloudinary.com.evil.com)
const PHOTO_PREFIX = "https://res.cloudinary.com/";

// lorelei-01 … lorelei-12 (see public/avatars/CREDITS.md)
export const AVATAR_PRESETS = Array.from(
  { length: 12 },
  (_, index) => "lorelei-" + String(index + 1).padStart(2, "0")
);

export function presetSrc(key) {
  return `/avatars/${key}.svg`;
}

// Key of the preset the user chose, or null (unknown keys are ignored)
export function getPresetKey(user) {
  const avatar = user?.avatar;
  if (typeof avatar !== "string" || !avatar.startsWith(PRESET_PREFIX))
    return null;

  const key = avatar.slice(PRESET_PREFIX.length);
  return AVATAR_PRESETS.includes(key) ? key : null;
}

export function getDefaultAvatarSrc(user, defaults) {
  return user?.genero === "M" ? defaults.boy : defaults.girl;
}

// defaults: { boy, girl } pictures used when there is no (valid) avatar
export function getAvatarSrc(user, defaults) {
  const avatar = user?.avatar;
  if (typeof avatar === "string" && avatar.startsWith(PHOTO_PREFIX))
    return avatar;

  const key = getPresetKey(user);
  if (key) return presetSrc(key);

  return getDefaultAvatarSrc(user, defaults);
}

// True when the user chose an avatar or uploaded a photo
export function isCustomAvatar(user) {
  return Boolean(user?.avatar);
}
