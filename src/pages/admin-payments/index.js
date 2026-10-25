import data from "./data";
import methods from "./methods";
import PaymentOptionDialog from "./components/PaymentOptionDialog.vue";
import PaymentOptionsTab from "./components/PaymentOptionsTab.vue";
import { useUserStore } from "stores/user";

export default {
  components: { PaymentOptionDialog, PaymentOptionsTab },
  data,
  methods,
  created() {
    if (this.checkAdminAccess()) {
      this.loadPaymentRequests();
      this.loadPaymentOptions();
    }
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
};
