import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";
import { isAdmin } from "src/utils/roles";
import { formatMoney } from "src/utils/format";
import { amountToApprove, getQrFileError, putOptionInList } from "./helpers";

export default {
  // Used in the template too
  amountToApprove,

  // ── Seguridad ──────────────────────────────────────────────────────────────
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

  // ── Cargar solicitudes pendientes ──────────────────────────────────────────
  async loadPaymentRequests() {
    if (!this.checkAdminAccess()) return;
    this.loading = true;
    try {
      const resp = await serviceHttp.get("/getPaymentsRequests");
      if (resp.data.ok) {
        this.arr_requests = resp.data.data || [];
      } else {
        this.$q.notify({
          color: "orange-8",
          textColor: "white",
          icon: "info",
          message:
            resp.data.sMessage || "No se pudieron cargar las solicitudes",
        });
        this.arr_requests = [];
      }
    } catch (err) {
      console.error("[loadPaymentRequests]", err);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de red al cargar solicitudes de pago",
      });
    } finally {
      this.loading = false;
    }
  },

  // ── Ver comprobante ────────────────────────────────────────────────────────
  onViewScreenshot(row) {
    if (!this.checkAdminAccess()) return;
    if (!row.screenshot_data) {
      this.$q.notify({
        color: "grey-7",
        textColor: "white",
        icon: "image_not_supported",
        message: "Esta solicitud no tiene comprobante adjunto",
      });
      return;
    }
    this.currentScreenshot = row.screenshot_data;
    this.currentScreenshotTitle = `Comprobante - ${row.nom_usuario} / ${row.cod_boleta}`;
    this.showScreenshotDialog = true;
  },

  // ── Aprobar: abrir confirmación ────────────────────────────────────────────
  onApproveRequest(row) {
    if (!this.checkAdminAccess()) return;
    this.approveForm = {
      id_solicitud: row.id,
      cod_boleta: row.cod_boleta,
      nom_usuario: `${row.nom_usuario} ${row.ape_usuario || ""}`.trim(),
      monto_a_pagar: amountToApprove(row),
      nro_operacion: row.nro_operacion || null,
    };
    this.showApproveDialog = true;
  },

  async confirmApprove() {
    if (!this.checkAdminAccess()) return;
    this.loadingAction = true;
    try {
      const resp = await serviceHttp.post("/approvePaymentRequest", {
        id_solicitud: this.approveForm.id_solicitud,
      });
      this.showApproveDialog = false;
      if (resp.data.ok) {
        this.$q.notify({
          color: "positive",
          textColor: "white",
          icon: "check_circle",
          message: resp.data.sMessage || "Solicitud aprobada correctamente",
        });
        await this.loadPaymentRequests();
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: resp.data.sMessage || "No se pudo aprobar la solicitud",
        });
      }
    } catch (err) {
      console.error("[confirmApprove]", err);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: err.response?.data?.sMessage || "Error de red al aprobar la solicitud",
      });
    } finally {
      this.loadingAction = false;
    }
  },

  // ── Rechazar: abrir dialog ─────────────────────────────────────────────────
  onRejectRequest(row) {
    if (!this.checkAdminAccess()) return;
    this.rejectForm = {
      id_solicitud: row.id,
      cod_boleta: row.cod_boleta,
      nom_usuario: `${row.nom_usuario} ${row.ape_usuario || ""}`.trim(),
      nro_operacion: row.nro_operacion || null,
      motivoRechazo: "",
    };
    this.showRejectDialog = true;
  },

  async confirmReject() {
    if (!this.checkAdminAccess()) return;
    if (!this.rejectForm.motivoRechazo.trim()) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Debe ingresar el motivo de rechazo",
      });
      return;
    }
    this.loadingAction = true;
    try {
      const resp = await serviceHttp.post("/rejectPaymentRequest", {
        id_solicitud: this.rejectForm.id_solicitud,
        motivoRechazo: this.rejectForm.motivoRechazo.trim(),
      });
      this.showRejectDialog = false;
      if (resp.data.ok) {
        this.$q.notify({
          color: "positive",
          textColor: "white",
          icon: "check_circle",
          message: resp.data.sMessage || "Solicitud rechazada",
        });
        await this.loadPaymentRequests();
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: resp.data.sMessage || "No se pudo rechazar la solicitud",
        });
      }
    } catch (err) {
      console.error("[confirmReject]", err);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: err.response?.data?.sMessage || "Error de red al rechazar la solicitud",
      });
    } finally {
      this.loadingAction = false;
    }
  },

  // ── Utilidades ─────────────────────────────────────────────────────────────
  formatMonto(val) {
    return formatMoney(val);
  },

  formatFecha(val) {
    if (!val) return "-";
    const d = new Date(val);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  filteredRequests() {
    if (!this.searchTerm) return this.arr_requests;
    const t = this.searchTerm.toLowerCase();
    return this.arr_requests.filter(
      (r) =>
        (r.nom_usuario || "").toLowerCase().includes(t) ||
        (r.ape_usuario || "").toLowerCase().includes(t) ||
        (r.cod_boleta || "").toLowerCase().includes(t) ||
        (r.nom_payment_opc || "").toLowerCase().includes(t) ||
        String(r.nro_operacion || "").includes(t)
    );
  },

  // El botón de recargar de la cabecera recarga la pestaña que se está viendo
  refreshActiveTab() {
    if (this.activeTab === "options") {
      this.loadPaymentOptions();
    } else {
      this.loadPaymentRequests();
    }
  },

  // ── Métodos de pago ────────────────────────────────────────────────────────
  async loadPaymentOptions() {
    if (!this.checkAdminAccess()) return;
    this.loadingOptions = true;
    try {
      const { data } = await serviceHttp.get("/getPaymentsOpts");
      if (data?.ok) {
        this.paymentOptions = data.data || [];
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudieron cargar los métodos de pago",
        });
      }
    } catch (error) {
      console.error("[loadPaymentOptions]", error);
      this.$q.notify({
        type: "negative",
        message:
          error.response?.data?.sMessage ||
          "Error de red al cargar los métodos de pago",
      });
    } finally {
      this.loadingOptions = false;
    }
  },

  onNewPaymentOption() {
    this.editingOption = null;
    this.showOptionDialog = true;
  },

  // Muestra en la lista el método que respondió el servidor
  applySavedOption(option) {
    if (option?.id) {
      this.paymentOptions = putOptionInList(this.paymentOptions, option);
    } else {
      this.loadPaymentOptions();
    }
  },

  onEditPaymentOption(option) {
    this.editingOption = option;
    this.showOptionDialog = true;
  },

  // Crea (POST) o edita (PUT) según si hay un método en edición
  async savePaymentOption(form) {
    // Enter pulsado dos veces: no guardar dos veces
    if (this.savingOption) return;
    if (!this.checkAdminAccess()) return;
    this.savingOption = true;
    try {
      const { data } = this.editingOption
        ? await serviceHttp.put(`/payment-options/${this.editingOption.id}`, form)
        : await serviceHttp.post("/payment-options", form);

      if (data?.ok) {
        this.applySavedOption(data.data);
        this.showOptionDialog = false;
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Método de pago guardado",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo guardar el método de pago",
        });
      }
    } catch (error) {
      console.error("[savePaymentOption]", error);
      this.$q.notify({
        type: "negative",
        message:
          error.response?.data?.sMessage ||
          "Error de red al guardar el método de pago",
      });
    } finally {
      this.savingOption = false;
    }
  },

  // q-file rejects files that don't match "accept" before calling onQrFilePicked
  onQrFileRejected() {
    this.$q.notify({
      type: "negative",
      message: "El QR debe ser una imagen JPG, PNG o WEBP",
    });
  },

  async onQrFilePicked(option, file) {
    if (!file) return;
    if (!this.checkAdminAccess()) return;

    const errorMessage = getQrFileError(file);
    if (errorMessage) {
      this.$q.notify({ type: "negative", message: errorMessage });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    this.uploadingQrId = option.id;
    try {
      const { data } = await serviceHttp.post(
        `/payment-options/${option.id}/qr`,
        formData
      );
      if (data?.ok) {
        this.applySavedOption(data.data);
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "QR actualizado",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo subir el QR",
        });
      }
    } catch (error) {
      console.error("[onQrFilePicked]", error);
      this.$q.notify({
        type: "negative",
        message: error.response?.data?.sMessage || "Error de red al subir el QR",
      });
    } finally {
      this.uploadingQrId = null;
    }
  },

  onRemoveQr(option) {
    if (!this.checkAdminAccess()) return;
    this.$q
      .dialog({
        title: "Quitar QR",
        message: `¿Quitar el código QR de ${option.nom_payment_opc}? Los clientes ya no lo verán al pagar.`,
        cancel: { label: "Cancelar", flat: true },
        ok: { label: "Quitar QR", color: "negative" },
        persistent: true,
      })
      .onOk(() => this.removeQr(option));
  },

  async removeQr(option) {
    if (!this.checkAdminAccess()) return;
    this.uploadingQrId = option.id;
    try {
      const { data } = await serviceHttp.delete(`/payment-options/${option.id}/qr`);
      if (data?.ok) {
        this.applySavedOption(data.data);
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "QR eliminado",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo quitar el QR",
        });
      }
    } catch (error) {
      console.error("[removeQr]", error);
      this.$q.notify({
        type: "negative",
        message: error.response?.data?.sMessage || "Error de red al quitar el QR",
      });
    } finally {
      this.uploadingQrId = null;
    }
  },
};
