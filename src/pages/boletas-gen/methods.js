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

        this.arr_users = data
          ? data.data.map((user) => ({
              label: `${user.nom_usuario} ${user.ape_usuario} - ${user.estado}`,
              value: user.id,
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
                this.optBoleta === "Pendientes" ? "Pending" : "Paid",
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
    };
    this.showEditDialog = true;
  },

  confirmEditServicio: function () {
    this.$q.loading.show({ message: "Actualizando servicio..." });

    serviceHttp
      .put(`/updateServicio/${this.editingServicio.id}`, {
        perfil: this.editingServicio.Perfil,
        pin: this.editingServicio.Pin,
      })
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
          this.getServiciosList(this.optUser?.value);
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
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error al actualizar el servicio",
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

        serviceHttp
          .delete(`/deleteServicio/${oServicio.id}`)
          .then(({ data }) => {
            this.$q.loading.hide();

            if (data?.ok) {
              this.$q.notify({
                color: "green-8",
                textColor: "white",
                icon: "check_circle",
                message: data?.sMessage || "Servicio eliminado correctamente",
              });

              this.getServiciosList(this.optUser?.value);
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
      .post("/change-service", {
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
};
