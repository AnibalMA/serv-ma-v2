import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  AVATAR_PRESETS,
  presetSrc,
  getPresetKey,
  getDefaultAvatarSrc,
  getAvatarSrc,
  isCustomAvatar,
} from "src/utils/avatar";

const defaults = { boy: "/img/boy.png", girl: "/img/girl.png" };
const photo =
  "https://res.cloudinary.com/demo/image/upload/v1/servma/avatars/7.jpg";

describe("AVATAR_PRESETS", () => {
  it("has the 12 Lorelei avatars", () => {
    expect(AVATAR_PRESETS).toHaveLength(12);
    expect(AVATAR_PRESETS[0]).toBe("lorelei-01");
    expect(AVATAR_PRESETS[11]).toBe("lorelei-12");
  });

  it("has an SVG file in public/avatars for every preset", () => {
    for (const key of AVATAR_PRESETS) {
      const file = path.resolve(__dirname, "../public", "." + presetSrc(key));
      expect(fs.readFileSync(file, "utf8").startsWith("<svg")).toBe(true);
    }
  });
});

describe("presetSrc", () => {
  it("points to the static file", () => {
    expect(presetSrc("lorelei-03")).toBe("/avatars/lorelei-03.svg");
  });
});

describe("getPresetKey", () => {
  it("returns the key of a known preset", () => {
    expect(getPresetKey({ avatar: "preset:lorelei-05" })).toBe("lorelei-05");
  });

  it("returns null for photos, unknown presets and empty avatars", () => {
    expect(getPresetKey({ avatar: photo })).toBeNull();
    expect(getPresetKey({ avatar: "preset:lorelei-99" })).toBeNull();
    expect(getPresetKey({ avatar: "preset:../../evil" })).toBeNull();
    expect(getPresetKey({ avatar: null })).toBeNull();
    expect(getPresetKey(null)).toBeNull();
  });
});

describe("getDefaultAvatarSrc", () => {
  it("uses the boy picture for men and the girl picture otherwise", () => {
    expect(getDefaultAvatarSrc({ genero: "M" }, defaults)).toBe(defaults.boy);
    expect(getDefaultAvatarSrc({ genero: "F" }, defaults)).toBe(defaults.girl);
    expect(getDefaultAvatarSrc({}, defaults)).toBe(defaults.girl);
    expect(getDefaultAvatarSrc(null, defaults)).toBe(defaults.girl);
  });
});

describe("getAvatarSrc", () => {
  it("shows an uploaded photo as it is", () => {
    expect(getAvatarSrc({ avatar: photo, genero: "M" }, defaults)).toBe(photo);
  });

  it("shows the chosen preset avatar", () => {
    expect(getAvatarSrc({ avatar: "preset:lorelei-12" }, defaults)).toBe(
      "/avatars/lorelei-12.svg"
    );
  });

  it("shows the default picture when there is no avatar", () => {
    expect(getAvatarSrc({ avatar: null, genero: "M" }, defaults)).toBe(
      defaults.boy
    );
    expect(getAvatarSrc({ genero: "F" }, defaults)).toBe(defaults.girl);
    expect(getAvatarSrc(null, defaults)).toBe(defaults.girl);
  });

  it("does not trust unknown values", () => {
    const unknown = [
      "preset:lorelei-99",
      "http://example.com/photo.jpg",
      "https://evil.example/x.jpg",
      "https://res.cloudinary.com.evil.com/x.jpg",
      "javascript:alert(1)",
      "/avatars/lorelei-01.svg",
      42,
    ];
    for (const avatar of unknown) {
      expect(getAvatarSrc({ avatar, genero: "M" }, defaults)).toBe(
        defaults.boy
      );
    }
  });
});

describe("isCustomAvatar", () => {
  it("is true when the user chose an avatar or uploaded a photo", () => {
    expect(isCustomAvatar({ avatar: "preset:lorelei-01" })).toBe(true);
    expect(isCustomAvatar({ avatar: photo })).toBe(true);
  });

  it("is false when the user has the default picture", () => {
    expect(isCustomAvatar({ avatar: null })).toBe(false);
    expect(isCustomAvatar({})).toBe(false);
    expect(isCustomAvatar(null)).toBe(false);
  });
});
