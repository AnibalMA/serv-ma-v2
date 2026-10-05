import data from "./data";
import methods from "./methods";
import { operationNumberRules, toCloudinaryDownloadUrl } from "./helpers";
import { getAmountToPay } from "src/utils/boletas";
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
      operationNumberRules,
    };
  },
  computed: {
    amountToPay() {
      return getAmountToPay(this.selectedBoleta);
    },
    // Link that downloads the QR on Android (to pick it from the gallery in Yape)
    qrDownloadUrl() {
      return toCloudinaryDownloadUrl(this.selectedPaymentMethod?.qr_url);
    },
  },
};
