export default function () {
  return {
    loading: false,
    loadingAction: false,
    searchTerm: "",
    arr_requests: [],

    // Dialog: ver captura de pantalla
    showScreenshotDialog: false,
    currentScreenshot: null,
    currentScreenshotTitle: "",

    // Dialog: rechazar solicitud
    showRejectDialog: false,
    rejectForm: {
      id_solicitud: null,
      cod_boleta: "",
      nom_usuario: "",
      motivoRechazo: "",
    },

    // Dialog: confirmar aprobación
    showApproveDialog: false,
    approveForm: {
      id_solicitud: null,
      cod_boleta: "",
      nom_usuario: "",
      monto_declarado: 0,
    },

    // Columnas de la tabla
    columns: [
      { name: "actions", label: "Acciones", align: "center", field: "id" },
      {
        name: "nom_usuario",
        label: "Usuario",
        align: "left",
        field: "nom_usuario",
        sortable: true,
      },
      {
        name: "cod_boleta",
        label: "N° Boleta",
        align: "center",
        field: "cod_boleta",
        sortable: true,
      },
      {
        name: "monto_facturado",
        label: "Monto Boleta",
        align: "right",
        field: "monto_facturado",
        sortable: true,
      },
      {
        name: "monto_declarado",
        label: "Monto Declarado",
        align: "right",
        field: "monto_declarado",
        sortable: true,
      },
      {
        name: "nom_payment_opc",
        label: "Método de Pago",
        align: "left",
        field: "nom_payment_opc",
        sortable: true,
      },
      {
        name: "comments",
        label: "Comentarios",
        align: "left",
        field: "comments",
      },
      {
        name: "screenshot",
        label: "Comprobante",
        align: "center",
        field: "screenshot_data",
      },
      {
        name: "created_at",
        label: "Fecha Solicitud",
        align: "center",
        field: "created_at",
        sortable: true,
      },
    ],
  };
}
