import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";
import { date } from "quasar";
import { isAdmin } from "src/utils/roles";
import { formatMoney } from "src/utils/format";

const SERVICE_ACTIONS = [
  "CAMBIAR_PIN",
  "CAMBIAR_PERFIL",
  "BAJA_SERVICIO",
  "CAMBIAR_PAYDAY",
];

export default {
  checkAdminAccess() {
    if (!isAdmin(useUserStore().user)) {
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
      ejecutadoPor: useUserStore().user?.nom_usuario || "",
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
    // A service picked for the previous user must not be used for this one
    this.selectedService = null;
    if (!user) {
      this.userServices = [];
      return;
    }
    // Cargar servicios del usuario si se necesitan
    if (this.needsService(this.ticketForm.tipo)) {
      await this.loadUserServices(user);
    }
  },

  // Actions that work on one of the user's services
  needsService(tipo) {
    return SERVICE_ACTIONS.includes(tipo);
  },

  async loadUserServices(user) {
    this.loadingServices = true;
    try {
      const { data } = await serviceHttp.get(
        `/user_servicios/${user.value || user.id}`
      );
      if (data?.ok) {
        this.userServices = (data.data || []).map((s) => {
          const descPerfil = s.desc_perfil || s.DescPerfil || s.Perfil || "";
          return {
            ...s,
            desc_perfil: descPerfil,
            label: `${
              s.desc_plataforma ||
              s.DescPlataforma ||
              s.Plataforma ||
              "Servicio"
            } - ${descPerfil || "Sin perfil"}`,
            value: s.id_usuario_servicio || s.IdUsuarioServicio || s.id || s.Id,
          };
        });
      }
    } catch (error) {
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error al cargar los servicios del usuario",
      });
    } finally {
      this.loadingServices = false;
    }
  },

  async executeTicket() {
    if (!this.checkAdminAccess()) return;

    const tipo = this.ticketForm.tipo;
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

    const missingField = this.getMissingFieldMessage(tipo);
    if (missingField) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: missingField,
      });
      return;
    }

    this.confirmMessage = this.getConfirmMessage(tipo, usuario);
    this.confirmAction = () => this.processTicket(tipo, usuario);
    this.showCreateDialog = false;
    this.showConfirmDialog = true;
  },

  // Fields the backend requires for each action ("" when everything is ok)
  getMissingFieldMessage(tipo) {
    const form = this.ticketForm;
    if (tipo === "CREAR_DESCUENTO" && !(form.monto > 0)) {
      return "El monto del descuento debe ser mayor a 0";
    }
    if (tipo === "CREAR_DESCUENTO" && !String(form.descripcion || "").trim()) {
      return "Ingrese una descripción para el descuento";
    }
    if (this.needsService(tipo) && !this.selectedService) {
      return "Seleccione un servicio";
    }
    if (tipo === "CAMBIAR_PIN" && !String(form.nuevo_pin || "").trim()) {
      return "Ingrese el nuevo PIN";
    }
    if (tipo === "CAMBIAR_PERFIL" && !String(form.desc_perfil || "").trim()) {
      return "Ingrese el nuevo nombre de perfil";
    }
    const diaPago = Number(form.dia_pago);
    const isValidDay =
      Number.isInteger(diaPago) && diaPago >= 1 && diaPago <= 31;
    if (tipo === "CAMBIAR_PAYDAY" && !isValidDay) {
      return "Ingrese un día de pago válido (1-31)";
    }
    return "";
  },

  getConfirmMessage(tipo, usuario) {
    const nombre = `${usuario.nom_usuario || ""} ${
      usuario.ape_usuario || ""
    }`.trim();
    const messages = {
      BAJA_USUARIO: `¿Dar de baja al usuario "${nombre}"? Se inactivarán todos sus servicios.`,
      CREAR_DESCUENTO: `¿Crear descuento de ${formatMoney(
        this.ticketForm.monto
      )} para "${nombre}"?`,
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

        case "CREAR_DESCUENTO": {
          // Same payload as admin-users: a NORMAL discount is applied once,
          // so the per-boleta factor is the whole amount
          const nota = this.ticketForm.descripcion.trim();
          result = await serviceHttp.post("/regDescuentosUser", {
            id_usuario: usuario.value || usuario.id,
            monto_descuento: this.ticketForm.monto,
            factor_desc: this.ticketForm.monto,
            desc_nota: nota,
            desc_nota_short: nota.substring(0, 50),
            tipo_desc: "NORMAL",
          });
          break;
        }

        case "CAMBIAR_PIN":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          // The backend expects "PIN" in uppercase and always needs desc_perfil
          result = await serviceHttp.post("/change-service", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
            desc_perfil: this.selectedService.desc_perfil,
            PIN: String(this.ticketForm.nuevo_pin).trim(),
          });
          break;

        case "CAMBIAR_PERFIL":
          if (!this.selectedService) {
            throw new Error("Seleccione un servicio");
          }
          // Without "PIN" the backend keeps the current PIN
          result = await serviceHttp.post("/change-service", {
            id_usuario_servicio:
              this.selectedService.value || this.selectedService.id,
            desc_perfil: this.ticketForm.desc_perfil.trim(),
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
          tipo: this.getTicketTypeLabel(tipo),
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
          tipo: this.getTicketTypeLabel(tipo),
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
        message:
          error.response?.data?.sMessage || error.message || "Error de conexión",
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

  getTicketTypeLabel(tipo) {
    const found = this.ticketTypes.find((t) => t.value === tipo);
    return found?.label || tipo;
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
