import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";

export default {
  data,
  methods,
  created() {
    if (this.checkAdminAccess()) {
      this.loadActionHistory();
    }
  },
  watch: {
    // If the user was picked first, load their services once the type needs one
    "ticketForm.tipo"(tipo) {
      if (this.ticketForm.usuario && this.needsService(tipo)) {
        this.loadUserServices(this.ticketForm.usuario);
      }
    },
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
};
