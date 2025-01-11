// src/pages/servicios/index.js
import data from "./data";
import methods from "./methods";

export default {
  name: "ServiciosPage",
  data,
  methods,
  mounted() {
    this.getPlatformsByUser();
    window.$q = this.$q;
  },
};
