<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-login">
        <q-card class="q-pa-md shadow-2 card-login" style="width: 350px">
          <q-card-section class="text-center">
            <div class="text-h5 text-weight-bold">Cambiar contraseña</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="password"
              dense
              outlined
              :type="isPwd ? 'password' : 'text'"
              label="Nueva contraseña"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <q-input
              v-model="confirmPassword"
              dense
              outlined
              :type="isPwd ? 'password' : 'text'"
              label="Confirmar contraseña"
              class="q-mt-md"
            />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              class="q-mb-md full-width"
              color="primary"
              label="Cambiar contraseña"
              @click="changePassword"
            />
            <q-btn
              class="full-width"
              color="secondary"
              label="Regresar al login"
              @click="
                useUserStore().logout();
                $router.push('/login');
              "
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { serviceHttp } from "../../utils/serviceHttp";
import { useUserStore } from "src/stores/user";

export default {
  name: "ResetPassword",
  data() {
    return {
      password: "",
      confirmPassword: "",
      isPwd: true,
      token: "",
    };
  },
  created() {
    // Obtener token desde params en lugar de query
    this.token = this.$route.params.token;
    if (!this.token) {
      this.$router.push("/login");
      this.$q.notify({
        type: "negative",
        message: "Token de recuperación inválido",
      });
    }
  },
  methods: {
    useUserStore,
    async changePassword() {
      if (!this.password || !this.confirmPassword) {
        this.$q.notify({
          type: "negative",
          message: "Por favor complete todos los campos",
        });
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.$q.notify({
          type: "negative",
          message: "Las contraseñas no coinciden",
        });
        return;
      }

      // Mostrar loading
      this.$q.loading.show({
        message: "Cambiando contraseña...",
        spinnerSize: "3rem",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
      });

      try {
        let resCP = await serviceHttp.post("/cambiarPassword", {
          token: this.token,
          newPassword: this.password,
        });

        if (resCP.data.ok) {
          this.$q.notify({
            type: "positive",
            message: resCP.data.sMessage,
          });
          this.$router.push("/login");
        } else {
          this.$q.notify({
            type: "negative",
            message: resCP.data.sMessage,
          });
        }
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message:
            error.response?.data?.message || "Error al cambiar la contraseña",
        });
      } finally {
        // Ocultar loading
        this.$q.loading.hide();
      }
    },
  },
};
</script>
