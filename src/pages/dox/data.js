// src/pages/dox/data.js
export default function () {
  return {
    // Comandos disponibles cargados del backend
    commands: [],
    selectedCommand: null,
    loadingCommands: false,

    // Créditos del usuario
    credits: 0,

    // Parámetros dinámicos del comando seleccionado
    paramValues: {},

    // Foto para comandos que la requieren
    photoFile: null,
    photoPreview: null,

    // Ejecución
    isExecuting: false,
    queueWait: false,
    queueTimer: null,

    // Resultado
    result: null,
    resultError: null,

    // Historial de créditos
    showHistory: false,
    creditHistory: [],
    loadingHistory: false,

    // Resumen de uso
    showSummary: false,
    usageSummary: [],
    loadingSummary: false,

    // Zoom de foto
    showPhotoZoom: false,
    zoomedPerson: null,
  };
}
