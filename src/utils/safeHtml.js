import DOMPurify from "dompurify";

const HANDLERS = {
  "window.open"(url, target) {
    window.open(String(url), String(target || "_blank"));
  },
  copiarAlPortapapeles(text) {
    navigator.clipboard.writeText(String(text));
  },
};

export function sanitize(html) {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["onclick", "target"],
    ALLOW_UNKNOWN_PROTOCOLS: true,
  });
}

function parseArgs(raw) {
  if (!raw || !raw.trim()) return [];
  const args = [];
  let cur = "";
  let inStr = false;
  let quote = "";
  let depth = 0;
  for (const ch of raw.trim()) {
    if (inStr) {
      cur += ch;
      if (ch === "\\") {
        cur += "";
      } else if (ch === quote) {
        inStr = false;
      }
    } else if (ch === "'" || ch === '"') {
      inStr = true;
      quote = ch;
      cur += ch;
    } else if (ch === "(" || ch === "[") {
      depth++;
      cur += ch;
    } else if (ch === ")" || ch === "]") {
      depth--;
      cur += ch;
    } else if (ch === "," && depth === 0) {
      const trimmed = cur.trim();
      if (trimmed) args.push(coerce(trimmed));
      cur = "";
    } else {
      cur += ch;
    }
  }
  const trimmed = cur.trim();
  if (trimmed) args.push(coerce(trimmed));
  return args;
}

function coerce(val) {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;
  if (val === "undefined") return undefined;
  if (!isNaN(val) && val !== "" && val.trim() !== "") return Number(val);
  return val;
}

export function bindSafeEvents(container) {
  if (!container || container._safeEventsBound) return;
  container._safeEventsBound = true;

  container.addEventListener("click", function (e) {
    const el = e.target.closest("[onclick]");
    if (!el) return;

    const raw = el.getAttribute("onclick").trim();
    el.removeAttribute("onclick");

    for (const [name, fn] of Object.entries(HANDLERS)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = raw.match(new RegExp(`^${escaped}\\(([\\s\\S]*)\\)\\s*$`));
      if (m) {
        const args = parseArgs(m[1]);
        fn(...args);
        e.preventDefault();
        return;
      }
    }

    const iife = raw.match(
      /^\(function\s*\(\s*\w+\s*\)\s*\{([\s\S]*)\}\s*\)\(\s*this\s*\)\s*$/
    );
    if (iife) {
      try {
        const fn = new Function(iife[1]);
        fn.call(el);
      } catch (err) {
        console.error("Error ejecutando onclick:", err);
      }
      e.preventDefault();
      return;
    }

    console.warn("onclick no reconocido, ignorado:", raw);
  });
}
