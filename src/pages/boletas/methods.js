import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";
import { formatMoney } from "src/utils/format";
import { copyAndNotify } from "src/utils/clipboard";
// import { date } from "quasar";
export default {
  formatMoney,
  getList(sState, iUId) {
    this.$q.loading.show();

    serviceHttp
      .get(`/getBoleta${iUId ? "/" + iUId : ""}?bEstado=${sState}`)
      .then(({ data }) => {
        this.$q.loading.hide();

        this.arr_boletas = data?.data || [];

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

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
        this.$q.loading.hide();
        console.error(error);
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error al cargar las boletas",
        });
      });

    // console.log("Iniciando sesión...");
  },
  forgotPassword() {
    // Lógica para recuperar la contraseña
    console.log("Olvidaste tu contraseña?");
  },
  // formatDate: function (val) {
  //     return val ? date.formatDate(val, 'DD/MM/YYYY') : '-';
  // },
  // formatPrice(value) {
  //     let val = (value / 1).toFixed(2)
  //     return `S/.${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
  // },
  onSelectOpt: function (sState) {
    this.getList(sState);
  },
  onViewBoleta: function (oBoleta) {
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
        this.$q.loading.hide();

        const contentType = response.headers?.["content-type"] || "";
        if (!contentType.includes("pdf") && !contentType.includes("application/octet-stream")) {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: "La boleta PDF no está disponible o hubo un error al generarla",
          });
          return;
        }

        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        window.open(url);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);

        const msg =
          error?.response?.data && error.response.data instanceof ArrayBuffer
            ? this._parseErrorFromArrayBuffer(error.response.data)
            : error?.response?.data?.sMessage || error?.message;

        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: msg || "Error al obtener la boleta PDF",
        });
      });
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
        this.$q.loading.hide();

        const contentType = response.headers?.["content-type"] || "";
        if (!contentType.includes("pdf") && !contentType.includes("application/octet-stream")) {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: "La boleta PDF no está disponible o hubo un error al generarla",
          });
          return;
        }

        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Boleta_${oBoleta.cod_boleta}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        this.$q.loading.hide();
        console.error(error);

        const msg =
          error?.response?.data && error.response.data instanceof ArrayBuffer
            ? this._parseErrorFromArrayBuffer(error.response.data)
            : error?.response?.data?.sMessage || error?.message;

        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: msg || "Error al descargar la boleta PDF",
        });
      });
  },

  _parseErrorFromArrayBuffer(buf) {
    try {
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(buf);
      const json = JSON.parse(text);
      return json?.sMessage || json?.error || json?.message || "Error del servidor";
    } catch {
      return "Error del servidor";
    }
  },

  // Método para obtener opciones de pago
  async getPaymentOptions() {
    try {
      const { data } = await serviceHttp.get("/getPaymentsOpts");
      if (data?.ok) {
        this.paymentOptions = data?.data || [];
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "Error al obtener opciones de pago",
        });
      }
    } catch (error) {
      console.error("Error al obtener opciones de pago:", error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message:
          error.response?.data?.sMessage || "Error al obtener opciones de pago",
      });
    }
  },

  // Método para abrir el modal de pago
  async onPayBoleta(boleta) {
    this.selectedBoleta = boleta;
    this.selectedPaymentMethod = null;
    this.paymentCapture = null;
    this.captureFile = null;
    this.paymentComment = "";

    // Obtener opciones de pago
    await this.getPaymentOptions();

    this.showPaymentModal = true;
  },

  // Método para manejar la selección de archivo
  onFileSelected(file) {
    this.captureFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.paymentCapture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  // Método para enviar verificación de pago
  async submitPaymentVerification() {
    if (!this.selectedPaymentMethod) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Por favor selecciona un método de pago",
      });
      return;
    }

    if (!this.captureFile) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "Por favor adjunta la captura de la transacción",
      });
      return;
    }

    this.$q.loading.show({ message: "Enviando verificación de pago..." });

    try {
      // Preparar datos en el formato que espera el backend
      const requestData = {
        id_boleta: this.selectedBoleta.id,
        id_payment_opc: this.selectedPaymentMethod.id,
        screenshot_data: this.paymentCapture, // Base64 string
        comments: this.paymentComment.trim() || null,
      };

      const { data } = await serviceHttp.post(
        "/send-payment-verification",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      this.$q.loading.hide();

      if (data?.ok) {
        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message:
            "Pago enviado a revisión. Se actualizará en un plazo no mayor a 24h",
        });

        // Actualizar la lista de boletas para reflejar los cambios del backend
        this.getList(this.optBoleta);

        this.showPaymentModal = false;
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.sMessage || "Error al enviar la verificación de pago",
        });
      }
    } catch (error) {
      this.$q.loading.hide();
      console.error("Error al enviar verificación de pago:", error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message:
          error.response?.data?.sMessage ||
          "Error al enviar la verificación de pago",
      });
    }
  },

  // Método para cancelar el modal de pago
  cancelPayment() {
    this.showPaymentModal = false;
    this.selectedBoleta = null;
    this.selectedPaymentMethod = null;
    this.paymentCapture = null;
    this.captureFile = null;
    this.paymentComment = "";
  },

  // Método para copiar al portapapeles
  async copyToClipboard(text) {
    // Extraer solo números (incluyendo espacios y guiones que pueden ser parte del formato)
    const numericData = this.extractNumericData(text);

    if (!numericData) {
      this.$q.notify({
        color: "orange-8",
        textColor: "white",
        icon: "warning",
        message: "No se encontraron datos numéricos para copiar",
        position: "top",
        timeout: 2000,
      });
      return;
    }

    await copyAndNotify(numericData, `Copiado: ${numericData}`);
  },

  // Método para extraer datos numéricos del texto
  extractNumericData(text) {
    if (!text) return null;

    // Patrones comunes para números de cuenta, celular, etc.
    const patterns = [
      // Número de cuenta bancaria (puede tener espacios o guiones)
      /(?:nro\.?|número|cuenta|account)[\s:]*([0-9\s\-]{8,})/i,
      // Número de celular (9 dígitos en Perú, puede tener espacios o guiones)
      /(?:cel\.?|celular|teléfono|phone|móvil)[\s:]*([0-9\s\-]{9,})/i,
      // CCI (20 dígitos)
      /(?:cci)[\s:]*([0-9\s\-]{20})/i,
      // Cualquier secuencia de números larga (8+ caracteres) que empieza y
      // termina en dígito, para no copiar solo espacios o guiones.
      // Sin el flag "g": con "g", match() no devuelve el grupo en match[1]
      /(\d[\d\s-]{6,}\d)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Limpiar espacios extra y devolver solo números, espacios y guiones
        return match[1].replace(/\s+/g, " ").trim();
      }
    }

    // Si no encuentra con patrones específicos, buscar la secuencia más larga de números
    const allNumbers = text.match(/\d+/g);
    if (allNumbers) {
      // Devolver el número más largo encontrado
      const longestNumber = allNumbers.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      if (longestNumber.length >= 8) {
        return longestNumber;
      }
    }

    return null;
  },

  getVisibleBoletaCols(cols, row) {
    return cols.filter((col) =>
      row.desc_estado == "Pendiente"
        ? !["monto_cancelado", "fecha_cancelado"].includes(col.name)
        : true
    );
  },
};
