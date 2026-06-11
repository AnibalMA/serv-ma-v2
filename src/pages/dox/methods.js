// src/pages/dox/methods.js
import { serviceHttp } from "../../utils/serviceHttp";
import axios from "axios";

export default {
  /**
   * Carga los comandos disponibles y el balance de créditos
   */
  async loadCommands() {
    this.loadingCommands = true;
    try {
      const { data } = await serviceHttp.get("/dox/commands");
      if (data?.ok) {
        this.commands = data.commands || [];
        this.credits = data.credits || 0;
      } else {
        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.error || "Error cargando comandos",
        });
      }
    } catch (error) {
      console.error("[DoxMA] Error cargando comandos:", error);
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Error de conexión al cargar comandos",
      });
    } finally {
      this.loadingCommands = false;
    }
  },

  /**
   * Cuando se selecciona un comando, resetea parámetros y resultado
   */
  onCommandChange(cmd) {
    this.paramValues = {};
    this.photoFile = null;
    this.photoPreview = null;
    this.result = null;
    this.resultError = null;

    // Inicializar valores vacíos para cada parámetro (excepto photo)
    if (cmd && cmd.params) {
      cmd.params.forEach((p) => {
        if (p.type !== "photo") {
          this.paramValues[p.name] = "";
        }
      });
    }
  },

  /**
   * Abre el file picker de foto (ref dentro de v-for devuelve array)
   */
  triggerPhotoInput() {
    const ref = this.$refs.photoInput;
    const el = Array.isArray(ref) ? ref[0] : ref;
    if (el) el.click();
  },

  /**
   * Maneja la selección de foto desde el input file
   */
  onPhotoSelected(file) {
    if (!file) {
      this.photoFile = null;
      this.photoPreview = null;
      return;
    }

    // Validar tamaño (máx 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "La imagen no debe superar 10 MB",
      });
      this.photoFile = null;
      this.photoPreview = null;
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: "Solo se permiten archivos de imagen",
      });
      this.photoFile = null;
      this.photoPreview = null;
      return;
    }

    this.photoFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  /**
   * Elimina la foto seleccionada
   */
  removePhoto() {
    this.photoFile = null;
    this.photoPreview = null;
  },

  /**
   * Verifica si el formulario es válido para ejecutar
   */
  canExecute() {
    if (!this.selectedCommand) return false;
    if (this.isExecuting) return false;

    const cmd = this.selectedCommand;

    // Verificar créditos
    if (cmd.creditCost > 0 && this.credits < cmd.creditCost) return false;

    // Verificar foto requerida
    if (cmd.requiresPhoto && !this.photoFile) return false;

    // Verificar parámetros requeridos (excepto photo)
    if (cmd.params) {
      for (const p of cmd.params) {
        if (p.type === "photo") continue;
        if (
          p.required &&
          (!this.paramValues[p.name] || this.paramValues[p.name].trim() === "")
        ) {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Ejecuta el comando seleccionado
   */
  async executeCommand() {
    if (!this.canExecute()) return;

    const cmd = this.selectedCommand;
    this.isExecuting = true;
    this.result = null;
    this.resultError = null;
    this.queueWait = false;

    // Mostrar mensaje de espera si la cola está ocupada
    this.queueTimer = setTimeout(() => {
      if (this.isExecuting) {
        this.queueWait = true;
      }
    }, 5000);

    try {
      let response;

      if (cmd.requiresPhoto) {
        // Envío multipart/form-data
        const formData = new FormData();
        formData.append("command", cmd.value);

        // Solo enviar params de texto (excluir photo del JSON)
        const textParams = {};
        if (cmd.params) {
          cmd.params.forEach((p) => {
            if (p.type !== "photo" && this.paramValues[p.name]) {
              textParams[p.name] = this.paramValues[p.name];
            }
          });
        }
        formData.append("params", JSON.stringify(textParams));

        // Adjuntar foto
        if (this.photoFile) {
          formData.append("photo", this.photoFile);
        }

        // Usar axios directo para multipart (no poner Content-Type, el browser lo pone con boundary)
        response = await axios.post(
          `${process.env.API_BACKEND}dox/execute`,
          formData,
          {
            withCredentials: true,
            timeout: 180000,
          }
        );
        response = { data: response.data };
      } else {
        // Envío JSON estándar
        response = await serviceHttp.post("/dox/execute", {
          command: cmd.value,
          params: this.paramValues,
        });
      }

      const data = response.data;

      if (data?.ok) {
        this.result = data;

        // Actualizar créditos si se consumieron
        if (data.credits) {
          this.credits = data.credits.balanceAfter;
        }

        this.$q.notify({
          color: "green-8",
          textColor: "white",
          icon: "check_circle",
          message: `Comando "${cmd.label}" ejecutado correctamente`,
        });
      } else {
        this.resultError = data?.error || "Error desconocido";

        // Si fue error de créditos, actualizar balance
        if (data?.credits !== undefined) {
          this.credits = data.credits;
        }

        this.$q.notify({
          color: "red-8",
          textColor: "white",
          icon: "error",
          message: data?.error || "Error al ejecutar comando",
        });
      }
    } catch (error) {
      console.error("[DoxMA] Error ejecutando comando:", error);
      const errData = error?.response?.data || error?.data;
      this.resultError = errData?.error || error.message || "Error de conexión";

      if (errData?.details) {
        this.resultError += ": " + errData.details.join(", ");
      }

      this.$q.notify({
        color: "red-8",
        textColor: "white",
        icon: "error",
        message: this.resultError,
      });
    } finally {
      this.isExecuting = false;
      this.queueWait = false;
      if (this.queueTimer) {
        clearTimeout(this.queueTimer);
        this.queueTimer = null;
      }
    }
  },

  /**
   * Descarga el PDF del resultado
   */
  downloadPdf() {
    if (!this.result?.pdf) return;

    const byteCharacters = atob(this.result.pdf.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = this.result.pdf.fileName || "resultado.pdf";
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Carga el historial de créditos
   */
  async loadCreditHistory() {
    this.showHistory = true;
    this.loadingHistory = true;
    try {
      const { data } = await serviceHttp.get("/dox/credits/history?limit=50");
      if (data?.ok) {
        this.creditHistory = data.transactions || [];
        this.credits = data.credits || this.credits;
      }
    } catch (error) {
      console.error("[DoxMA] Error cargando historial:", error);
    } finally {
      this.loadingHistory = false;
    }
  },

  /**
   * Carga el resumen de uso
   */
  async loadUsageSummary() {
    this.showSummary = true;
    this.loadingSummary = true;
    try {
      const { data } = await serviceHttp.get("/dox/credits/summary");
      if (data?.ok) {
        this.usageSummary = data.usage || [];
        this.credits = data.credits || this.credits;
      }
    } catch (error) {
      console.error("[DoxMA] Error cargando resumen:", error);
    } finally {
      this.loadingSummary = false;
    }
  },

  /**
   * Abre el popup de zoom de foto de una persona
   */
  openPhotoZoom(person) {
    this.zoomedPerson = person;
    this.showPhotoZoom = true;
  },

  /**
   * Formatea timestamp a fecha legible
   */
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    });
  },

  /**
   * Formatea las keys camelCase de DNI a texto legible
   * Ej: "fechaNacimiento" → "Fecha Nacimiento", "dni" → "DNI"
   */
  formatDniKey(key) {
    const map = {
      dni: "DNI",
      digitoVerificador: "Dígito Verificador",
      apellidos: "Apellidos",
      nombres: "Nombres",
      genero: "Género",
      fecha: "Fecha",
      edad: "Edad",
      departamento: "Departamento",
      provincia: "Provincia",
      distrito: "Distrito",
      gradoInstruccion: "Grado Instrucción",
      estadoCivil: "Estado Civil",
      estatura: "Estatura",
      fechaInscripcion: "Fecha Inscripción",
      fechaEmision: "Fecha Emisión",
      fechaCaducidad: "Fecha Caducidad",
      padre: "Padre",
      madre: "Madre",
      restriccion: "Restricción",
      direccion: "Dirección",
      ubigeoReniec: "Ubigeo RENIEC",
      ubigeoInei: "Ubigeo INEI",
      codigoPostal: "Código Postal",
      matrimonio: "Acta Matrimonio",
      nacimiento: "Acta Nacimiento",
      defuncion: "Acta Defunción",
      certNacVivo: "Cert. Nacido Vivo",
    };
    if (map[key]) return map[key];
    // Fallback: camelCase → Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  },
};
