import data from "./data";
import methods from "./methods";
import { profileRules } from "./helpers";
import { useUserStore } from "stores/user";
import { GOOGLE_CLIENT_ID } from "src/utils/googleSignIn";

export default {
  name: "PerfilPage",
  data,
  methods,
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
      profileRules,
      // Fixed at build time: no GOOGLE_CLIENT_ID = no Google section
      isGoogleEnabled: Boolean(GOOGLE_CLIENT_ID),
    };
  },
  computed: {
    user() {
      return this.userStore.user || {};
    },
    isGoogleLinked() {
      return Boolean(this.user.bGoogleLinked);
    },
  },
  watch: {
    // After unlinking, the Google button area shows up again
    isGoogleLinked() {
      this.$nextTick(() => this.showGoogleButton());
    },
  },
  mounted() {
    this.showGoogleButton();
  },
};
