import { date } from "quasar";

export default function () {
  return {
    searchTerm: "",
    loading: false,
    arr_users: [],
    selectedUser: null,
    showUserDialog: false,
    showEditDialog: false,
    showServiceDialog: false,
    showDiscountDialog: false,
    showConfirmDialog: false,
    confirmAction: null,
    confirmMessage: "",
    userDiscounts: [],
    loadingDiscounts: false,
    editForm: {
      id_usuario: null,
      nom_usuario: "",
      ape_usuario: "",
      email_principal_usuario: "",
      celular_principal_usuario: "",
    },
    discountForm: {
      id_usuario: null,
      monto: 0,
      descripcion: "",
    },
    arr_users_col: [
      {
        name: "initials",
        label: "",
        field: "initials",
        align: "center",
        headerStyle: "width: 3rem",
      },
      {
        name: "nom_usuario",
        label: "Nombre",
        field: "nom_usuario",
        sortable: true,
        align: "left",
      },
      {
        name: "ape_usuario",
        label: "Apellido",
        field: "ape_usuario",
        sortable: true,
        align: "left",
      },
      {
        name: "email_principal_usuario",
        label: "Email",
        field: "email_principal_usuario",
        sortable: true,
        align: "left",
      },
      {
        name: "celular_principal_usuario",
        label: "Celular",
        field: "celular_principal_usuario",
        align: "center",
      },
      {
        name: "desc_estado",
        label: "Estado",
        field: "desc_estado",
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
