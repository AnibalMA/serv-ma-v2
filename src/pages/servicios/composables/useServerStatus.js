import { ref } from "vue";
import axios from "axios";

// Mensaje por defecto cuando no hay noticias
const DEFAULT_MESSAGE =
  "El sistema de terceros no está funcionando correctamente. Mantenimiento inesperado.";
const DEFAULT_SERVICE_NAME = "ServMA News";
const DEFAULT_VERSION = "1.0.0";

// No usar /serv-ma-api/api/news porque está caído.
// Usamos health check del backend principal configurado en API_BACKEND.
const backendBaseUrl = (process.env.API_BACKEND || "").replace(/\/$/, "");
const HEALTH_CHECK_URL = backendBaseUrl
  ? `${backendBaseUrl}/health/ping`
  : "/health/ping";

export function useServerStatus() {
  const serverStatus = ref({
    isOnline: true,
    isInMaintenance: false,
    maintenanceMessage: "",
    estimatedDowntime: null,
    serviceName: "",
    version: "",
  });

  const isCheckingStatus = ref(false);
  const statusError = ref(null);

  const checkServerStatus = async () => {
    isCheckingStatus.value = true;
    statusError.value = null;
    try {
      await axios.get(HEALTH_CHECK_URL);

      serverStatus.value = {
        isOnline: true,
        isInMaintenance: false,
        maintenanceMessage: "",
        isWorking: true,
        showMessageTop: false,
        estimatedDowntime: null,
        serviceName: DEFAULT_SERVICE_NAME,
        version: DEFAULT_VERSION,
      };
    } catch (error) {
      // Si no hay respuesta del backend, marcarlo como no disponible
      serverStatus.value = {
        isOnline: false,
        isInMaintenance: false,
        isWorking: false,
        maintenanceMessage: DEFAULT_MESSAGE,
        showMessageTop: true,
        estimatedDowntime: null,
        serviceName: DEFAULT_SERVICE_NAME,
        version: DEFAULT_VERSION,
      };
      statusError.value =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo conectar con el servidor";
    } finally {
      isCheckingStatus.value = false;
    }
  };

  return {
    serverStatus,
    isCheckingStatus,
    statusError,
    checkServerStatus,
  };
}
