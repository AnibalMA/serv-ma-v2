import { serviceHttp } from "src/utils/serviceHttp";
import { renderGoogleButton } from "src/utils/googleSignIn";
import { squareImageBlob } from "src/utils/compressImage";
import { getPresetKey } from "src/utils/avatar";
import {
  AVATAR_PHOTO_MAX_UPLOAD,
  cleanProfileForm,
  getAvatarPhotoError,
  getPasswordChangeError,
  getProfileErrorMessage,
  profileFormFromUser,
} from "./helpers";

export default {
  async chooseAvatar(key) {
    if (this.avatarAction) return;
    if (getPresetKey(this.user) === key) {
      this.showAvatarPicker = false;
      return;
    }

    const saved = await this.saveAvatar(
      "preset",
      () => serviceHttp.put("/my-avatar", { preset: key }),
      "No se pudo cambiar tu avatar. Intenta nuevamente."
    );
    if (saved) this.showAvatarPicker = false;
  },
  onAvatarFilePicked(event) {
    const file = event.target.files?.[0];
    // Empty the input, so picking the same photo again also works
    event.target.value = "";
    this.uploadAvatarPhoto(file);
  },
  async uploadAvatarPhoto(file) {
    if (this.avatarAction) return;
    if (!file) return;

    const fileError = getAvatarPhotoError(file);
    if (fileError) {
      this.$q.notify({ type: "negative", message: fileError });
      return;
    }

    this.avatarAction = "photo";
    const photo = await squareImageBlob(file).catch((error) => {
      console.error(error);
      return null;
    });
    if (!photo || photo.size > AVATAR_PHOTO_MAX_UPLOAD) {
      this.avatarAction = "";
      this.$q.notify({
        type: "negative",
        message: "No se pudo preparar tu foto. Prueba con otra imagen JPG o PNG.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", photo, "avatar.jpg");
    await this.saveAvatar(
      "photo",
      () => serviceHttp.post("/my-avatar/photo", formData),
      "No se pudo subir tu foto. Intenta nuevamente."
    );
  },
  async resetAvatar() {
    if (this.avatarAction) return;
    await this.saveAvatar(
      "reset",
      () => serviceHttp.delete("/my-avatar"),
      "No se pudo quitar tu avatar. Intenta nuevamente."
    );
  },
  // Sends one avatar request and saves the avatar the server answered.
  // "action" (preset, photo or reset) tells the page which button is loading.
  // Returns true when it was saved.
  async saveAvatar(action, request, errorMessage) {
    this.avatarAction = action;
    try {
      const { data } = await request();

      if (data?.ok) {
        // An answer without "avatar" must not wipe the one we have
        const answer = data.data || {};
        if ("avatar" in answer) {
          this.userStore.setUser({ ...this.user, avatar: answer.avatar });
        }
        this.$q.notify({
          type: "positive",
          message: data.sMessage || "Tu avatar se actualizó",
        });
        return true;
      }
      this.$q.notify({ type: "negative", message: data?.sMessage || errorMessage });
    } catch (error) {
      console.error(error);
      this.$q.notify({
        type: "negative",
        message: error.response?.data?.sMessage || errorMessage,
      });
    } finally {
      this.avatarAction = "";
    }
    return false;
  },
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
        // Built again from the saved user, so género stays in the form
        this.profileForm = profileFormFromUser({ ...this.user, ...changes });
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
