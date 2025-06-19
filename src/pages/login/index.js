import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";
import { useServerStatus } from "../servicios/composables/useServerStatus";

export default {
  data() {
    return {
      ...data(),
      showServerStatus: false,
    };
  },
  methods,
  setup() {
    const userStore = useUserStore();
    const { serverStatus, isCheckingStatus, statusError, checkServerStatus } =
      useServerStatus();

    return {
      userStore,
      serverStatus,
      isCheckingStatus,
      statusError,
      checkServerStatus,
    };
  },
  async mounted() {
    // Verificar el estado del servidor al cargar la página
    await this.checkServerStatus();

    // Si hay problemas de conectividad o mantenimiento, mostrar el estado
    if (!this.serverStatus.isOnline || this.serverStatus.isInMaintenance) {
      this.showServerStatus = true;
    }
  },
};
