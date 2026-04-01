import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";

export default {
  data,
  methods,
  created() {
    if (this.checkAdminAccess()) {
      this.getUsers();
    }
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
};
