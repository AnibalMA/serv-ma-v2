// src/pages/servicios/methods.js
import { serviceHttp } from "../../utils/serviceHttp";
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

  getPlatformsByUser() {
    this.$q.loading.show();

    serviceHttp
      .get(`/user_plataformas/3`)
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        this.arr_platforms_u = data?.data || [];

        this.arr_platforms_u.forEach((value, index) => {
          value.icon = value.link_asset;
          value.label = value.desc_plataforma;
          value.value = value.IdPlataforma;
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
      .post(`/platform_options`, { platformId: platform })
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
  requestService() {
    this.$q.loading.show();

    serviceHttp
      .post(`/platform_request`, {
        platformId: this.selectedPlatform.value,
        sAction: "/" + this.selectedService.value,
      })
      .then(({ data }) => {
        console.log(data);

        this.$q.loading.hide();

        this.oResult = "<br>" + data.sMessage + data.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
