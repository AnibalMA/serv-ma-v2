import { ref, onMounted } from "vue";
import { serviceHttp } from "../../../utils/serviceHttp";

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
      // const { data } = await serviceHttp.get("/api/status");

      const data = {
        success: true,
        data: {
          isInMaintenance: false,
          maintenanceMessage:
            "El sistema de terceros no está funcionando correctamente. Mantenimiento inesperado.",
          estimatedDowntime: null,
          lastUpdated: "2025-06-10T16:00:00.000Z",
          serviceName: "ServMA News",
          version: "1.0.0",
        },
        timestamp: new Date().toISOString(),
      };

      if (data.success) {
        serverStatus.value = {
          isOnline: true,
          isInMaintenance: data.data.isInMaintenance,
          maintenanceMessage: data.data.maintenanceMessage,
          estimatedDowntime: data.data.estimatedDowntime,
          serviceName: data.data.serviceName,
          version: data.data.version,
        };
      } else {
        serverStatus.value.isOnline = false;
        statusError.value = "Error al verificar el estado del servidor";
      }
    } catch (error) {
      serverStatus.value.isOnline = false;
      statusError.value = error.message || "Servidor no disponible";
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
