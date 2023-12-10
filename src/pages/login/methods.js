import { useUserStore } from "src/stores/user";
import { serviceHttp } from "../../utils/serviceHttp";

export default {
    login() {
        this.$q.loading.show();

        serviceHttp.post("/loginUser", {
            sEmail: this.email,
            sPwd: this.password
        }).then(({ data }) => {
            console.log(data);

            this.$q.loading.hide();

            if (data?.ok) {
                this.$q.notify({
                    color: "green-8",
                    textColor: "white",
                    icon: "check_circle",
                    message: data?.sMessage
                });

                useUserStore().setUser(data?.data || {});

                this.$router.replace("/dashboard");
            } else {
                this.$q.notify({
                    color: "red-8",
                    textColor: "white",
                    icon: "error",
                    message: data?.sMessage
                });
            }
        }).catch(error => {
            console.log(error);
        });

        console.log("Iniciando sesión...");
    },
    forgotPassword() {
        // Lógica para recuperar la contraseña
        console.log("Olvidaste tu contraseña?");
    }
}