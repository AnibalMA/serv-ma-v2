import { defineStore } from "pinia";
import { LocalStorage } from "quasar";
import { encodeUser, decodeUser } from "src/utils/userStorage";

function parseUser() {
  try {
    const raw = LocalStorage.getItem("-oUI");
    return raw ? decodeUser(raw) : null;
  } catch {
    return null;
  }
}

export const useUserStore = defineStore("User", {
  state: () => ({
    oUser: parseUser(),
  }),
  getters: {
    user: (state) => state.oUser,
    rols: (state) => state.oUser?.aOpcMenuNew || [],
    theme: (state) => state.oUser?.theme || "light",
  },
  actions: {
    setUser(oUser) {
      const parsed = oUser ? oUser : {};
      this.oUser = parsed;
      LocalStorage.set("-oUI", encodeUser(parsed));
    },
    setTheme(theme) {
      if (this.oUser) {
        this.oUser.theme = theme;
        LocalStorage.set("-oUI", encodeUser(this.oUser));
      }
    },
    logout() {
      this.oUser = null;
      LocalStorage.remove("-oUI");
    },
  },
});
