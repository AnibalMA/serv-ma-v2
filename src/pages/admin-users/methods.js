import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";
import { isAdmin } from "src/utils/roles";

function parseActiveFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "1" || normalized === "true" || normalized === "activo"
    );
  }
  return false;
}

function normalizeString(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default {
  getUserStatus(user) {
    const statusCode = String(user?.cod_estado || "")
      .trim()
      .toUpperCase();
    const statusDesc = String(user?.desc_estado || "")
      .trim()
      .toLowerCase();
    const statusName = String(user?.estado || "")
      .trim()
      .toLowerCase();

    const byCode = ["ESTADO_01", "ACTIVO", "A", "1"].includes(statusCode);
    const byDesc = statusDesc.includes("inactivo")
      ? false
      : statusDesc.includes("activo");
    const byName = statusName.includes("inactivo")
      ? false
      : statusName.includes("activo");
    const byFlag = parseActiveFlag(user?.activo);

    const isActive = byCode || byDesc || byName || byFlag;
    return {
      isActive,
      label: isActive ? "Activo" : "Inactivo",
    };
  },

  isUserActive(user) {
    return this.getUserStatus(user).isActive;
  },

  getUserStatusLabel(user) {
    return this.getUserStatus(user).label;
  },

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

  getUsers() {
    if (!this.checkAdminAccess()) return;
    this.loading = true;

    serviceHttp
      .get("/users")
      .then(({ data }) => {
        this.loading = false;
        this.arr_users = (data?.data || []).map((user) => ({
          ...user,
          initials: `${(user?.nom_usuario || "").trim().charAt(0)}${(
            user?.ape_usuario || ""
          )
            .trim()
            .charAt(0)}`
            .toUpperCase()
            .trim(),
        }));
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

  loadMasterData() {
    this.loadingMasterData = true;

    serviceHttp
      .get("/getDataMaestra")
      .then(({ data }) => {
        const grupos = data?.data?.aGrupos || [];
        const plataformas = data?.data?.aPlataformas || [];

        this.groupOptions = grupos.map((g) => ({
          label: g?.desc_grupo || g?.descripcion || `Grupo ${g?.id}`,
          value: g?.id,
        }));

        this.platformOptions = plataformas.map((p) => ({
          label: p?.desc_plataforma || p?.descripcion || `Plataforma ${p?.id}`,
          value: p?.id,
          monto: p?.monto,
        }));

        this.plataformaGrupos = data?.data?.aPlataformaGrupos || [];
      })
      .catch((error) => {
        console.error(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "No se pudo cargar grupos y plataformas",
        });
      })
      .finally(() => {
        this.loadingMasterData = false;
      });
  },

  onOpenCreateUser() {
    if (!this.checkAdminAccess()) return;
    this.showCreateUserDialog = true;
  },

  saveNewUser(form) {
    if (!this.checkAdminAccess()) return;

    const payload = {
      ...form,
      num_opc: Number(form.num_opc || 1),
    };

    this.$q.loading.show({ message: "Creando usuario..." });

    serviceHttp
      .post("/regUser", payload)
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Usuario creado",
          });
          this.showCreateUserDialog = false;
          this.getUsers();
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "No se pudo crear el usuario",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión al crear usuario",
        });
      });
  },

  onAssignPlatformService(user) {
    if (!this.checkAdminAccess()) return;

    this.selectedUser = user ? { ...user } : null;
    this.showAssignPlatformServiceDialog = true;
  },

  async onManageUserServices(user) {
    if (!this.checkAdminAccess()) return;
    this.selectedUser = { ...user };
    this.showManageServicesDialog = true;
    await this.loadUserServices(user.id);
  },

  async loadUserServices(idUsuario) {
    this.loadingUserServices = true;
    try {
      const { data } = await serviceHttp.get(`/user_servicios/${idUsuario}`);
      const rawServices = data?.data || [];
      const selectedUserId = Number(idUsuario);
      const selectedFullName = normalizeString(
        `${this.selectedUser?.nom_usuario || ""} ${
          this.selectedUser?.ape_usuario || ""
        }`
      );

      const filteredServices = rawServices.filter((service) => {
        const candidates = [
          service?.IdUsuario,
          service?.id_usuario,
          service?.usuario_id,
          service?.user_id,
          service?.idUser,
          service?.id_usuario_fk,
          service?.id_cli_usuario,
          service?.id_cliente,
          service?.id,
        ]
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));

        if (candidates.includes(selectedUserId)) {
          return true;
        }

        const serviceFullName = normalizeString(
          `${service?.nom_usuario || ""} ${service?.ape_usuario || ""}`
        );
        if (
          selectedFullName &&
          serviceFullName &&
          serviceFullName === selectedFullName
        ) {
          return true;
        }

        const serviceEmail = normalizeString(service?.email_principal_usuario);
        const selectedEmail = normalizeString(
          this.selectedUser?.email_principal_usuario
        );

        if (selectedEmail && serviceEmail && selectedEmail === serviceEmail) {
          return true;
        }

        // Si el backend ya devuelve solo los servicios del usuario y no trae campos de usuario,
        // mantenemos los registros para no ocultar datos validos.
        return candidates.length === 0 && !serviceFullName && !serviceEmail;
      });

      this.userServices = filteredServices.map((service) => ({
        ...service,
        desc_plataforma:
          service?.desc_plataforma ||
          service?.DescPlataforma ||
          service?.Plataforma ||
          "",
        desc_estado: service?.desc_estado || service?.Estado || "",
        desc_perfil:
          service?.desc_perfil || service?.DescPerfil || service?.Perfil || "",
        pin:
          service?.pin ||
          service?.Pin ||
          service?.pin_perfil ||
          service?.PinPerfil ||
          "",
        dia_pago:
          service?.dia_pago ?? service?.PayDay ?? service?.DiaPago ?? null,
        monto: service?.monto ?? service?.Monto ?? null,
        _serviceId:
          service?.id_usuario_servicio ||
          service?.IdUsuarioServicio ||
          service?.id_servicio_usuario ||
          service?.IdServicioUsuario ||
          service?.Id ||
          service?.id,
      }));

      if (rawServices.length && !filteredServices.length) {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "warning",
          message:
            "La API devolvio servicios sin coincidencia con el usuario seleccionado",
        });
      }

      if (!data?.ok) {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "warning",
          message: data?.sMessage || "No se pudieron obtener los servicios",
        });
      }
    } catch (error) {
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error al obtener servicios del usuario",
      });
      this.userServices = [];
    } finally {
      this.loadingUserServices = false;
    }
  },

  onOpenEditService(service) {
    this.editingService = service;
    this.showEditServiceDialog = true;
  },

  async saveUserServiceEdit(form) {
    if (!this.checkAdminAccess()) return;

    if (!form.id_usuario_servicio) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Servicio inválido",
      });
      return;
    }

    this.$q.loading.show({ message: "Actualizando servicio..." });

    try {
      // The backend reads "PIN" in uppercase; "pin" is ignored
      const payload = {
        id_usuario_servicio: Number(form.id_usuario_servicio),
        desc_perfil: (form.desc_perfil || "").trim(),
        PIN: String(form.pin ?? "").trim(),
      };

      const { data } = await serviceHttp.post("/change-service", payload);
      this.$q.loading.hide();

      if (data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: data?.sMessage || "Servicio actualizado",
        });
        this.showEditServiceDialog = false;
        if (this.selectedUser?.id) {
          await this.loadUserServices(this.selectedUser.id);
        }
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "No se pudo actualizar el servicio",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de conexión al actualizar servicio",
      });
    }
  },

  onDeactivateService(service) {
    const serviceName = service?.desc_plataforma || "este servicio";
    this.confirmMessage = `¿Dar de baja ${serviceName} para ${
      this.selectedUser?.nom_usuario || "el usuario"
    }?`;
    this.confirmAction = () => this.deactivateService(service);
    this.showConfirmDialog = true;
  },

  async deactivateService(service) {
    if (!this.checkAdminAccess()) return;

    const idServicio = service?._serviceId;
    if (!idServicio) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Servicio inválido",
      });
      return;
    }

    this.$q.loading.show({ message: "Dando de baja servicio..." });

    try {
      const { data } = await serviceHttp.post("/decline-service", {
        id_usuario_servicio: Number(idServicio),
      });

      this.$q.loading.hide();

      if (data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: data?.sMessage || "Servicio dado de baja",
        });

        if (this.selectedUser?.id) {
          await this.loadUserServices(this.selectedUser.id);
        }
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "No se pudo dar de baja el servicio",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de conexión al dar de baja servicio",
      });
    }
  },

  savePlatformService(form) {
    if (!this.checkAdminAccess()) return;

    if (!form.id_usuario) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Seleccione un usuario",
      });
      return;
    }

    const payload = {
      id_usuario: Number(form.id_usuario),
      id_grupo: Number(form.id_grupo),
      id_plataforma: Number(form.id_plataforma),
      dia_pago: Number(form.dia_pago),
      monto: Number(form.monto),
      desc_perfil: (form.desc_perfil || "").trim(),
      pin_perfil: (form.pin_perfil || "").trim(),
    };

    this.$q.loading.show({ message: "Asignando servicio de plataforma..." });

    serviceHttp
      .post("/regUserService", payload)
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Servicio asignado",
          });
          this.showAssignPlatformServiceDialog = false;
          if (this.selectedUser?.id) {
            this.loadUserServices(this.selectedUser.id);
          }
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "No se pudo asignar el servicio",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión al asignar servicio",
        });
      });
  },

  onViewUser(user) {
    this.selectedUser = { ...user };
    this.showUserDialog = true;
  },

  onEditUser(user) {
    if (!this.checkAdminAccess()) return;
    // UserEditDialog builds its form from selectedUser
    this.selectedUser = { ...user };
    this.showEditDialog = true;
  },

  saveUserEdit(form) {
    if (!this.checkAdminAccess()) return;
    this.$q.loading.show({ message: "Guardando cambios..." });

    serviceHttp
      .post("/update-user-profile", form)
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
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión al actualizar el usuario",
        });
      });
  },

  onToggleUserStatus(user) {
    if (!this.checkAdminAccess()) return;
    const isActive = this.isUserActive(user);
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
    this.selectedUser = { ...user };
    this.showServiceDialog = true;
  },

  saveDiscount(form) {
    if (!this.checkAdminAccess()) return;

    if (form.monto <= 0) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El monto total debe ser mayor a 0",
      });
      return;
    }
    if (
      form.tipo_desc === "COMBO" &&
      form.factor <= 0
    ) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El descuento por boleta debe ser mayor a 0",
      });
      return;
    }
    // The backend requires a note for every discount
    const descripcion = String(form.descripcion || "").trim();
    if (!descripcion) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Ingrese una descripción para el descuento",
      });
      return;
    }

    this.$q.loading.show({ message: "Registrando descuento..." });

    const esCombo = form.tipo_desc === "COMBO";
    const payload = {
      id_usuario: form.id_usuario,
      monto_descuento: form.monto,
      factor_desc: esCombo ? form.factor : form.monto,
      desc_nota: descripcion,
      desc_nota_short: descripcion.substring(0, 50),
      tipo_desc: form.tipo_desc,
    };

    serviceHttp
      .post("/regDescuentosUser", payload)
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
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error de conexión al registrar el descuento",
        });
      });
  },

  executeConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  },

  // ─── PAGO DE BOLETAS (cobrador) ───────────────────────────────────────────

  async onPayBoleta(user) {
    if (!this.checkAdminAccess()) return;
    this.selectedUser = { ...user };
    this.userPayBoletas = [];
    this.showPayBoletaDialog = true;
    await this.loadUserPendingBoletas(user.id);
  },

  async loadUserPendingBoletas(idUsuario) {
    this.loadingPayBoletas = true;
    try {
      const { data } = await serviceHttp.get(
        `/getBoleta/${idUsuario}?bEstado=Pending`
      );
      this.userPayBoletas = data?.data || [];
    } catch (error) {
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error al cargar boletas pendientes",
      });
    } finally {
      this.loadingPayBoletas = false;
    }
  },

  async savePayBoleta(form, modo) {
    if (!this.checkAdminAccess()) return;

    if (modo === "boletas") {
      if (!form.bAll && !form.idBoleta.length) {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "warning",
          message: "Seleccione al menos una boleta o marque 'Pagar todas'",
        });
        return;
      }
      if (
        !form.montoCancelado ||
        form.montoCancelado <= 0
      ) {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "warning",
          message: "Ingrese un monto mayor a 0",
        });
        return;
      }
    } else {
      if (!form.idDetalle.length) {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "warning",
          message: "Seleccione al menos un ítem a pagar",
        });
        return;
      }
    }

    this.$q.loading.show({ message: "Registrando pago..." });

    let payload;
    if (modo === "boletas") {
      payload = {
        idUsuario: form.id_usuario,
        montoCancelado: Number(form.montoCancelado),
        ...(form.bAll
          ? { bAll: true }
          : { idBoleta: form.idBoleta }),
      };
    } else {
      payload = {
        idUsuario: form.id_usuario,
        idDetalle: form.idDetalle,
      };
    }

    try {
      const { data } = await serviceHttp.post("/payBoleta", payload);
      this.$q.loading.hide();
      if (data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: data.sMessage || "Pago registrado",
        });
        this.showPayBoletaDialog = false;
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "Error al registrar pago",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de conexión",
      });
    }
  },

  onLiquidarBoletas(user) {
    if (!this.checkAdminAccess()) return;
    this.liquidarUserTarget = { ...user };
    this.userLiquidarBoletas = [];
    this.showLiquidarDialog = true;
    this.loadUserPaidBoletas(user.id);
  },

  async loadUserPaidBoletas(idUsuario) {
    this.loadingLiquidarBoletas = true;
    try {
      const { data } = await serviceHttp.get(
        `/getBoleta/${idUsuario}?bEstado=Paid`
      );
      const boletas = data?.data || [];
      this.userLiquidarBoletas = boletas.filter(
        (b) => b.is_liquidado == 0 || b.is_liquidado === false
      );
    } catch (error) {
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error al cargar cobros pagados",
      });
    } finally {
      this.loadingLiquidarBoletas = false;
    }
  },

  async confirmLiquidar() {
    this.showLiquidarDialog = false;
    await this.liquidarBoletasUser(this.liquidarUserTarget?.id);
    this.getUsers();
  },

  async liquidarBoletasUser(idUsuario) {
    this.$q.loading.show({ message: "Liquidando cobros..." });
    try {
      const { data } = await serviceHttp.post("/liquidarBoleta", {
        idUsuario,
        bAll: true,
      });
      this.$q.loading.hide();
      if (data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: data.sMessage || "Cobros liquidados",
        });
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "Error al liquidar",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error(error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de conexión",
      });
    }
  },
};
