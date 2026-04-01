import { ref } from "vue";
import axios from "axios";

// Mensaje por defecto cuando no hay noticias
const DEFAULT_MESSAGE =
  "El sistema de terceros no está funcionando correctamente. Mantenimiento inesperado.";
const DEFAULT_SERVICE_NAME = "ServMA News";
const DEFAULT_VERSION = "1.0.0";

// URL de la API de noticias (mismo servidor que el frontend)
const NEWS_API_URL = "/serv-ma-api/api/news";

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
    let latestNews = null;
    try {
      // Llamar a la API de noticias (PHP en el mismo servidor)
      const response = await axios.get(NEWS_API_URL);

      // Verificar si hay datos y obtener la primera noticia (la más reciente)
      const hasNews =
        response.data && response.data.data && response.data.data.length > 0;
      latestNews = hasNews ? response.data.data[0] : null;

      serverStatus.value = {
        isOnline: latestNews ? latestNews.online : true,
        isInMaintenance: latestNews ? latestNews.maintenance : false,
        maintenanceMessage: latestNews ? latestNews.contenido : DEFAULT_MESSAGE,
        isWorking: latestNews ? latestNews.working : true,
        showMessageTop: latestNews ? latestNews.showMessageTop : false,
        estimatedDowntime: latestNews ? latestNews.estimatedDowntime : null,
        serviceName: latestNews ? latestNews.titulo : DEFAULT_SERVICE_NAME,
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
