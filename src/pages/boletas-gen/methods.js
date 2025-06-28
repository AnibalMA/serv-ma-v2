import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";
// import { date } from "quasar";
export default {
  getList(sState, iUId) {
    this.$q.loading.show();

    serviceHttp
      .get(`/getBoleta${iUId ? "/" + iUId : ""}?bEstado=${sState}`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        this.arr_boletas = data?.data || [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

          console.log(this.arr_boletas);
          // useUserStore().setUser(data?.data || {});

          // this.$router.replace("/dashboard");
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // console.log("Iniciando sesión...");
  },
  getListUsers() {
    this.$q.loading.show();

    serviceHttp
      .get(`/users`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        // Almacenar los datos completos de usuarios para referencia
        this.usersData = data?.data || [];

        this.arr_users = data
          ? data.data.map((user) => ({
              label: `${user.nom_usuario} ${user.ape_usuario} - ${user.estado}`,
              value: user.id,
              userData: user, // Guardamos la información completa del usuario
            }))
          : [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

          console.log(this.arr_users);
          // useUserStore().setUser(data?.data || {});

          // this.$router.replace("/dashboard");
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // console.log("Iniciando sesión...");
  },
  forgotPassword() {
    // Lógica para recuperar la contraseña
    console.log("Olvidaste tu contraseña?");
  },
  onGenBoletas: function () {
    this.showBoletaDialog = false;

    const params = {
      sendEmail: this.sendEmail,
      sendSMS: this.sendSMS,
      attachFile: this.attachFile,
      useNextMonth: this.useNextMonth,
    };

    this.$q.loading.show();

    const queryParams = new URLSearchParams({
      sendEmail: params.sendEmail,
      sendSMS: params.sendSMS,
      attachFile: params.attachFile,
      useNextMonth: params.useNextMonth,
    }).toString();

    serviceHttp
      .get(`/genBoleta/${this.optUser.value}?${queryParams}`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        this.arr_boletas = [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

          console.log(this.arr_boletas);
          // useUserStore().setUser(data?.data || {});

          // this.$router.replace("/dashboard");
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
        this.onSelectUser();
      })
      .catch((error) => {
        console.log(error);
      });
  },
  // formatDate: function (val) {
  //     return val ? date.formatDate(val, 'DD/MM/YYYY') : '-';
  // },
  // formatPrice(value) {
  //     let val = (value / 1).toFixed(2)
  //     return `S/.${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
  // },
  onSelectOpt: function (opt) {
    this.getList(opt.value, this.optUser.value);
  },
  onSelectUser: function () {
    this.arr_boletas = [];
    this.arr_servicios = [];

    // Establecer el estado del usuario seleccionado
    if (this.optUser && this.optUser.userData) {
      this.userActive = this.optUser.userData.estado === "Activo";
      this.userActiveDisplay = this.userActive; // Sincronizar la visualización
    } else {
      this.userActive = false;
      this.userActiveDisplay = false;
    }

    this.getList(
      this.optBoleta.value == undefined ? "Pending" : this.optBoleta.value,
      this.optUser.value
    );

    // Si estamos en la pestaña de servicios, cargar los servicios también
    if (this.activeTab === "servicios") {
      this.getServiciosList(this.optUser.value);
    }
  },
  onViewBoleta: function (oBoleta) {
    // console.log(oBoleta);
    this.$q.loading.show({ message: "Obteniendo la boleta..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id },
        {
          responseType: "arraybuffer",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        this.$q.loading.hide();
        window.open(url);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
      });
    // this.$router.push({ name: "boleta", params: { boleta: oBoleta } });
  },
  onDownloadBoleta: function (oBoleta) {
    this.$q.loading.show({ message: "Descargando..." });

    serviceHttp
      .post(
        "/getPdfBoleta",
        { id: oBoleta.id },
        {
          responseType: "arraybuffer",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );

        this.$q.loading.hide();

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Boleta_${oBoleta.cod_boleta}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
      });
  },

  getServiciosList(iUId) {
    if (!iUId) {
      this.arr_servicios = [];
      return;
    }

    this.$q.loading.show();

    serviceHttp
      .get(`/getServicios?uid=${iUId}`)
      .then(({ data }) => {
        console.log("Servicios:", data);

        this.$q.loading.hide();

        this.arr_servicios = data?.data || [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

          console.log(this.arr_servicios);
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.$q.loading.hide();
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error al cargar los servicios",
        });
      });
  },

  onDeleteBoleta: function (oBoleta) {
    this.$q
      .dialog({
        title: "Confirmar eliminación",
        message: `¿Está seguro de eliminar la boleta ${oBoleta.cod_boleta}?`,
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        this.$q.loading.show({ message: "Eliminando boleta..." });

        serviceHttp
          .delete(`/setDelFis/${oBoleta.id}`)
          .then(({ data }) => {
            this.$q.loading.hide();

            if (data?.ok) {
              this.$q.notify({
                color: "green-8",
                textColor: "white",
                icon: "check_circle",
                message: data?.sMessage || "Boleta eliminada correctamente",
              });

              // Recargar la lista de boletas
              this.getList(
                this.optBoleta?.value == undefined
                  ? "Pending"
                  : this.optBoleta.value,
                this.optUser?.value
              );
            } else {
              this.$q.notify({
                color: "red-8",
                textColor: "white",
                icon: "error",
                message: data?.sMessage || "Error al eliminar la boleta",
              });
            }
          })
          .catch((error) => {
            this.$q.loading.hide();
            console.log(error);
            this.$q.notify({
              color: "red-8",
              textColor: "white",
              icon: "error",
              message: "Error al eliminar la boleta",
            });
          });
      });
  },

  onEditServicio: function (oServicio) {
    this.editingServicio = {
      Id: oServicio.Id,
      IdGrupo: oServicio.IdGrupo,
      IdPlataforma: oServicio.IdPlataforma,
      Grupo: oServicio.Grupo,
      Plataforma: oServicio.Plataforma,
      Cuenta: oServicio.Cuenta,
      Perfil: oServicio.Perfil,
      Pin: oServicio.Pin,
      PayDay: oServicio.PayDay,
      Monto: oServicio.Monto || 0,
    };
    this.showEditDialog = true;
  },

  cancelEditServicio: function () {
    // Limpiar el formulario de edición
    this.editingServicio = {
      Id: null,
      IdGrupo: null,
      IdPlataforma: null,
      Grupo: "",
      Plataforma: "",
      Cuenta: "",
      Perfil: "",
      Pin: "",
      PayDay: null,
      Monto: null,
    };
    this.showEditDialog = false;
  },

  confirmEditServicio: function () {
    // Validar campos requeridos
    if (
      !this.editingServicio.Perfil ||
      this.editingServicio.Perfil.trim() === ""
    ) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El perfil es requerido",
      });
      return;
    }

    // Validar monto
    if (
      this.editingServicio.Monto === null ||
      this.editingServicio.Monto === undefined ||
      this.editingServicio.Monto < 0
    ) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El monto es requerido y debe ser mayor o igual a 0",
      });
      return;
    }

    if (this.editingServicio.Monto > 999999.99) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El monto no puede exceder S/999,999.99",
      });
      return;
    }

    // Validar longitud del PIN si se proporciona
    if (
      this.editingServicio.Pin &&
      (this.editingServicio.Pin.length < 4 ||
        this.editingServicio.Pin.length > 8)
    ) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "El PIN debe tener entre 4 y 8 caracteres",
      });
      return;
    }

    this.$q.loading.show({ message: "Actualizando servicio..." });

    // Preparar payload según la especificación del backend
    const payload = {
      id_usuario_servicio: this.editingServicio.Id,
      desc_perfil: this.editingServicio.Perfil.trim(),
      monto: parseFloat(this.editingServicio.Monto).toFixed(2),
    };

    // Agregar PIN solo si se proporciona y no está vacío
    if (this.editingServicio.Pin && this.editingServicio.Pin.trim() !== "") {
      payload.PIN = this.editingServicio.Pin.trim();
    }

    serviceHttp
      .post("/change-service", payload)
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Servicio actualizado correctamente",
          });

          this.showEditDialog = false;

          // Limpiar el formulario después de guardar exitosamente
          this.editingServicio = {
            Id: null,
            IdGrupo: null,
            IdPlataforma: null,
            Grupo: "",
            Plataforma: "",
            Cuenta: "",
            Perfil: "",
            Pin: "",
            PayDay: null,
            Monto: null,
          };

          this.getServiciosList(this.optUser?.value);

          // También refrescar boletas si estamos en esa pestaña
          if (this.activeTab === "boletas") {
            this.getList(this.optBoleta.value || "Pending", this.optUser.value);
          }
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al actualizar el servicio",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
        const errorMessage =
          error?.response?.data?.sMessage || "Error al actualizar el servicio";
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: errorMessage,
        });
      });
  },

  onDeleteServicio: function (oServicio) {
    this.$q
      .dialog({
        title: "Confirmar eliminación",
        message: `¿Está seguro de eliminar el servicio ${oServicio.Grupo} - ${oServicio.Plataforma}?`,
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        this.$q.loading.show({ message: "Eliminando servicio..." });

        const payload = {
          id_usuario_servicio: oServicio.Id,
        };

        serviceHttp
          .post("/decline-service", payload)
          .then(({ data }) => {
            this.$q.loading.hide();

            if (data?.ok) {
              this.$q.notify({
                color: "green-8",
                textColor: "white",
                icon: "check_circle",
                message: data?.sMessage || "Servicio eliminado correctamente",
              });

              // Refresh both lists to ensure data consistency
              this.getServiciosList(this.optUser?.value);
              this.getList(
                this.optBoleta === "Pendientes" ? "Pending" : "Paid",
                this.optUser?.value
              );
            } else {
              this.$q.notify({
                color: "red-8",
                textColor: "white",
                icon: "error",
                message: data?.sMessage || "Error al eliminar el servicio",
              });
            }
          })
          .catch((error) => {
            this.$q.loading.hide();
            console.log(error);
            this.$q.notify({
              color: "red-8",
              textColor: "white",
              icon: "error",
              message: "Error al eliminar el servicio",
            });
          });
      });
  },

  onChangeDiaPago: function (oServicio) {
    this.selectedServicio = oServicio;
    this.nuevoDiaPago = oServicio.PayDay;
    this.showDiaPagoDialog = true;
  },

  confirmChangeDiaPago: function () {
    if (!this.nuevoDiaPago || !this.selectedServicio) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Por favor seleccione un día válido",
      });
      return;
    }

    this.$q.loading.show({ message: "Cambiando día de pago..." });

    serviceHttp
      .post("/change-payday", {
        id_usuario_servicio: this.selectedServicio.Id,
        id_grupo: this.selectedServicio.IdGrupo,
        id_plataforma: this.selectedServicio.IdPlataforma,
        dia_pago: this.nuevoDiaPago,
      })
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || "Día de pago actualizado correctamente",
          });

          this.showDiaPagoDialog = false;
          this.getServiciosList(this.optUser?.value);
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al cambiar el día de pago",
          });
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message:
            error?.response?.data?.sMessage ||
            "Error al cambiar el día de pago",
        });
      });
  },

  // Método para aplicar clases CSS a las filas según el estado del servicio
  getRowClass(row) {
    if (row.Estado === "Activo") {
      return "row-activo";
    } else {
      return "row-inactivo";
    }
  },
  onToggleUserStatus: function () {
    if (!this.optUser || !this.optUser.value) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Por favor seleccione un usuario",
      });
      return;
    }

    // Usar siempre el estado REAL (userActive) para las decisiones, no el visual
    const newStatus = !this.userActive;
    const currentStatusText = this.userActive ? "activo" : "inactivo";
    const actionText = this.userActive ? "inactivar" : "activar";

    // Si va a inactivar usuario, mostrar diálogo con checkbox
    if (!newStatus) {
      this.showInactivateUserDialog();
    } else {
      // Si va a activar usuario, usar diálogo simple
      this.showSimpleConfirmDialog(newStatus, currentStatusText, actionText);
    }
  },

  showInactivateUserDialog: function () {
    // Resetear el checkbox
    this.inactivarServicios = false;

    this.$q
      .dialog({
        title: "Inactivar Usuario",
        message: `El usuario está actualmente activo. ¿Está seguro de inactivarlo?`,
        options: {
          type: "checkbox",
          model: [],
          items: [
            {
              label: "También inactivar todos los servicios del usuario",
              value: "inactivar_servicios",
              color: "primary",
            },
          ],
        },
        cancel: true,
        persistent: true,
        ok: {
          push: true,
          label: "Inactivar Usuario",
        },
        cancel: {
          push: true,
          color: "negative",
        },
      })
      .onOk((selectedOptions) => {
        // Verificar si se seleccionó inactivar servicios
        this.inactivarServicios = selectedOptions.includes(
          "inactivar_servicios"
        );

        this.executeUserStatusChange(false, "inactivar");
      })
      .onCancel(() => {
        // Restaurar el estado visual al cancelar
        this.userActiveDisplay = this.userActive;
        console.log("Inactivación de usuario cancelada");
      });
  },

  showSimpleConfirmDialog: function (newStatus, currentStatusText, actionText) {
    this.$q
      .dialog({
        title: "Confirmar cambio de estado",
        message: `El usuario está actualmente ${currentStatusText}. ¿Está seguro de ${actionText}lo?`,
        cancel: true,
        persistent: true,
      })
      .onOk(() => {
        this.executeUserStatusChange(newStatus, actionText);
      })
      .onCancel(() => {
        // Restaurar el estado visual al cancelar
        this.userActiveDisplay = this.userActive;
        console.log("Cambio de estado cancelado por el usuario");
      });
  },

  executeUserStatusChange: function (newStatus, actionText) {
    this.$q.loading.show({ message: `Cambiando estado del usuario...` });

    const payload = {
      id_usuario: this.optUser.value,
      activo: newStatus,
    };

    // Agregar campo inactivar_servicios solo si se está inactivando y se seleccionó la opción
    if (!newStatus && this.inactivarServicios) {
      payload.inactivar_servicios = true;
    }

    serviceHttp
      .post("/toggle-user-status", payload)
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage || `Usuario ${actionText}do correctamente`,
          });

          // Actualizar AMBOS estados solo después de confirmación exitosa
          this.userActive = newStatus;
          this.userActiveDisplay = newStatus;

          // Actualizar la información del usuario en la lista
          if (this.optUser.userData) {
            this.optUser.userData.estado = newStatus ? "Activo" : "Inactivo";
          }

          // Refrescar las listas para mantener consistencia
          this.getListUsers();
          this.getList(this.optBoleta.value || "Pending", this.optUser.value);
          if (this.activeTab === "servicios") {
            this.getServiciosList(this.optUser.value);
          }

          // Resetear el checkbox después de uso
          this.inactivarServicios = false;
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage || "Error al cambiar el estado del usuario",
          });

          // Restaurar el estado visual si hay error
          this.userActiveDisplay = this.userActive;
        }
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.log(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message:
            error?.response?.data?.sMessage ||
            "Error al cambiar el estado del usuario",
        });

        // Restaurar el estado visual si hay error
        this.userActiveDisplay = this.userActive;
      });
  },
};
