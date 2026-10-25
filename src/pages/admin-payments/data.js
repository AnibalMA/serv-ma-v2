import { formatMoney } from "src/utils/format";
import { amountToApprove } from "./helpers";

export default function () {
  return {
    activeTab: "requests", // "requests" | "options"
    loading: false,
    loadingAction: false,
    searchTerm: "",
    arr_requests: [],

    // Pestaña: métodos de pago
    paymentOptions: [],
    loadingOptions: false,
    showOptionDialog: false,
    editingOption: null, // null = nuevo método
    savingOption: false,
    uploadingQrId: null, // id del método al que se le sube o quita el QR

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
      nro_operacion: null,
      motivoRechazo: "",
    },

    // Dialog: confirmar aprobación
    showApproveDialog: false,
    approveForm: {
      id_solicitud: null,
      cod_boleta: "",
      nom_usuario: "",
      monto_a_pagar: 0,
      nro_operacion: null,
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
        name: "monto_a_pagar",
        label: "Monto a pagar",
        align: "right",
        field: (row) => Number(amountToApprove(row)),
        format: (val) => formatMoney(val),
        classes: "text-weight-bold text-positive",
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
        name: "nro_operacion",
        label: "N° operación",
        align: "center",
        field: "nro_operacion",
        style: "font-variant-numeric: tabular-nums",
        format: (val) => val || "—",
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
