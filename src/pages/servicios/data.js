// src/pages/servicios/data.js
import { ref } from "vue";
export default function () {
  return {
    selectedPlatform: null,
    selectedService: null,
    loadingPlatforms: false,
    loadingServices: false,
    arr_platforms_u: [],
    services: [],
    oResult: ref("Esperando solicitud..."),
    isLoading: false,
    eventSource: null,
  };
}
