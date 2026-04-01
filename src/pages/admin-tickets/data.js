export default function () {
  return {
    searchTerm: "",
    loading: false,
    arr_tickets: [],
    selectedTicket: null,
    showCreateDialog: false,
    showDetailDialog: false,
    showConfirmDialog: false,
    showChangeProfileDialog: false,
    confirmAction: null,
    confirmMessage: "",
    // Para búsqueda de usuario al crear ticket
    searchUser: "",
    searchingUsers: false,
    userOptions: [],
    ticketTypes: [
      {
        label: "Dar de baja a usuario",
        value: "BAJA_USUARIO",
        icon: "person_off",
        color: "red",
      },
      {
        label: "Crear descuento",
        value: "CREAR_DESCUENTO",
        icon: "discount",
        color: "orange",
      },
      {
        label: "Cambiar PIN de perfil",
        value: "CAMBIAR_PIN",
        icon: "pin",
        color: "purple",
      },
      {
        label: "Cambiar perfil de servicio",
        value: "CAMBIAR_PERFIL",
        icon: "swap_horiz",
        color: "blue",
      },
      {
        label: "Dar de baja servicio",
        value: "BAJA_SERVICIO",
        icon: "cancel",
        color: "red-8",
      },
      {
        label: "Cambiar día de pago",
        value: "CAMBIAR_PAYDAY",
        icon: "calendar_month",
        color: "teal",
      },
    ],
    ticketForm: {
      tipo: null,
      usuario: null,
      descripcion: "",
      monto: 0,
      // Campos para cambiar perfil/PIN
      id_usuario_servicio: null,
      desc_perfil: "",
      nuevo_pin: "",
    },
    // Para servicios del usuario seleccionado
    userServices: [],
    loadingServices: false,
    selectedService: null,
    // Historial de acciones
    actionHistory: [],
    arr_tickets_col: [
      {
        name: "tipo",
        label: "Tipo",
        field: "tipo",
        sortable: true,
        align: "left",
      },
      {
        name: "usuario",
        label: "Usuario",
        field: "usuario",
        sortable: true,
        align: "left",
      },
      {
        name: "descripcion",
        label: "Descripción",
        field: "descripcion",
        align: "left",
      },
      {
        name: "estado",
        label: "Estado",
        field: "estado",
        sortable: true,
        align: "center",
      },
      {
        name: "fecha",
        label: "Fecha",
        field: "fecha",
        sortable: true,
        align: "center",
      },
      {
        name: "actions",
        label: "Acciones",
        field: "actions",
        align: "center",
      },
    ],
  };
}
