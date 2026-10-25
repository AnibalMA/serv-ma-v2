import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";
import { useServerStatus } from "../servicios/composables/useServerStatus";
import { serviceHttp } from "../../utils/serviceHttp";
import { computed } from "vue";
import { GOOGLE_CLIENT_ID } from "src/utils/googleSignIn";
import { TURNSTILE_SITE_KEY, removeTurnstile } from "src/utils/turnstile";
import { isHalloweenSeason } from "src/utils/seasonalTheme";
import HalloweenEffects from "src/components/HalloweenEffects.vue";
import HalloweenLogo from "src/components/HalloweenLogo.vue";
export default {
  components: {
    HalloweenEffects,
    HalloweenLogo,
  },
  data() {
    return {
      ...data(),
      showServerStatus: false,
      bannerDismissed: false,
      isWakingUpBackend: false,
      isHalloween: isHalloweenSeason(),
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
      // Fijos al compilar: sin clave en el .env, la función queda apagada
      isTurnstileEnabled: Boolean(TURNSTILE_SITE_KEY),
      isGoogleEnabled: Boolean(GOOGLE_CLIENT_ID),
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
        this.serverStatus.isInMaintenance ||
        this.isLoggingIn ||
        (this.isTurnstileEnabled && !this.turnstileToken)
      );
    },
    isWaitingForTurnstile() {
      return (
        this.isTurnstileEnabled && !this.turnstileToken && !this.turnstileError
      );
    },
  },
  async mounted() {
    // Cargar Turnstile y Google sin esperar el estado del servidor
    this.setupTurnstile();
    this.setupGoogleButton();

    // Verificar el estado del servidor al cargar la página
    await this.checkServerStatus();

    // Mostrar banner solo cuando hay incidencia o mensaje operativo explícito
    this.showServerStatus =
      !this.serverStatus.isOnline ||
      this.serverStatus.isInMaintenance ||
      this.serverStatus.showMessageTop;

    // Hacer ping al backend para "despertarlo" (cold start)
    this.wakeUpBackend();
  },
  beforeUnmount() {
    removeTurnstile(this.turnstileWidgetId);
  },
  methods: {
    ...methods,
    // Método para despertar el backend
    async wakeUpBackend() {
      this.isWakingUpBackend = true;
      try {
        // Hacer un ping silencioso al backend para que se levante
        // await serviceHttp.get("/health/ping");
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
