import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";

export default {
  data,
  methods,
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  mounted() {
    this.getBoletasPendientes();
  },
};
