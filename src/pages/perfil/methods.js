import { serviceHttp } from "src/utils/serviceHttp";
import { renderGoogleButton } from "src/utils/googleSignIn";
import {
  cleanProfileForm,
  getPasswordChangeError,
  getProfileErrorMessage,
} from "./helpers";

export default {
  async saveProfile() {
    const changes = cleanProfileForm(this.profileForm);

    this.savingProfile = true;
    try {
      const { data } = await serviceHttp.post("/update-user-profile", {
        id_usuario: this.user.id,
        ...changes,
      });

      if (data?.ok) {
        this.userStore.setUser({ ...this.user, ...changes });
        this.profileForm = { ...changes };
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Tus datos se guardaron correctamente",
        });
      } else {
        this.$q.notify({ type: "negative", message: getProfileErrorMessage(data) });
      }
    } catch (error) {
      // Field errors (412) and other rejections (400) come here
      console.error(error);
      this.$q.notify({
        type: "negative",
        message: getProfileErrorMessage(error.response?.data),
      });
    } finally {
      this.savingProfile = false;
    }
  },
  async changePassword() {
    const errorMessage = getPasswordChangeError(this.passwordForm);
    if (errorMessage) {
      this.$q.notify({ type: "negative", message: errorMessage });
      return;
    }

    this.savingPassword = true;
    try {
      const { data } = await serviceHttp.post("/change-my-password", {
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      });

      if (data?.ok) {
        this.passwordForm = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Tu contraseña se cambió correctamente",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo cambiar la contraseña",
        });
      }
    } catch (error) {
      console.error(error);
      this.$q.notify({
        type: "negative",
        message:
          error.response?.data?.sMessage ||
          "No se pudo cambiar la contraseña. Intenta nuevamente.",
      });
    } finally {
      this.savingPassword = false;
    }
  },
  // "¿Olvidaste tu contraseña?" is on the login page, so close the session first
  async logoutToRecoverPassword() {
    try {
      await serviceHttp.post("/logout");
    } catch (error) {
      // Even if this fails, the session is closed on this device below
    }
    this.userStore.logout();
    this.$router.replace("/login");
  },
  async showGoogleButton() {
    // The button area only exists when Google is on and the account is not linked
    const el = this.$refs.googleButton;
    if (!el) return;

    this.googleError = "";
    try {
      await renderGoogleButton(el, (credential) => this.linkGoogle(credential), {
        text: "continue_with",
      });
    } catch (error) {
      console.error(error);
      this.googleError =
        "No se pudo cargar el botón de Google. Revisa tu conexión o el bloqueador de anuncios y recarga la página.";
    }
  },
  async linkGoogle(credential) {
    this.$q.loading.show({ message: "Vinculando tu cuenta de Google…" });
    try {
      const { data } = await serviceHttp.post("/link-google", { credential });

      if (data?.ok) {
        this.setGoogleStatus(data.data);
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Tu cuenta de Google quedó vinculada",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo vincular tu cuenta de Google",
        });
      }
    } catch (error) {
      console.error(error);
      this.$q.notify({
        type: "negative",
        message:
          error.response?.data?.sMessage ||
          "No se pudo vincular tu cuenta de Google. Intenta nuevamente.",
      });
    } finally {
      this.$q.loading.hide();
    }
  },
  unlinkGoogle() {
    this.$q
      .dialog({
        title: "Desvincular Google",
        message:
          "Ya no podrás entrar con " +
          (this.user.sGoogleEmail || "tu cuenta de Google") +
          ". Podrás seguir entrando con tu correo y contraseña.",
        cancel: { label: "Cancelar", flat: true },
        ok: { label: "Desvincular", color: "negative" },
        persistent: true,
      })
      .onOk(() => this.confirmUnlinkGoogle());
  },
  async confirmUnlinkGoogle() {
    this.$q.loading.show({ message: "Desvinculando tu cuenta de Google…" });
    try {
      const { data } = await serviceHttp.post("/unlink-google");

      if (data?.ok) {
        this.setGoogleStatus(data.data);
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Tu cuenta de Google se desvinculó",
        });
      } else {
        this.$q.notify({
          type: "negative",
          message: data?.sMessage || "No se pudo desvincular tu cuenta de Google",
        });
      }
    } catch (error) {
      console.error(error);
      this.$q.notify({
        type: "negative",
        message:
          error.response?.data?.sMessage ||
          "No se pudo desvincular tu cuenta de Google. Intenta nuevamente.",
      });
    } finally {
      this.$q.loading.hide();
    }
  },
  // Save what the server answered ({ bGoogleLinked, sGoogleEmail }),
  // so the page shows the real state
  setGoogleStatus(googleData) {
    this.userStore.setUser({
      ...this.user,
      bGoogleLinked: Boolean(googleData?.bGoogleLinked),
      sGoogleEmail: googleData?.sGoogleEmail || null,
    });
  },
};
