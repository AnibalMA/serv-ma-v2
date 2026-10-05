// Adds an external <script> to the page only once.
// Calling it again with the same src returns the same promise.
const loading = {};

export function loadScript(src) {
  if (!loading[src]) {
    loading[src] = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        // Forget the failed try so the next call can load it again
        delete loading[src];
        script.remove();
        reject(new Error("No se pudo cargar " + src));
      };
      document.head.appendChild(script);
    });
  }
  return loading[src];
}
