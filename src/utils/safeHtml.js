import DOMPurify from "dompurify";
import { copyAndNotify } from "src/utils/clipboard";

// The backend only sends these onclick shapes. We never run their code:
// we read the data we need and turn it into safe data-* attributes.
const COPY_PREVIOUS =
  /writeText\(\s*\w+\.previousElementSibling\.innerText\s*\)/;
const COPY_CODE = /\bconst\s+code\s*=\s*(['"])(.*?)\1/;
const COPY_TEXT = /^\s*copiarAlPortapapeles\(\s*(['"])(.*?)\1\s*\)/;
const OPEN_URL = /^\s*window\.open\(\s*(['"])(.*?)\1/;

function isHttps(url) {
  return /^https:\/\//i.test(url || "");
}

// Returns the data-* attributes that replace an onclick, or null to drop it
function onclickToAttributes(code) {
  if (COPY_PREVIOUS.test(code)) {
    return { "data-action": "copy-previous" };
  }

  const copy = code.match(COPY_CODE) || code.match(COPY_TEXT);
  if (copy) {
    return { "data-action": "copy", "data-text": copy[2] };
  }

  const open = code.match(OPEN_URL);
  if (open && isHttps(open[2])) {
    return { "data-action": "open", "data-url": open[2] };
  }

  console.warn("onclick ignorado:", code);
  return null;
}

function replaceOnclick(element) {
  const attributes = onclickToAttributes(element.getAttribute("onclick"));
  element.removeAttribute("onclick");

  if (!attributes) return;
  // setAttribute escapes the values, so quotes can't break out of them
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

export function sanitize(html) {
  if (!html) return "";

  // A <template> parses the HTML without running scripts or handlers
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("[onclick]").forEach(replaceOnclick);

  return DOMPurify.sanitize(template.innerHTML);
}

function runAction(element) {
  const { action, text, url } = element.dataset;

  if (action === "copy-previous") {
    copyAndNotify(element.previousElementSibling?.innerText);
  } else if (action === "copy") {
    copyAndNotify(text);
  } else if (action === "open" && isHttps(url)) {
    window.open(url, "_blank", "noopener");
  }
}

let _bound = false;

export function bindSafeEvents() {
  if (_bound) return;
  _bound = true;

  document.addEventListener("click", (e) => {
    const element = e.target.closest("[data-action]");
    if (!element) return;

    e.preventDefault();
    runAction(element);
  });
}
