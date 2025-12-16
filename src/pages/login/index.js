import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";
import { useServerStatus } from "../servicios/composables/useServerStatus";
import { serviceHttp } from "../../utils/serviceHttp";
import { computed } from "vue";

export default {
  data() {
    return {
      ...data(),
      showServerStatus: false,
      bannerDismissed: false,
      isWakingUpBackend: false,
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
  computed: {
    // Computed para verificar si el formulario es válido
    isFormValid() {
      return (
        this.email &&
        this.email.trim() !== "" &&
        this.password &&
        this.password.trim() !== ""
      );
    },
    // Computed para verificar si el botón debe estar deshabilitado
    isLoginDisabled() {
      return (
        !this.isFormValid ||
        !this.serverStatus.isOnline ||
        this.serverStatus.isInMaintenance
      );
    },
  },
  async mounted() {
    // Verificar el estado del servidor al cargar la página
    await this.checkServerStatus();

    // Si hay problemas de conectividad o mantenimiento, mostrar el estado
    if (!this.serverStatus.isOnline || this.serverStatus.isInMaintenance) {
      this.showServerStatus = true;
    }

    // Hacer ping al backend para "despertarlo" (cold start)
    this.wakeUpBackend();
  },
  methods: {
    ...methods,
    // Método para despertar el backend
    async wakeUpBackend() {
      this.isWakingUpBackend = true;
      try {
        // Hacer un ping silencioso al backend para que se levante
        await serviceHttp.get("/health/ping");
        console.log("Backend despertado correctamente");
      } catch (error) {
        // No mostrar error al usuario, es solo un ping silencioso
        console.log("Ping al backend:", error.message || "Sin respuesta aún");
      } finally {
        this.isWakingUpBackend = false;
      }
    },
  },
};
