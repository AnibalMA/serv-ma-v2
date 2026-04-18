import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";
import { date } from "quasar";

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

  loadActionHistory() {
    // Cargar historial local (se podría conectar a un endpoint si existe)
    const stored = localStorage.getItem("admin_action_history");
    this.actionHistory = stored ? JSON.parse(stored) : [];
    this.arr_tickets = this.actionHistory;
  },

  saveActionToHistory(action) {
    const entry = {
      id: Date.now(),
      ...action,
      fecha: new Date().toISOString(),
      ejecutadoPor: useUserStore().getUser().nom_usuario,
    };
    this.actionHistory.unshift(entry);
    // Mantener solo últimas 100 entradas
    if (this.actionHistory.length > 100) {
      this.actionHistory = this.actionHistory.slice(0, 100);
    }
    localStorage.setItem(
      "admin_action_history",
      JSON.stringify(this.actionHistory)
    );
    this.arr_tickets = this.actionHistory;
  },

  onCreateTicket() {
    if (!this.checkAdminAccess()) return;
    this.ticketForm = {
      tipo: null,
      usuario: null,
      descripcion: "",
      monto: 0,
      id_usuario_servicio: null,
      desc_perfil: "",
      nuevo_pin: "",
      dia_pago: null,
    };
    this.userOptions = [];
    this.userServices = [];
    this.selectedService = null;
    this.showCreateDialog = true;
  },

  async searchUsers(val) {
    if (!val || val.length < 2) {
      this.userOptions = [];
      return;
    }
    this.searchingUsers = true;
    try {
      const { data } = await serviceHttp.get("/users");
      if (data?.ok) {
        const term = val.toLowerCase();
        this.userOptions = (data.data || [])
          .filter(
            (u) =>
              (u.nom_usuario || "").toLowerCase().includes(term) ||
              (u.ape_usuario || "").toLowerCase().includes(term) ||
              (u.email_principal_usuario || "").toLowerCase().includes(term)
          )
          .slice(0, 20)
          .map((u) => ({
            ...u,
            label: `${u.nom_usuario} ${u.ape_usuario} (${
              u.email_principal_usuario || "sin email"
            })`,
            value: u.id,
          }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.searchingUsers = false;
    }
  },

  async onUserSelected(user) {
    if (!user) {
      this.userServices = [];
      return;
    }
    // Cargar servicios del usuario si se necesitan
    if (
      [
        "CAMBIAR_PIN",
        "CAMBIAR_PERFIL",
        "BAJA_SERVICIO",
        "CAMBIAR_PAYDAY",
      ].includes(this.ticketForm.tipo?.value)
    ) {
      await this.loadUserServices(user);
    }
  },

  async loadUserServices(user) {
    this.loadingServices = true;
    try {
      const { data } = await serviceHttp.get(
        `/user_servicios/${user.value || user.id}`
      );
      if (data?.ok) {
        this.userServices = (data.data || []).map((s) => ({
          ...s,
          label: `${
            s.desc_plataforma || s.DescPlataforma || s.Plataforma || "Servicio"
          } - ${s.desc_perfil || s.DescPerfil || "Sin perfil"}`,
          value: s.id_usuario_servicio || s.IdUsuarioServicio || s.id || s.Id,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingServices = false;
    }
  },

  async executeTicket() {
    if (!this.checkAdminAccess()) return;

    const tipo = this.ticketForm.tipo?.value;
    const usuario = this.ticketForm.usuario;

    if (!tipo || !usuario) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Seleccione tipo de acción y usuario",
      });
      return;
    }

    this.confirmMessage = this.getConfirmMessage(tipo, usuario);
    this.confirmAction = () => this.processTicket(tipo, usuario);
    this.showCreateDialog = false;
    this.showConfirmDialog = true;
  },

  getConfirmMessage(tipo, usuario) {
    const nombre = `${usuario.nom_usuario || ""} ${
      usuario.ape_usuario || ""
    }`.trim();
    const messages = {
      BAJA_USUARIO: `¿Dar de baja al usuario "${nombre}"? Se inactivarán todos sus servicios.`,
      CREAR_DESCUENTO: `¿Crear descuento de S/. ${this.ticketForm.monto} para "${nombre}"?`,
      CAMBIAR_PIN: `¿Cambiar el PIN del perfil para "${nombre}"?`,
      CAMBIAR_PERFIL: `¿Cambiar el perfil de servicio para "${nombre}"?`,
      BAJA_SERVICIO: `¿Dar de baja el servicio seleccionado de "${nombre}"?`,
      CAMBIAR_PAYDAY: `¿Cambiar el día de pago para "${nombre}"?`,
    };
    return messages[tipo] || `¿Ejecutar acción sobre "${nombre}"?`;
  },

  async processTicket(tipo, usuario) {
    this.$q.loading.show({ message: "Procesando acción..." });

    try {
      let result;

      switch (tipo) {
        case "BAJA_USUARIO":
          result = await serviceHttp.post("/toggle-user-status", {
            id_usuario: usuario.value || usuario.id,
            activo: false,
            inactivar_servicios: true,
          });
          break;

        case "CREAR_DESCUENTO":
          result = await serviceHttp.post("/regDescuentosUser", {
            id_usuario: usuario.value || usuario.id,
            monto: this.ticketForm.monto,
            descripcion: this.ticketForm.descripcion,
          });
          break;

        case "CAMBIAR_PIN":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          result = await serviceHttp.post("/change-service", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
            desc_perfil:
              this.ticketForm.desc_perfil || this.selectedService.desc_perfil,
            PIN: this.ticketForm.nuevo_pin,
          });
          break;

        case "CAMBIAR_PERFIL":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          result = await serviceHttp.post("/change-service", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
            desc_perfil: this.ticketForm.desc_perfil,
          });
          break;

        case "BAJA_SERVICIO":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          result = await serviceHttp.post("/decline-service", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
          });
          break;

        case "CAMBIAR_PAYDAY":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          result = await serviceHttp.post("/change-payday", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
            id_plataforma:
              this.selectedService.IdPlataforma ||
              this.selectedService.id_plataforma,
            id_grupo:
              this.selectedService.IdGrupo || this.selectedService.id_grupo,
            dia_pago: this.ticketForm.dia_pago,
          });
          break;

        default:
          throw new Error("Tipo de acción no reconocido");
      }

      this.$q.loading.hide();

      if (result?.data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: result.data.sMessage || "Acción ejecutada correctamente",
        });

        this.saveActionToHistory({
          tipo: this.ticketForm.tipo?.label || tipo,
          tipoValue: tipo,
          usuario: `${usuario.nom_usuario || ""} ${
            usuario.ape_usuario || ""
          }`.trim(),
          usuarioId: usuario.value || usuario.id,
          descripcion: this.ticketForm.descripcion,
          estado: "Completado",
        });
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: result?.data?.sMessage || "Error al ejecutar la acción",
        });

        this.saveActionToHistory({
          tipo: this.ticketForm.tipo?.label || tipo,
          tipoValue: tipo,
          usuario: `${usuario.nom_usuario || ""} ${
            usuario.ape_usuario || ""
          }`.trim(),
          usuarioId: usuario.value || usuario.id,
          descripcion: this.ticketForm.descripcion,
          estado: "Error",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: error.message || "Error de conexión",
      });
    }
  },

  executeConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  },

  getTicketTypeIcon(tipo) {
    const found = this.ticketTypes.find(
      (t) => t.label === tipo || t.value === tipo
    );
    return found?.icon || "description";
  },

  getTicketTypeColor(tipo) {
    const found = this.ticketTypes.find(
      (t) => t.label === tipo || t.value === tipo
    );
    return found?.color || "grey";
  },

  formatDate(val) {
    if (!val) return "-";
    return date.formatDate(new Date(val), "DD/MM/YYYY HH:mm");
  },

  clearHistory() {
    this.confirmMessage = "¿Limpiar todo el historial de acciones?";
    this.confirmAction = () => {
      localStorage.removeItem("admin_action_history");
      this.actionHistory = [];
      this.arr_tickets = [];
      this.$q.notify({
        color: "green-8",
        textColor: "white",
        icon: "check_circle",
        message: "Historial limpiado",
      });
    };
    this.showConfirmDialog = true;
  },
};
