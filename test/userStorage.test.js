import { describe, it, expect } from "vitest";
import { encodeUser, decodeUser } from "src/utils/userStorage";

describe("userStorage", () => {
  it("saves and reads back names with any character (’, emoji)", () => {
    const user = { id: 7, nom_usuario: "D’Angelo 😀", ape_usuario: "Łukasz" };

    const saved = encodeUser(user);

    expect(typeof saved).toBe("string");
    expect(decodeUser(saved)).toEqual(user);
  });

  it("keeps plain text working", () => {
    const user = { id: 1, nom_usuario: "Ana", aOpcMenuNew: [{ label: "Dashboard" }] };

    expect(decodeUser(encodeUser(user))).toEqual(user);
  });

  it("reads users saved by the old version (Latin-1 accents)", () => {
    const user = { id: 3, nom_usuario: "José", ape_usuario: "Peña" };
    const oldValue = btoa(JSON.stringify(user));

    expect(decodeUser(oldValue)).toEqual(user);
  });
});
