import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";

export default {
  data,
  methods,
  computed: {
    // Propiedades computadas para contar servicios por estado
    serviciosActivos() {
      return this.arr_servicios.filter(
        (servicio) => servicio.Estado === "Activo"
      );
    },
    serviciosInactivos() {
      return this.arr_servicios.filter(
        (servicio) => servicio.Estado !== "Activo"
      );
    },
  },
  created: function () {
    // this.getList("Pending");
    this.getListUsers();
  },
  setup: function () {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  watch: {
    activeTab(newTab) {
      if (
        newTab === "servicios" &&
        this.optUser?.value &&
        this.arr_servicios.length === 0
      ) {
        this.getServiciosList(this.optUser.value);
      }
    },
  },
};
