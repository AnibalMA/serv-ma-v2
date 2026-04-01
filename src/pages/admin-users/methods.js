import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";

const ADMIN_ROLES = ["ROL_ADM", "ROL_ADM_SU"];

export default {
  checkAdminAccess() {
    const user = useUserStore().getUser();
    if (!ADMIN_ROLES.includes(user.rol)) {
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "block",
        message: "No tienes permisos de administrador",
      });
      this.$router.replace("/dashboard");
      return false;
    }
    return true;
  },

  getUsers() {
    if (!this.checkAdminAccess()) return;
    this.loading = true;

    serviceHttp
      .get("/users")
      .then(({ data }) => {
        this.loading = false;
        this.arr_users = data?.data || [];
        if (!data?.ok) {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al obtener usuarios",
          });
        }
      })
      .catch((error) => {
        this.loading = false;
        console.error(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión",
        });
      });
  },

  onViewUser(user) {
    this.selectedUser = { ...user };
    this.showUserDialog = true;
  },

  onEditUser(user) {
    if (!this.checkAdminAccess()) return;
    this.editForm = {
      id_usuario: user.id,
      nom_usuario: user.nom_usuario,
      ape_usuario: user.ape_usuario,
      email_principal_usuario: user.email_principal_usuario || "",
      celular_principal_usuario: user.celular_principal_usuario || "",
    };
    this.showEditDialog = true;
  },

  saveUserEdit() {
    if (!this.checkAdminAccess()) return;
    this.$q.loading.show({ message: "Guardando cambios..." });

    serviceHttp
      .post("/update-user-profile", this.editForm)
      .then(({ data }) => {
        this.$q.loading.hide();
        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Usuario actualizado",
          });
          this.showEditDialog = false;
          this.getUsers();
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al actualizar",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);
      });
  },

  onToggleUserStatus(user) {
    if (!this.checkAdminAccess()) return;
    const isActive = user.cod_estado === "ESTADO_01";
    this.confirmMessage = isActive
      ? `¿Desactivar al usuario ${user.nom_usuario} ${user.ape_usuario}?`
      : `¿Activar al usuario ${user.nom_usuario} ${user.ape_usuario}?`;
    this.confirmAction = () => this.toggleUserStatus(user, !isActive);
    this.showConfirmDialog = true;
  },

  toggleUserStatus(user, activate) {
    this.$q.loading.show({
      message: activate ? "Activando..." : "Desactivando...",
    });

    serviceHttp
      .post("/toggle-user-status", {
        id_usuario: user.id,
        activo: activate,
        inactivar_servicios: !activate,
      })
      .then(({ data }) => {
        this.$q.loading.hide();
        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Estado actualizado",
          });
          this.getUsers();
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al cambiar estado",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);
      });
  },

  onViewDiscounts(user) {
    if (!this.checkAdminAccess()) return;
    this.selectedUser = { ...user };
    this.loadingDiscounts = true;
    this.showDiscountDialog = true;

    serviceHttp
      .post("/getDescuentosUser", { id_usuario: user.id })
      .then(({ data }) => {
        this.loadingDiscounts = false;
        this.userDiscounts = data?.data || [];
      })
      .catch((error) => {
        this.loadingDiscounts = false;
        console.error(error);
      });
  },

  onAddDiscount(user) {
    if (!this.checkAdminAccess()) return;
    this.discountForm = {
      id_usuario: user.id,
      monto: 0,
      descripcion: "",
    };
    this.selectedUser = { ...user };
    this.showServiceDialog = true;
  },

  saveDiscount() {
    if (!this.checkAdminAccess()) return;
    if (this.discountForm.monto <= 0) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El monto debe ser mayor a 0",
      });
      return;
    }

    this.$q.loading.show({ message: "Registrando descuento..." });

    serviceHttp
      .post("/regDescuentosUser", this.discountForm)
      .then(({ data }) => {
        this.$q.loading.hide();
        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Descuento registrado",
          });
          this.showServiceDialog = false;
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al registrar descuento",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);
      });
  },

  executeConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  },
};
