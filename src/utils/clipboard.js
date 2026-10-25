import { Notify } from "quasar";

// Old way of copying: put the text in a hidden textarea, select it and
// run "copy". It still works where navigator.clipboard is missing or blocked
// (WhatsApp/Instagram in-app browsers, http pages, etc.)
function copyWithTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  // 16px stops iOS from zooming in when the textarea gets selected
  textarea.style.fontSize = "16px";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    // iOS ignores select(), it needs the range too
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

// Returns true if the text was copied. Never throws.
export async function copyText(text) {
  const value = text == null ? "" : String(text);

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Blocked by the browser: try the old way below
    }
  }

  return copyWithTextarea(value);
}

export async function copyAndNotify(text, message = "Copiado al portapapeles") {
  const copied = await copyText(text);

  if (copied) {
    Notify.create({
      message,
      color: "positive",
      icon: "check",
      position: "bottom",
    });
  } else {
    Notify.create({
      message:
        "No se pudo copiar. Mantén presionado el texto para copiarlo manualmente.",
      color: "negative",
      icon: "error",
      position: "bottom",
    });
  }

  return copied;
}
