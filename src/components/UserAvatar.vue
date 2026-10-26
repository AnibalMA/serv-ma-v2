<template>
  <q-avatar :size="size">
    <img :src="src" alt="Tu avatar" @error="failed = true" />
  </q-avatar>
</template>

<script>
import boyImage from "src/assets/boy-avatar.png";
import girlImage from "src/assets/girl-avatar.png";
import { getAvatarSrc, getDefaultAvatarSrc } from "src/utils/avatar";

const DEFAULTS = { boy: boyImage, girl: girlImage };

export default {
  name: "UserAvatar",
  props: {
    user: {
      type: Object,
      default: null,
    },
    size: {
      type: String,
      default: "56px",
    },
  },
  data() {
    return {
      // A photo that cannot load (deleted, no internet) shows the default picture
      failed: false,
    };
  },
  computed: {
    src() {
      return this.failed
        ? getDefaultAvatarSrc(this.user, DEFAULTS)
        : getAvatarSrc(this.user, DEFAULTS);
    },
  },
  watch: {
    // A new avatar gets a new chance to load
    "user.avatar"() {
      this.failed = false;
    },
  },
};
</script>
