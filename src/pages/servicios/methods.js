// src/pages/servicios/methods.js
import { serviceHttp } from "../../utils/serviceHttp";
import { sanitize } from "src/utils/sanitize";

// Variable para almacenar la referencia al socket del layout
let socketInstance = null;

export default {
  sanitizeHtml(html) {
    return sanitize(html);
  },
  // Método para obtener la instancia del socket desde el layout padre
  getSocketFromParent() {
    // Buscar el componente MainLayout que tiene el socket
    let parent = this.$parent;
    while (parent) {
      if (parent.socket) {
        return parent.socket;
      }
      parent = parent.$parent;
    }
    return null;
  },
  onPlatformChange(platform) {
    this.selectedService = null;
    this.loadingServices = true;

    // Simular carga de servicios según la plataforma
    setTimeout(() => {
      this.services = this.getServicesByPlatform(platform.value);
      this.loadingServices = false;
    }, 500);
  },
  onServiceChange(service) {
    this.selectedService = service;
    this.oResult = "👆 Esperando solicitud...";
    this.messageList = [
      `<div class="text-info q-mt-sm">👆 Esperando solicitud...</div>`,
    ];
  },
  getPlatformsByUser() {
    this.$q.loading.show();

    serviceHttp
      .get(`/user_plataformas`)
      .then(({ data }) => {
        this.$q.loading.hide();

        this.arr_platforms_u = data?.data || [];

        this.arr_platforms_u.forEach((value, index) => {
          value.icon = value.link_asset;
          value.label = value.desc_plataforma;
          value.value = value.cod_plataforma;
        });

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });
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
          message: "Error al cargar tus plataformas",
        });
      });
  },
  getServicesByPlatform(platform) {
    this.$q.loading.show();

    serviceHttp
      .post(`/platform_options`, { platform })
      .then(({ data }) => {
        this.$q.loading.hide();

        this.services = data?.data || [];

        this.services.forEach((value, index) => {
          value.label = value.option_desc;
          value.value = value.option;
        });

        if (data?.ok) {
          this.$q.notify({
            color: "green-8",
            textColor: "white",
            icon: "check_circle",
            message: data?.sMessage,
          });

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
          message: "Error al cargar las opciones de la plataforma",
        });
      });
  },
  getHeaderHtml(aHeaders) {
    let sMessage = "";
    aHeaders.forEach((value) => {
      sMessage += value.sContent;
    });

    return sMessage;
  },
  getFooterHtml(aFooters) {
    let sMessage = "";
    aFooters.forEach((value) => {
      sMessage += value.sContent;
    });

    return sMessage;
  },
  async requestService(oEvent, oData) {
    // Si la acción es automate_tv_login y no se ha proporcionado el código, solicitarlo
    if (!oData && this.selectedService.value === "automate_tv_login") {
      this.$q
        .dialog({
          title: "📺 Código de TV",
          message:
            "Por favor, ingresa el código de 8 dígitos que aparece en tu TV (ejemplo: 1234-4321):",
          prompt: {
            model: "",
            type: "text",
            mask: "####-####",
            placeholder: "1234-4321",
            maxlength: 9,
          },
          persistent: true,
          cancel: true,
        })
        .onOk((tvCode) => {
          // Eliminar el guión y validar que sean 8 dígitos
          const cleanCode = tvCode.replace("-", "");
          if (
            cleanCode &&
            cleanCode.length === 8 &&
            /^\d{8}$/.test(cleanCode)
          ) {
            this.requestService(null, {
              platform: this.selectedPlatform.value,
              sAction: "/" + this.selectedService.value,
              sTvCode: cleanCode,
            });
          } else {
            this.$q.notify({
              color: "red-8",
              textColor: "white",
              icon: "error",
              message: "Por favor ingresa un código válido de 8 dígitos",
            });
          }
        })
        .onCancel(() => {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "info",
            message: "Operación cancelada",
          });
        });
      return;
    }

    // 👇 CONFIGURAR LISTENER DE WEBSOCKET SEGÚN LA ACCIÓN
    const websocketActions = [
      "automate_tv_login",
      "active_login",
      "active_hogar_upd",
      "active_hogar_change",
      "get_code_temporal",
      "get_code",
    ];

    const currentAction = this.selectedService.value;

    if (websocketActions.includes(currentAction)) {
      // Obtener socket del layout padre
      socketInstance = this.getSocketFromParent();

      if (socketInstance && socketInstance.connected) {
        // console.log(`✅ Socket disponible para ${currentAction}`);

        // Determinar qué evento escuchar según la acción
        const eventName =
          currentAction === "automate_tv_login"
            ? "tv_login_progress"
            : "email_check_progress";

        // Remover listeners anteriores para evitar duplicados
        socketInstance.off("tv_login_progress");
        socketInstance.off("email_check_progress");

        // Escuchar actualizaciones del proceso
        socketInstance.on(eventName, (data) => {
          // console.log(`📡 Actualización [${eventName}] recibida:`, data.step);

          // Agregar mensajes al UI en tiempo real
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((item) => {
              this.addMessageWithDelay(item.sContent, 100); // Delay corto para WebSocket
            });
          }
        });

        // console.log(`🎧 Listener configurado para evento: ${eventName}`);
      } else {
        console.warn(
          "⚠️ Socket no disponible - Las actualizaciones en tiempo real no estarán disponibles"
        );
      }
    }

    this.$q.loading.show();
    try {
      const { data } = await serviceHttp.post(
        `/platform_request`,
        oData
          ? oData
          : {
              platform: this.selectedPlatform.value,
              sAction: "/" + this.selectedService.value,
            }
      );

      this.$q.loading.hide();
      if (data.hasMultipleEmails) {
        if (!Array.isArray(data.data) || data.data.length === 0) {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: "No se encontraron correos electrónicos",
          });
          return;
        }

        const emailOptions = data.data.map((email) => {
          const emailStr = String(email);
          return {
            label: emailStr,
            value: emailStr,
          };
        });

        this.$q
          .dialog({
            title: "👤 Selecciona una cuenta",
            message:
              "🔍 Hemos detectado múltiples cuentas asociadas. Por favor, selecciona una:",
            options: {
              type: "radio",
              model: "",
              items: emailOptions,
            },
            persistent: true,
            cancel: true,
          })
          .onOk((selectedEmail) => {
            if (selectedEmail) {
              const requestData = {
                platform: this.selectedPlatform.value,
                sAction: "/" + this.selectedService.value,
                sEmail: selectedEmail,
              };

              // Si oData tiene sTvCode, incluirlo en la nueva solicitud
              if (oData && oData.sTvCode) {
                requestData.sTvCode = oData.sTvCode;
              }

              this.requestService(null, requestData);
            } else {
              this.$q.notify({
                color: "red-8",
                textColor: "white",
                icon: "error",
                message: "No se seleccionó ninguna cuenta",
              });
            }
          })
          .onCancel(() => {
            this.$q.notify({
              color: "red-8",
              textColor: "white",
              icon: "error",
              message: "Servicio cancelado. No se seleccionó ninguna cuenta",
            });
          });
      } else {
        if (Array.isArray(data.data)) {
          // Limpiar mensajes anteriores
          this.messageList = [];

          // Procesar cada mensaje
          for (const item of data.data) {
            // if (!item.bContainer) {
            await this.addMessageWithDelay(item.sContent);
            // }
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.$q.loading.hide();

      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.data &&
        Array.isArray(error.response.data.data)
      ) {
        this.messageList = [];
        for (const item of error.response.data.data) {
          await this.addMessageWithDelay(item.sContent);
        }
      } else {
        this.messageList = [
          `<div class="text-negative q-pa-md">Error: ${error.message}</div>`,
        ];
      }
    }
  },

  async addMessageWithDelay(content, customDelay = null) {
    let iDelay = customDelay !== null ? customDelay : 500;
    await new Promise((resolve) => setTimeout(resolve, iDelay));
    this.messageList.push(content);

    this.$nextTick(() => {
      const container = document.querySelector(".message-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    if (content.includes("Procesando")) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  },
};
