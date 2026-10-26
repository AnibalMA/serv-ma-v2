import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public/privacidad.html"), "utf8");
const loginView = fs.readFileSync(
  path.join(root, "src/pages/login/login-view.vue"),
  "utf8"
);

describe("public/privacidad.html", () => {
  it("is a Spanish page with the expected title", () => {
    expect(html).toContain('lang="es"');
    expect(html).toContain("<title>Política de privacidad – Serv-MA</title>");
  });

  it("shows the last update date", () => {
    expect(html).toContain("Última actualización: 25 de octubre de 2026");
  });

  it("explains the data from Google sign-in", () => {
    expect(html).toContain("Google");
  });

  it("does not list the service providers", () => {
    expect(html).not.toContain("Con quién los compartimos");
    expect(html).not.toContain("Cloudinary");
    expect(html).not.toContain("Oracle");
  });

  it("has no scripts, insecure links or email addresses", () => {
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("http://");
    expect(html).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  });
});

describe("login page", () => {
  it("links to the privacy policy", () => {
    expect(loginView).toContain('href="/privacidad.html"');
  });
});
