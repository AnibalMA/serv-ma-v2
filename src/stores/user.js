import { defineStore } from "pinia";
import { LocalStorage } from "quasar";

export const useUserStore = defineStore("User", {
  state: () => ({
    oUser: LocalStorage.getItem("user"),
    sToken: "",
  }),
  actions: {
    setUser(oUser) {
      this.sToken = oUser?.sToken || "";
      LocalStorage.set("-oUI", btoa(JSON.stringify(oUser ? oUser : {})));
      this.oUser = LocalStorage.getItem("-oUI");
    },
    getUser() {
      return this.oUser
        ? JSON.parse(atob(this.oUser))
        : LocalStorage.getItem("-oUI")
        ? JSON.parse(atob(LocalStorage.getItem("-oUI")))
        : {};
    },
    getToken() {
      return this.sToken;
    },
    getRols() {
      return this.oUser
        ? JSON.parse(atob(this.oUser)).aOpcMenuNew
        : LocalStorage.getItem("-oUI")
        ? JSON.parse(atob(LocalStorage.getItem("-oUI"))).aOpcMenuNew
        : [];
    },
    getTheme() {
      return this.oUser
        ? JSON.parse(atob(this.oUser)).theme
        : LocalStorage.getItem("-oUI")
        ? JSON.parse(atob(LocalStorage.getItem("-oUI"))).theme
        : "light";
    },
    setTheme(theme) {
      this.oUser = this.getUser();
      this.oUser.theme = theme;
      LocalStorage.set("-oUI", btoa(JSON.stringify(this.oUser)));
      this.oUser = LocalStorage.getItem("-oUI");
    },
    logout() {
      LocalStorage.remove("-oUI");
      this.oUser = null;
      this.sToken = "";
    },
  },
});
