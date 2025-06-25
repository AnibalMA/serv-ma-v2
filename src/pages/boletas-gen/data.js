import { date } from "quasar";

export default function () {
  return {
    activeTab: "boletas",
    optBoleta: "Pendientes",
    optUser: "",
    showBoletaDialog: false,
    sendEmail: false,
    sendSMS: false,
    attachFile: false,
    useNextMonth: true,
    arr_users: [],
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
        name: "actions_boleta",
        label: "Acciones",
        headerStyle: "width: 15rem",
        align: "center",
        sortable: false,
      },
    ],
    arr_boletas: [],

    // Columnas para la tabla de servicios
    arr_servicios_col: [
      {
        name: "Grupo",
        label: "Grupo",
        field: "Grupo",
        sortable: true,
        headerStyle: "width: 8rem",
        align: "left",
      },
      {
        name: "Plataforma",
        label: "Plataforma",
        field: "Plataforma",
        sortable: true,
        headerStyle: "width: 8rem",
        align: "left",
      },
      {
        name: "Perfil",
        label: "Perfil",
        field: "Perfil",
        sortable: true,
        headerStyle: "width: 10rem",
        align: "left",
      },
      {
        name: "Pin",
        label: "PIN",
        field: "Pin",
        sortable: false,
        headerStyle: "width: 6rem",
        align: "center",
      },
      {
        name: "PayDay",
        label: "Día de Pago",
        field: "PayDay",
        sortable: true,
        headerStyle: "width: 6rem",
        align: "center",
      },
      {
        name: "Estado",
        label: "Estado",
        field: "Estado",
        sortable: true,
        headerStyle: "width: 8rem",
        align: "center",
      },
      {
        name: "actions",
        label: "Acciones",
        headerStyle: "width: 12rem",
        align: "center",
        sortable: false,
      },
    ],
    arr_servicios: [],

    // Dialog states
    showDiaPagoDialog: false,
    showEditDialog: false,
    selectedServicio: null,
    nuevoDiaPago: null,
    editingServicio: {
      Id: null,
      IdGrupo: null,
      IdPlataforma: null,
      Grupo: "",
      Plataforma: "",
      Perfil: "",
      Pin: "",
      PayDay: null,
    },

    // Opciones para días del mes
    diasDelMes: Array.from({ length: 31 }, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    })),
  };
}
