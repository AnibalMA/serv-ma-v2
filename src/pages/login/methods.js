import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";
import { renderGoogleButton } from "src/utils/googleSignIn";
import { renderTurnstile, resetTurnstile } from "src/utils/turnstile";

export default {
  async login() {
    // Pressing Enter also calls this, so respect the disabled button
    if (this.isLoginDisabled) return;

    this.isLoggingIn = true;
    this.$q.loading.show();
    try {
      const { data } = await serviceHttp.post("/loginUser", {
        sEmail: this.email,
        sPwd: this.password,
        sTurnstileToken: this.turnstileToken,
      });

      if (data?.ok) {
        this.onLoginSuccess(data);
      } else {
        // Wrong credentials come back as 200 with ok: false
        this.onLoginError(data?.sMessage);
        this.getNewTurnstileToken();
      }
    } catch (error) {
      console.error(error);
      this.onLoginError(error.response?.data?.sMessage);
      this.getNewTurnstileToken();
    } finally {
      this.isLoggingIn = false;
      this.$q.loading.hide();
    }
  },
  async loginWithGoogle(credential) {
    if (this.isLoggingIn) return;

    this.isLoggingIn = true;
    this.$q.loading.show();
    try {
      const { data } = await serviceHttp.post("/loginGoogle", { credential });

      if (data?.ok) {
        this.onLoginSuccess(data);
      } else {
        this.onLoginError(data?.sMessage);
      }
    } catch (error) {
      console.error(error);
      this.onLoginError(error.response?.data?.sMessage);
    } finally {
      this.isLoggingIn = false;
      this.$q.loading.hide();
    }
  },
  // Same steps for the password login and the Google login
  onLoginSuccess(data) {
    if (data?.data?.bFirstTime) {
      this.$q.notify({
        color: "warning",
        textColor: "white",
        icon: "warning",
        message: "Por favor, cambia tu contraseña inicial",
      });
      this.$router.replace("/reset-password/" + data?.data?.sTokenPwd);
    } else {
      this.$q.notify({
        color: "green-8",
        textColor: "white",
        icon: "check_circle",
        message: data?.sMessage,
      });

      useUserStore().setUser(data?.data || {});
      this.$router.replace("/dashboard");
    }
  },
  onLoginError(message) {
    this.$q.notify({
      color: "red-8",
      textColor: "white",
      icon: "error",
      message: message || "No se pudo iniciar sesión. Intenta nuevamente.",
    });
  },
  async setupTurnstile() {
    if (!this.isTurnstileEnabled) return;

    try {
      this.turnstileWidgetId = await renderTurnstile(
        this.$refs.turnstile,
        (token) => {
          this.turnstileToken = token;
        }
      );
    } catch (error) {
      console.error(error);
      this.turnstileError =
        "No se pudo cargar la verificación anti-robots. Recarga la página.";
    }
  },
  // Each Turnstile token works only once
  getNewTurnstileToken() {
    this.turnstileToken = "";
    resetTurnstile(this.turnstileWidgetId);
  },
  async setupGoogleButton() {
    if (!this.isGoogleEnabled) return;

    try {
      await renderGoogleButton(
        this.$refs.googleButton,
        (credential) => this.loginWithGoogle(credential),
        { text: "continue_with" }
      );
    } catch (error) {
      // e.g. an ad-blocker; the password login still works
      console.error(error);
      this.googleError =
        "No se pudo cargar el botón de Google. Puedes ingresar con tu correo y contraseña.";
    }
  },
  forgotPassword() {
    this.$q
      .dialog({
        title: "Recuperar contraseña",
        message: "Ingresa tu correo electrónico para recuperar tu contraseña",
        prompt: {
          model: "",
          type: "email",
          isValid: (val) => !!val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        },
        cancel: true,
        persistent: true,
        ok: {
          label: "Enviar",
          color: "primary",
        },
        cancel: {
          label: "Cancelar",
          color: "negative",
        },
        buttons: [
          {
            label: "Regresar al login",
            color: "secondary",
            handler: () => {
              this.$router.push("/login");
            },
          },
        ],
      })
      .onOk(async (sEmail) => {
        // Mostrar loading
        this.$q.loading.show({
          message: "Procesando solicitud...",
          spinnerSize: "3rem",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        });

        try {
          let oResRP = await serviceHttp.post("/recuperarPassword", { sEmail });

          if (oResRP.data.ok) {
            this.$q.notify({
              type: "positive",
              message: oResRP.data.sMessage,
            });
          } else {
            this.$q.notify({
              type: "negative",
              message: oResRP.data.sMessage,
            });
          }
        } catch (error) {
          this.$q.notify({
            type: "negative",
            message:
              error.response?.data?.message ||
              "Error al enviar el correo de recuperación",
          });
          console.error(error);
        } finally {
          // Ocultar loading
          this.$q.loading.hide();
        }
      });
  },
};
