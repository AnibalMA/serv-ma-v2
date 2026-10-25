import data from "./data";
import methods from "./methods";
import { GENDER_OPTIONS, profileRules } from "./helpers";
import { useUserStore } from "stores/user";
import { GOOGLE_CLIENT_ID } from "src/utils/googleSignIn";
import {
  AVATAR_PRESETS,
  getPresetKey,
  isCustomAvatar,
  presetSrc,
} from "src/utils/avatar";
import UserAvatar from "components/UserAvatar.vue";

export default {
  name: "PerfilPage",
  components: { UserAvatar },
  data,
  methods,
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
      profileRules,
      genderOptions: GENDER_OPTIONS,
      // The avatars shown in "Elegir avatar"
      avatarOptions: AVATAR_PRESETS.map((key, index) => ({
        key,
        src: presetSrc(key),
        label: "Avatar " + (index + 1),
      })),
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
    currentPresetKey() {
      return getPresetKey(this.user);
    },
    focusedPresetKey() {
      return this.currentPresetKey || AVATAR_PRESETS[0];
    },
    hasCustomAvatar() {
      return isCustomAvatar(this.user);
    },
    isSavingAvatar() {
      return Boolean(this.avatarAction);
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
