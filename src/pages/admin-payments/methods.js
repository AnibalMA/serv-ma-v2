import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "stores/user";
import { isAdmin } from "src/utils/roles";
import { formatMoney } from "src/utils/format";

export default {
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
      monto_declarado: row.monto_declarado || row.monto_facturado,
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
        (r.nom_payment_opc || "").toLowerCase().includes(t)
    );
  },
};
