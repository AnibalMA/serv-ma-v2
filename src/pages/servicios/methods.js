// src/pages/servicios/methods.js
import { serviceHttp } from "../../utils/serviceHttp";
import { useMessages } from "./composables/useMessages";
import MessageDisplay from "./components/MessageDisplay.vue";

const { messages, isTyping, addMessage, clearMessages } = useMessages();
export default {
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
        console.log(data);

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

          console.log(this.arr_platforms_u);
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
  },
  getServicesByPlatform(platform) {
    this.$q.loading.show();

    serviceHttp
      .post(`/platform_options`, { platform })
      .then(({ data }) => {
        console.log(data);

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

          console.log(this.services);
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
  async requestService() {
    this.$q.loading.show();
    try {
      const { data } = await serviceHttp.post(`/platform_request`, {
        platform: this.selectedPlatform.value,
        sAction: "/" + this.selectedService.value,
      });

      this.$q.loading.hide();

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

  async addMessageWithDelay(content) {
    let iDelay = 500;
    await new Promise((resolve) => setTimeout(resolve, iDelay));
    this.messageList.push(content);

    // Scroll al final
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
  copiarAlPortapapeles(sText) {
    navigator.clipboard.writeText(sText).then(() => {
      this.$q.notify({
        message: "Texto copiado",
        color: "positive",
        icon: "check",
        position: "top",
      });
    });
  },
};
