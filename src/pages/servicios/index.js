// src/pages/servicios/index.js
import data from "./data";
import methods from "./methods";

export default {
  name: "ServiciosPage",
  data,
  methods,
  mounted() {
    this.getPlatformsByUser();
    window.$q = this.$q;
  },
  beforeUnmount() {
    // Limpiar listeners de WebSocket al salir del componente
    const socket = this.getSocketFromParent();
    if (socket) {
      socket.off("tv_login_progress");
      socket.off("email_check_progress");
      console.log(
        "🧹 Listeners de WebSocket removidos (tv_login_progress, email_check_progress)"
      );
    }
  },
};
