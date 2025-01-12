import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";

export default {
  login() {
    this.$q.loading.show();

    serviceHttp
      .post("/loginUser", {
        sEmail: this.email,
        sPwd: this.password,
      })
      .then(({ data }) => {
        this.$q.loading.hide();

        if (data?.ok) {
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
        } else {
          this.$q.notify({
            color: "red-8",
            textColor: "white",
            icon: "error",
            message: data?.sMessage,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.$q.loading.hide();
      });

    console.log("Iniciando sesión...");
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
        // Agregar botón adicional para regresar
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
        }
      });
  },
};
