import DOMPurify from "dompurify";

const SAFE_FUNCTIONS = new Set(["copiarAlPortapapeles"]);

export function sanitize(html) {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["onclick"],
    ALLOW_UNKNOWN_PROTOCOLS: true,
  });
}

function coerce(val) {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;
  if (val === "undefined") return undefined;
  if (!isNaN(val) && val !== "" && val.trim() !== "") return Number(val);
  return val;
}

function parseArgs(raw) {
  if (!raw || !raw.trim()) return [];
  const args = [];
  let cur = "";
  let inStr = false;
  let quote = "";
  for (const ch of raw) {
    if (inStr) {
      if (ch === quote) {
        inStr = false;
        args.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    } else if (ch === "'" || ch === '"') {
      inStr = true;
      quote = ch;
      cur = "";
    } else if (ch === ",") {
      if (cur.trim()) args.push(coerce(cur.trim()));
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) args.push(coerce(cur.trim()));
  return args;
}

export function bindSafeEvents(container, context) {
  if (!container) return;
  container.querySelectorAll("[onclick]").forEach((el) => {
    const raw = el.getAttribute("onclick").trim();
    const m = raw.match(/^(\w+)\(([^)]*)\)$/);
    if (m && SAFE_FUNCTIONS.has(m[1])) {
      const fnName = m[1];
      const args = parseArgs(m[2]);
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const fn = context[fnName];
        if (typeof fn === "function") fn(...args);
      });
    }
    el.removeAttribute("onclick");
  });
}
