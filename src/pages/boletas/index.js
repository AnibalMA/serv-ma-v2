import data from "./data";
import methods from "./methods";
import { useUserStore } from "stores/user";

export default {
  data,
  methods,
  created: function () {
    this.getList("Pending");
  },
  setup: function () {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
};
