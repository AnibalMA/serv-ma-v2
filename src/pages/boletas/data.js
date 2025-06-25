import { date } from "quasar";

export default function () {
  return {
    optBoleta: "Pendientes",
    options: [
      {
        label: "Pendientes",
        value: "Pending",
      },
      {
        label: "Canceladas",
        value: "Paid",
      },
    ],
    // Variables para el modal de pago
    showPaymentModal: false,
    selectedBoleta: null,
    paymentOptions: [],
    selectedPaymentMethod: null,
    paymentCapture: null,
    captureFile: null,
    paymentComment: "", // Campo para comentarios del pago
    arr_boletas_col: [
      {
        name: "cod_boleta",
        label: "Cód. Boleta",
        field: "cod_boleta",
        sortable: true,
        headerStyle: "width: 5rem",
      },
      {
        name: "fecha_emision",
        label: "Fecha Emisión",
        field: "fecha_emision",
        headerStyle: "width: 7rem",
        align: "center",
        sortable: true,
        format: (val) => (val ? date.formatDate(val, "DD/MM/YYYY") : "-"),
      },
      // { name: 'fecha_emision', label: 'Fecha Emisión', field: 'fecha_emision', headerStyle: 'width: 7rem', align: 'center', sortable: true, format: val => date.formatDate(val, 'DD/MM/YYYY') },
      {
        name: "monto_facturado",
        label: "Monto Facturado",
        field: "monto_facturado",
        align: "center",
        sortable: true,
        headerStyle: "width: 7rem",
        format: (val) =>
          `S/.${(val * 1).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
      },
      {
        name: "fecha_cancelado",
        label: "Fecha Cancelado",
        field: "fecha_cancelado",
        align: "center",
        headerStyle: "width:7rem",
        sortable: true,
        format: (val) => (val ? date.formatDate(val, "DD/MM/YYYY") : "-"),
      },
      {
        name: "monto_cancelado",
        label: "Monto Cancelado",
        field: "monto_cancelado",
        align: "center",
        sortable: true,
        headerStyle: "width: 7rem",
        format: (val) =>
          `S/.${(val * 1).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
      },
      {
        name: "desc_estado",
        label: "Estado",
        field: "desc_estado",
        headerStyle: "width: 12rem",
        align: "center",
        sortable: true,
      },
      {
        name: "actions",
        label: "Acciones",
        headerStyle: "width: 15rem",
        align: "center",
        sortable: false,
      },
    ],
    arr_boletas: [],
  };
}
