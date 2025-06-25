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
  onSelectOpt: function (opt) {
    this.getList(opt.value);
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
        message: "Error al obtener opciones de pago",
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
        this.getList(this.optBoleta.value || this.optBoleta);

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
        message: "Error al enviar la verificación de pago",
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

    try {
      await navigator.clipboard.writeText(numericData);
      this.$q.notify({
        color: "green-8",
        textColor: "white",
        icon: "check_circle",
        message: `Copiado: ${numericData}`,
        position: "top",
        timeout: 1500,
      });
    } catch (error) {
      // Fallback para navegadores que no soportan la API del portapapeles
      try {
        const textArea = document.createElement("textarea");
        textArea.value = numericData;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: `Copiado: ${numericData}`,
          position: "top",
          timeout: 1500,
        });
      } catch (fallbackError) {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: "Error al copiar al portapapeles",
          position: "top",
          timeout: 2000,
        });
      }
    }
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
      // Cualquier secuencia de números larga (8+ dígitos)
      /([0-9\s\-]{8,})/g,
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
};
