import { defineStore } from "pinia";
import { LocalStorage } from "quasar";

function parseUser() {
  try {
    const raw = LocalStorage.getItem("-oUI");
    return raw ? JSON.parse(atob(raw)) : null;
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
      LocalStorage.set("-oUI", btoa(JSON.stringify(parsed)));
    },
    setTheme(theme) {
      if (this.oUser) {
        this.oUser.theme = theme;
        LocalStorage.set("-oUI", btoa(JSON.stringify(this.oUser)));
      }
    },
    logout() {
      this.oUser = null;
      LocalStorage.remove("-oUI");
    },
  },
});
