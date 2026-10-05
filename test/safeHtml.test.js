import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

vi.mock("src/utils/clipboard", () => ({
  copyAndNotify: vi.fn(),
}));

import { copyAndNotify } from "src/utils/clipboard";
import { sanitize, bindSafeEvents } from "src/utils/safeHtml";

// The 3 onclick shapes the backend sends today
const COPY_PREVIOUS_HTML = `<span>user@mail.com</span><button onclick="(function(btn){navigator.clipboard.writeText(btn.previousElementSibling.innerText).then(()=>window.$q?window.$q.notify({message:'Copiado al portapapeles',color:'positive',icon:'check',position:'bottom'}):alert('Texto copiado'))})(this)">Copiar</button>`;

const COPY_CODE_HTML = `<button onclick="(function(btn){ const code = 'ABC123'; navigator.clipboard.writeText(code).then(()=>window.$q?window.$q.notify({message:'Código copiado al portapapeles',color:'positive',icon:'check',position:'bottom'}):alert('Código copiado'))})(this)">Copiar código</button>`;

const OPEN_LINK_HTML = `<button onclick="window.open('https://www.netflix.com/account', '_blank')">Abrir</button>`;

// Parses the sanitized HTML so tests can read attributes easily
function render(html) {
  const container = document.createElement("div");
  container.innerHTML = sanitize(html);
  return container;
}

describe("sanitize", () => {
  let warn;

  // Dropped handlers are logged; keep the test output clean
  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("returns an empty string for null or empty input", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
    expect(sanitize("")).toBe("");
  });

  it("converts 'copy previous sibling' onclick into data-action", () => {
    const button = render(COPY_PREVIOUS_HTML).querySelector("button");
    expect(button.dataset.action).toBe("copy-previous");
    expect(button.hasAttribute("onclick")).toBe(false);
  });

  it("converts 'copy code' onclick into data-action + data-text", () => {
    const button = render(COPY_CODE_HTML).querySelector("button");
    expect(button.dataset.action).toBe("copy");
    expect(button.dataset.text).toBe("ABC123");
  });

  it("converts the legacy copiarAlPortapapeles handler", () => {
    const html = `<button onclick="copiarAlPortapapeles('hola mundo')">Copiar</button>`;
    const button = render(html).querySelector("button");
    expect(button.dataset.action).toBe("copy");
    expect(button.dataset.text).toBe("hola mundo");
  });

  it("converts window.open with https into data-action + data-url", () => {
    const button = render(OPEN_LINK_HTML).querySelector("button");
    expect(button.dataset.action).toBe("open");
    expect(button.dataset.url).toBe("https://www.netflix.com/account");
  });

  it("drops window.open when the url is not https", () => {
    const html = `<button onclick="window.open('javascript:alert(1)', '_blank')">Abrir</button>`;
    const button = render(html).querySelector("button");
    expect(button.hasAttribute("data-action")).toBe(false);
    expect(button.hasAttribute("data-url")).toBe(false);
  });

  it("drops unknown handlers", () => {
    const html = `<button onclick="alert(document.cookie)">Click</button>`;
    const button = render(html).querySelector("button");
    expect(button.hasAttribute("data-action")).toBe(false);
    expect(button.hasAttribute("onclick")).toBe(false);
  });

  it("warns in the console when it drops a handler", () => {
    render(`<button onclick="alert(document.cookie)">Click</button>`);
    expect(warn).toHaveBeenCalledWith(
      "onclick ignorado:",
      "alert(document.cookie)"
    );
  });

  it("does not warn for handlers it understands", () => {
    render(COPY_CODE_HTML);
    expect(warn).not.toHaveBeenCalled();
  });

  it("keeps quotes inside values from breaking out of the attribute", () => {
    const html = `<button onclick='copiarAlPortapapeles("x&quot; onmouseover=&quot;alert(1)")'>Copiar</button>`;
    const button = render(html).querySelector("button");
    expect(button.dataset.text).toBe('x" onmouseover="alert(1)');
    expect(button.hasAttribute("onmouseover")).toBe(false);
  });

  it("never outputs onclick or other inline handlers", () => {
    const html = [
      COPY_PREVIOUS_HTML,
      COPY_CODE_HTML,
      OPEN_LINK_HTML,
      `<a onclick='alert(1)'>x</a>`,
      `<img src="x" onerror="alert(1)">`,
    ].join("");
    const output = sanitize(html);
    expect(output).not.toMatch(/onclick/i);
    expect(output).not.toMatch(/onerror/i);
  });

  it("removes script tags", () => {
    const output = sanitize(`<p>Hola</p><script>alert(1)</script>`);
    expect(output).toBe("<p>Hola</p>");
  });
});

describe("bindSafeEvents", () => {
  beforeAll(() => {
    // jsdom does not implement innerText; browsers do
    Object.defineProperty(HTMLElement.prototype, "innerText", {
      get() {
        return this.textContent;
      },
      configurable: true,
    });
    bindSafeEvents();
  });

  beforeEach(() => {
    window.open = vi.fn();
    copyAndNotify.mockClear();
    document.body.innerHTML = "";
  });

  function click(html, selector) {
    document.body.innerHTML = sanitize(html);
    document.querySelector(selector).click();
  }

  it("copies the previous sibling text", () => {
    click(COPY_PREVIOUS_HTML, "button");
    expect(copyAndNotify).toHaveBeenCalledWith("user@mail.com");
  });

  it("copies the code from data-text", () => {
    click(COPY_CODE_HTML, "button");
    expect(copyAndNotify).toHaveBeenCalledWith("ABC123");
  });

  it("can copy many times in a row", () => {
    click(COPY_CODE_HTML, "button");
    document.querySelector("button").click();
    expect(copyAndNotify).toHaveBeenCalledTimes(2);
  });

  it("opens https links in a new tab", () => {
    click(OPEN_LINK_HTML, "button");
    expect(window.open).toHaveBeenCalledWith(
      "https://www.netflix.com/account",
      "_blank",
      "noopener"
    );
  });

  it("does not open non-https urls even if data-url was injected", () => {
    document.body.innerHTML = `<button data-action="open" data-url="javascript:alert(1)">x</button>`;
    document.querySelector("button").click();
    expect(window.open).not.toHaveBeenCalled();
  });
});
